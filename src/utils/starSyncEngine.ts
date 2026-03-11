/**
 * starSyncEngine.ts — V42-Phase 3
 * 자미두수 × 관상 하이브리드 싱크로 계산 엔진
 *
 * Sync(Star_i) = (F_target × W_archetype / σ_face) × log10(1 + DestinyRank)
 *
 * ✦ 안면 부위별 3D 계측 점수 → 별별 가중치 적용
 * ✦ 등급 판정: Legendary / Epic / Rare / Awakened
 * ✦ 관상 특징 텍스트 자동 생성 (카드 발동 멘트)
 */

export interface FacialMeasure {
    forehead?: number;    // 이마 넓이·광채 (0–100)
    eyes?: number;        // 눈매 날카로움·비대칭 (0–100)
    nose?: number;        // 코 높이·두께 (0–100)
    mouth?: number;       // 입술 두께·형태 (0–100)
    jaw?: number;         // 하악각 강도 (0–100)
    cheekbones?: number;  // 관골 볼륨 (0–100)
    cheeks?: number;      // 볼 둥근 정도 (0–100)
    brows?: number;       // 눈썹 상승각 (0–100)
    ears?: number;        // 귀 크기·귓불 (0–100)
    skin?: number;        // 피부 투명도·대칭 (0–100)
    overall?: number;     // 종합 관상 점수 (0–100)
}

interface StarWeights {
    primary: keyof FacialMeasure;      // 주요 관상 부위
    secondary: keyof FacialMeasure;    // 보조 부위
    wArchetype: number;                // 아키타입 가중치 (1.0–1.5)
    destinyRank: number;               // 명반 별 밝기 수치 (1–10)
    facialLink: string;                // 관상 연결 부위 한글 설명
}

// ── 14주성 × 관상 가중치 매트릭스 ───────────────────────────────────────

export const STAR_WEIGHTS: Record<string, StarWeights> = {
    ziwei: {
        primary: 'forehead', secondary: 'overall',
        wArchetype: 1.5, destinyRank: 10,
        facialLink: '인당(眉間) — 이마의 광활함이 제왕기를 증명합니다',
    },
    tianji: {
        primary: 'forehead', secondary: 'brows',
        wArchetype: 1.3, destinyRank: 8,
        facialLink: '이마(額) · 눈썹 — 넓은 이마가 전략지성을 담습니다',
    },
    taiyang: {
        primary: 'brows', secondary: 'forehead',
        wArchetype: 1.4, destinyRank: 9,
        facialLink: '눈썹(眉) — 상승각이 클수록 태양의 기운이 강합니다',
    },
    wuqu: {
        primary: 'mouth', secondary: 'jaw',
        wArchetype: 1.3, destinyRank: 8,
        facialLink: '입술(口) · 턱선 — 일자 입술이 금(金)기운의 결단력을 나타냅니다',
    },
    tiantong: {
        primary: 'cheeks', secondary: 'overall',
        wArchetype: 1.1, destinyRank: 6,
        facialLink: '볼(顴·頰) — 둥글고 부드러운 볼이 천동의 복덕을 담습니다',
    },
    lianzhen: {
        primary: 'nose', secondary: 'eyes',
        wArchetype: 1.3, destinyRank: 7,
        facialLink: '산근(山根) · 눈매 — 콧대의 각도가 정의로운 불꽃을 드러냅니다',
    },
    tianfu: {
        primary: 'cheekbones', secondary: 'overall',
        wArchetype: 1.2, destinyRank: 8,
        facialLink: '관골(顴骨) — 광대의 볼륨이 재고(財庫)의 그릇을 결정합니다',
    },
    taiyin: {
        primary: 'overall', secondary: 'skin',
        wArchetype: 1.2, destinyRank: 8,
        facialLink: '얼굴형(面形) · 피부 — 곡선형 윤곽이 태음의 감성을 품습니다',
    },
    tanlang: {
        primary: 'eyes', secondary: 'overall',
        wArchetype: 1.4, destinyRank: 8,
        facialLink: '눈꼬리(魚尾) — 매혹적인 눈매가 도화성(桃花星)을 현신시킵니다',
    },
    jumen: {
        primary: 'mouth', secondary: 'overall',
        wArchetype: 1.2, destinyRank: 7,
        facialLink: '입(口) — 입의 크기·형태가 거문의 언변력을 측정합니다',
    },
    tianxiang: {
        primary: 'skin', secondary: 'overall',
        wArchetype: 1.1, destinyRank: 7,
        facialLink: '피부(膚) · 대칭 — 피부 투명도가 천상의 보필 기운을 나타냅니다',
    },
    tianliang: {
        primary: 'ears', secondary: 'forehead',
        wArchetype: 1.2, destinyRank: 7,
        facialLink: '귀(耳) · 귓불 — 귀의 크기와 귓불이 천량의 장수·지혜를 담습니다',
    },
    qisha: {
        primary: 'jaw', secondary: 'eyes',
        wArchetype: 1.4, destinyRank: 9,
        facialLink: '하악각(下顎角) — 날카로운 턱선이 칠살의 고독한 투쟁을 새깁니다',
    },
    pojun: {
        primary: 'eyes', secondary: 'jaw',
        wArchetype: 1.4, destinyRank: 8,
        facialLink: '눈매(眼) — 눈의 비대칭성·강렬함이 파군의 혁명기를 증명합니다',
    },
};

// ── σ_face 정규화 (전체 관상 평균 기준 표준편차 대리값) ─────────────────

function sigma(measures: FacialMeasure): number {
    const values = Object.values(measures).filter((v): v is number => v !== undefined);
    if (values.length === 0) return 75;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.max(1, Math.sqrt(variance));
}

// ── 핵심 싱크로율 계산 ────────────────────────────────────────────────────

export function calcSync(starId: string, measures: FacialMeasure): number {
    const w = STAR_WEIGHTS[starId];
    if (!w) return 72; // 기본값

    const F_target = (
        ((measures[w.primary] ?? 70) * 0.65) +
        ((measures[w.secondary] ?? 68) * 0.35)
    );

    const σ = sigma(measures);
    const raw = (F_target * w.wArchetype / σ) * Math.log10(1 + w.destinyRank);

    // 정규화: 대략 50–98 범위로 스케일
    const normalized = Math.min(98, Math.max(50, Math.round(raw * 4.8)));
    return normalized;
}

// ── 등급 판정 ─────────────────────────────────────────────────────────────

export type SyncGrade = 'Legendary' | 'Epic' | 'Rare' | 'Awakened';

export function getSyncGrade(syncRate: number): SyncGrade {
    if (syncRate >= 92) return 'Legendary';
    if (syncRate >= 80) return 'Epic';
    if (syncRate >= 68) return 'Rare';
    return 'Awakened';
}

// ── 관상 부위 설명 멘트 생성 ─────────────────────────────────────────────

export function getSyncMessage(starId: string, syncRate: number): string {
    const w = STAR_WEIGHTS[starId];
    if (!w) return '';

    const grade = getSyncGrade(syncRate);
    const link = w.facialLink;

    if (grade === 'Legendary') {
        return `✦ "${link}"가 이 별의 기운을 완벽히 현신했습니다. 전생의 기억이 당신의 얼굴에 새겨져 있습니다.`;
    } else if (grade === 'Epic') {
        return `◈ "${link}"에서 강력한 공명이 감지됩니다. 명반과 관상이 강하게 동기화되고 있습니다.`;
    } else if (grade === 'Rare') {
        return `◉ "${link}"에 이 별의 기운이 잠재합니다. 각성의 여정이 시작되었습니다.`;
    } else {
        return `◌ "${link}"에 씨앗이 심어졌습니다. 이 별의 기운이 발현 중입니다.`;
    }
}

// ── 전체 12궁 싱크로 일괄 계산 ───────────────────────────────────────────

const PALACE_STAR: Record<string, string> = {
    ming: 'ziwei', xiongdi: 'tianji', fuqi: 'tanlang',
    zisun: 'tiantong', caibo: 'wuqu', jibing: 'lianzhen',
    qianyi: 'pojun', nucai: 'jumen', guanlu: 'taiyang',
    tiantu: 'tianfu', fude: 'tianliang', fumu: 'qisha',
};

export function calcAllSyncs(measures: FacialMeasure): Record<string, number> {
    return Object.fromEntries(
        Object.entries(PALACE_STAR).map(([palace, starId]) => [
            palace,
            calcSync(starId, measures),
        ])
    );
}

// ── 관상 수치 → 측정값 변환 유틸 ─────────────────────────────────────────

export function physiognomyToMeasures(
    physiognomy: {
        score?: number;
        facialFeatures?: {
            forehead?: string;
            eyes?: string;
            nose?: string;
            mouth?: string;
            jaw?: string;
        };
        goldenRatio?: { ratio?: number };
    }
): FacialMeasure {
    const base = physiognomy.score ?? 72;

    // 텍스트 기반 특징을 수치로 변환
    const featureToScore = (text: string | undefined, keywords: string[]): number => {
        if (!text) return base;
        const matched = keywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
        return Math.min(98, base + matched.length * 6);
    };

    const f = physiognomy.facialFeatures ?? {};

    return {
        forehead: featureToScore(f.forehead, ['넓', '높', '광활', 'broad', 'high', 'wide']),
        eyes: featureToScore(f.eyes, ['날카', '깊', '강렬', 'sharp', 'deep', 'intense']),
        nose: featureToScore(f.nose, ['두툼', '높', '강', 'prominent', 'high', 'strong']),
        mouth: featureToScore(f.mouth, ['두툼', '일자', 'full', 'straight', 'firm']),
        jaw: featureToScore(f.jaw, ['강', '각', '날카', 'strong', 'sharp', 'defined']),
        cheekbones: featureToScore(f.jaw, ['높', '볼륨', 'high', 'prominent']),
        cheeks: featureToScore(f.jaw, ['둥', '부드', 'round', 'soft', 'plump']),
        brows: featureToScore(f.forehead, ['상승', '짙', 'arched', 'thick', 'defined']),
        ears: base - 2 + Math.round(Math.random() * 8),
        skin: featureToScore(f.forehead, ['투명', '균형', 'glowing', 'symmetric', 'clear']),
        overall: base,
    };
}

export { PALACE_STAR };
