/**
 * luckyElements.ts
 * V36-Final: 오행 기반 행운 좌표 계산
 * 전통 명리학의 수(數) 배정 원칙 + 오행 색상 적용
 */

export interface LuckyData {
    numbers: number[];        // 대표 행운 숫자 2개
    colorName: string;        // 신비로운 명칭 (예: Crimson Ember)
    colorHex: string;         // 실제 색상 코드
    colorKo: string;          // 한글 색상명
    element: string;          // 오행
    elementEn: string;        // 영문 오행
    dayAdvice: string;        // 오늘의 행동 지침
}

// ── 오행별 행운 테이블 ──────────────────────────────────────────────────────
const LUCKY_TABLE: Record<string, LuckyData> = {
    // 木 (목)
    '목': {
        numbers: [3, 8],
        colorName: 'Verdant Aura',
        colorHex: '#2ecc71',
        colorKo: '생명의 초록',
        element: '목',
        elementEn: 'WOOD',
        dayAdvice: '새로운 시작과 성장에 유리한 날. 동쪽 방향으로 움직이세요.',
    },
    '木': {
        numbers: [3, 8],
        colorName: 'Verdant Aura',
        colorHex: '#2ecc71',
        colorKo: '생명의 초록',
        element: '목',
        elementEn: 'WOOD',
        dayAdvice: '새로운 시작과 성장에 유리한 날. 동쪽 방향으로 움직이세요.',
    },
    // 火 (화)
    '화': {
        numbers: [2, 7],
        colorName: 'Crimson Ember',
        colorHex: '#e74c3c',
        colorKo: '열정의 진홍',
        element: '화',
        elementEn: 'FIRE',
        dayAdvice: '열정과 표현력이 극대화되는 타이밍. 남쪽에서 기회를 포착하세요.',
    },
    '火': {
        numbers: [2, 7],
        colorName: 'Crimson Ember',
        colorHex: '#e74c3c',
        colorKo: '열정의 진홍',
        element: '화',
        elementEn: 'FIRE',
        dayAdvice: '열정과 표현력이 극대화되는 타이밍. 남쪽에서 기회를 포착하세요.',
    },
    // 土 (토)
    '토': {
        numbers: [5, 0],
        colorName: 'Amber Sanctum',
        colorHex: '#f39c12',
        colorKo: '신뢰의 황토',
        element: '토',
        elementEn: 'EARTH',
        dayAdvice: '안정과 신뢰를 쌓는 날. 중심을 지키되 중앙에서 조율하세요.',
    },
    '土': {
        numbers: [5, 0],
        colorName: 'Amber Sanctum',
        colorHex: '#f39c12',
        colorKo: '신뢰의 황토',
        element: '토',
        elementEn: 'EARTH',
        dayAdvice: '안정과 신뢰를 쌓는 날. 중심을 지키되 중앙에서 조율하세요.',
    },
    // 金 (금)
    '금': {
        numbers: [4, 9],
        colorName: 'Ivory Sovereign',
        colorHex: '#bdc3c7',
        colorKo: '권위의 백금',
        element: '금',
        elementEn: 'METAL',
        dayAdvice: '결단과 집행력이 빛나는 날. 서쪽의 인연이 귀한 조력자가 됩니다.',
    },
    '金': {
        numbers: [4, 9],
        colorName: 'Ivory Sovereign',
        colorHex: '#bdc3c7',
        colorKo: '권위의 백금',
        element: '금',
        elementEn: 'METAL',
        dayAdvice: '결단과 집행력이 빛나는 날. 서쪽의 인연이 귀한 조력자가 됩니다.',
    },
    // 水 (수)
    '수': {
        numbers: [1, 6],
        colorName: 'Celestial Azure',
        colorHex: '#3498db',
        colorKo: '지혜의 심청',
        element: '수',
        elementEn: 'WATER',
        dayAdvice: '직관과 지혜가 흘러넘치는 날. 북쪽을 향해 흐름을 따르세요.',
    },
    '水': {
        numbers: [1, 6],
        colorName: 'Celestial Azure',
        colorHex: '#3498db',
        colorKo: '지혜의 심청',
        element: '수',
        elementEn: 'WATER',
        dayAdvice: '직관과 지혜가 흘러넘치는 날. 북쪽을 향해 흐름을 따르세요.',
    },
};

const DEFAULT_LUCKY: LuckyData = {
    numbers: [7, 3],
    colorName: 'Mystic Gold',
    colorHex: '#D4AF37',
    colorKo: '운명의 황금',
    element: '?',
    elementEn: 'COSMOS',
    dayAdvice: '우주의 흐름을 타는 특별한 날. 직감을 믿고 행동하세요.',
};

/**
 * 오행 문자열로부터 행운 데이터 반환
 * '목' | '木' | 'wood' | '火' | '화' 등 모두 매핑
 */
export function getLuckyData(element?: string): LuckyData {
    if (!element) return DEFAULT_LUCKY;
    const normalized = element.trim();
    return LUCKY_TABLE[normalized] ?? DEFAULT_LUCKY;
}

/**
 * 메인 모드별 기본 오행 (타로 카드 섹션 전용)
 */
export const MODE_DEFAULT_ELEMENT: Record<string, string> = {
    personal: '수',
    synergy: '화',
    business: '금',
};

/**
 * 모드 ID로 행운 데이터 반환
 */
export function getLuckyByMode(modeId: string): LuckyData {
    return getLuckyData(MODE_DEFAULT_ELEMENT[modeId]);
}
