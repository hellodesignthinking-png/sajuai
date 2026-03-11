/**
 * JamiFaceMesh.tsx — V41-Phase 1.1
 * 자미두수 12궁 × 3D 얼굴 Oracle Touch UI
 *
 * ✦ Three.js Raycasting: 얼굴 포인트 클릭/터치 → 궁 자동 감지
 * ✦ 실시간 황금빛 펄스 하이라이트
 * ✦ Oracle Card Popover (궁 정보 + 싱크로율)
 * ✦ Sync Message Ticker (하단 스크롤 피드)
 */

import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, TrendingUp, Crown, Clock } from 'lucide-react';
import { StarSoulSummon } from './StarSoulCard';
import { getChronosSyncInfo } from '../services/chronosSync';

// ── 12궁 정의 ────────────────────────────────────────────────────────────

export interface Palace {
    id: string;
    nameKo: string;
    nameEn: string;
    area: string;
    indices: number[];     // MediaPipe 랜드마크 인덱스
    meaning: string;
    color: string;
    stars: string[];       // 자미두수 주요 별
    primaryStar: string;   // 대표 주성
    attribute: string;     // 속성 설명
}

export const PALACE_MAP: Palace[] = [
    {
        id: 'ming',
        nameKo: '명궁 (命宮)',
        nameEn: 'Destiny Palace',
        area: '인당 (眉間)',
        indices: [9, 8, 168, 6, 197, 195, 5],
        meaning: '본래의 기질과 총체적 운명을 지배합니다. 이 궁의 주성이 당신의 인생 테마를 규정합니다.',
        color: '#D4AF37',
        stars: ['자미성', '천기성', '태양성'],
        primaryStar: '자미성 (紫微星)',
        attribute: '제왕의 별 — 타고난 리더십과 권위',
    },
    {
        id: 'xiongdi',
        nameKo: '형제궁 (兄弟宮)',
        nameEn: 'Siblings Palace',
        area: '눈썹 (眉毛)',
        indices: [70, 63, 105, 66, 107, 55, 65, 52, 53, 285, 295, 282, 334, 296, 336],
        meaning: '형제·친구와의 인연 깊이를 나타냅니다. 눈썹의 두께와 모양이 인간관계 자산을 드러냅니다.',
        color: '#818cf8',
        stars: ['천기성', '거문성'],
        primaryStar: '천기성 (天機星)',
        attribute: '지모의 별 — 변화와 기획력',
    },
    {
        id: 'fuqi',
        nameKo: '부처궁 (夫妻宮)',
        nameEn: 'Spouse Palace',
        area: '눈꼬리 · 어미 (魚尾)',
        indices: [226, 247, 130, 33, 7, 153, 144, 145, 359, 446, 362, 263, 249, 390, 373, 374],
        meaning: '배우자 인연과 부부 운을 주관합니다. 눈꼬리의 올라감·내려감 방향에서 연애 운을 읽습니다.',
        color: '#f43f5e',
        stars: ['태음성', '천동성'],
        primaryStar: '태음성 (太陰星)',
        attribute: '인연의 별 — 감성적 유대와 배우자 복',
    },
    {
        id: 'zisun',
        nameKo: '자녀궁 (子女宮)',
        nameEn: 'Children Palace',
        area: '와잠 (臥蠶) · 눈 아래',
        indices: [156, 112, 26, 22, 23, 24, 110, 25, 130, 339, 255, 359],
        meaning: '자녀와의 인연 및 창의적 에너지를 나타냅니다. 눈 아래 살의 두툼함이 자녀 복을 나타냅니다.',
        color: '#34d399',
        stars: ['천동성', '탐랑성'],
        primaryStar: '탐랑성 (貪狼星)',
        attribute: '욕망의 별 — 창의성·예술·자녀 인연',
    },
    {
        id: 'caibo',
        nameKo: '재백궁 (財帛宮)',
        nameEn: 'Wealth Palace',
        area: '준두 · 코끝 (鼻)',
        indices: [1, 2, 5, 4, 195, 197, 164, 0, 11, 12, 98, 327],
        meaning: '재물운과 돈을 담는 그릇을 결정합니다. 코의 두께·길이·윤기가 재물 보유력을 계측합니다.',
        color: '#fbbf24',
        stars: ['무곡성', '천부성'],
        primaryStar: '무곡성 (武曲星)',
        attribute: '재물의 별 — 금전 능력과 결단력',
    },
    {
        id: 'jibing',
        nameKo: '질액궁 (疾厄宮)',
        nameEn: 'Health Palace',
        area: '산근 (山根) · 콧대 위',
        indices: [6, 351, 168, 8, 9, 122],
        meaning: '건강과 체력 수준을 주관합니다. 산근의 색기와 높이가 신체 에너지 수준을 반영합니다.',
        color: '#60a5fa',
        stars: ['천상성', '파군성'],
        primaryStar: '천상성 (天相星)',
        attribute: '보필의 별 — 건강 보호와 안전',
    },
    {
        id: 'qianyi',
        nameKo: '천이궁 (遷移宮)',
        nameEn: 'Travel Palace',
        area: '역마 (額角) · 이마 양옆',
        indices: [127, 162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389, 356],
        meaning: '이동·변화·해외 운세를 관장합니다. 역마 위치의 뼈 구조가 타향살이 운을 나타냅니다.',
        color: '#a78bfa',
        stars: ['천마성', '천량성'],
        primaryStar: '천마성 (天馬星)',
        attribute: '이동의 별 — 변화·해외·여행 운',
    },
    {
        id: 'nucai',
        nameKo: '노복궁 (奴僕宮)',
        nameEn: 'Servants Palace',
        area: '양권 (兩顴) · 광대뼈',
        indices: [116, 123, 147, 187, 207, 213, 345, 411, 427, 436],
        meaning: '부하·협력자와의 인연을 주관합니다. 광대뼈의 발달 정도가 사람을 다루는 능력을 보여줍니다.',
        color: '#fb7185',
        stars: ['거문성', '천동성'],
        primaryStar: '거문성 (巨門星)',
        attribute: '언변의 별 — 대인관계와 부하 복',
    },
    {
        id: 'guanlu',
        nameKo: '관록궁 (官祿宮)',
        nameEn: 'Career Palace',
        area: '복덕궁 · 중앙 이마',
        indices: [10, 151, 9, 8, 107, 336, 108, 69, 104, 68, 338, 337],
        meaning: '직업적 성공과 사회적 지위를 지배합니다. 이마의 넓이와 윤기가 출세 가도를 예언합니다.',
        color: '#f59e0b',
        stars: ['태양성', '자미성'],
        primaryStar: '태양성 (太陽星)',
        attribute: '권세의 별 — 직업 · 명예 · 사회적 지위',
    },
    {
        id: 'tiantu',
        nameKo: '전택궁 (田宅宮)',
        nameEn: 'Property Palace',
        area: '안와 (眼窩) · 눈두덩',
        indices: [33, 246, 161, 160, 159, 158, 157, 173, 263, 466, 388, 387, 386, 385, 384, 398],
        meaning: '부동산·거주지 안정을 주관합니다. 눈두덩의 탄력과 색감이 주거 복을 드러냅니다.',
        color: '#10b981',
        stars: ['천부성', '무곡성'],
        primaryStar: '천부성 (天府星)',
        attribute: '창고의 별 — 재산 축적과 부동산 운',
    },
    {
        id: 'fude',
        nameKo: '복덕궁 (福德宮)',
        nameEn: 'Fortune Palace',
        area: '천창 (天倉) · 이마 상단',
        indices: [151, 337, 299, 333, 297, 338, 10, 109, 67, 103, 54, 21],
        meaning: '정신적 행복과 내면의 풍요를 주관합니다. 이마 상단의 포만함이 영적 복덕을 나타냅니다.',
        color: '#c084fc',
        stars: ['천량성', '태음성'],
        primaryStar: '천량성 (天梁星)',
        attribute: '보호의 별 — 정신적 안정과 내면 복',
    },
    {
        id: 'fumu',
        nameKo: '부모궁 (父母宮)',
        nameEn: 'Parents Palace',
        area: '일각 · 월각 (日·月角)',
        indices: [68, 71, 109, 338, 336, 297, 251, 284],
        meaning: '부모·윗사람과의 인연을 주관합니다. 일월각의 형태가 가업 계승 및 후원자 운을 읽어줍니다.',
        color: '#f97316',
        stars: ['파군성', '릉성'],
        primaryStar: '파군성 (破軍星)',
        attribute: '혁신의 별 — 변혁·개척·부모와의 인연',
    },
];

const TOTAL_POINTS = 478;

// ── 역방향 조회 맵: 인덱스 → 궁 ID ─────────────────────────────────────

const INDEX_TO_PALACE: Map<number, string> = new Map(
    PALACE_MAP.flatMap(p => p.indices.map(idx => [idx, p.id] as [number, string]))
);

// ── 색상 버퍼 ────────────────────────────────────────────────────────────

function buildColorBuffer(
    activePalaceId: string | null,
    hoveredPalaceId: string | null,
    pulse: number
): Float32Array {
    const colors = new Float32Array(TOTAL_POINTS * 3);
    // 기본: 어두운 인디고
    for (let i = 0; i < TOTAL_POINTS; i++) {
        colors[i * 3] = 0.12; colors[i * 3 + 1] = 0.15; colors[i * 3 + 2] = 0.32;
    }
    const paint = (palace: Palace, intensity: number) => {
        const c = new THREE.Color(palace.color);
        palace.indices.forEach(idx => {
            if (idx < TOTAL_POINTS) {
                colors[idx * 3] = c.r * intensity;
                colors[idx * 3 + 1] = c.g * intensity;
                colors[idx * 3 + 2] = c.b * intensity;
            }
        });
    };
    // 모든 궁 희미하게
    PALACE_MAP.forEach(p => paint(p, 0.18));
    // 호버
    if (hoveredPalaceId) {
        const p = PALACE_MAP.find(x => x.id === hoveredPalaceId);
        if (p) paint(p, 0.65);
    }
    // 활성 (펄스)
    if (activePalaceId) {
        const p = PALACE_MAP.find(x => x.id === activePalaceId);
        if (p) paint(p, 0.55 + pulse * 0.45);
    }

    // V52: Chronos-Sync (시간의 궁 하이라이트)
    const chrono = getChronosSyncInfo();
    const cp = PALACE_MAP.find(x => x.id === chrono.palaceId);
    if (cp && cp.id !== activePalaceId) {
        paint(cp, 0.3 + Math.sin(Date.now() / 400) * 0.1); // 은은한 시간의 파동
    }

    return colors;
}

// ── Oracle Touch Engine (레이캐스팅) ─────────────────────────────────────

interface TouchEngineProps {
    rawPoints: number[];
    activePalaceId: string | null;
    hoveredPalaceId: string | null;
    onPalaceClick: (id: string, screenPos: { x: number; y: number }) => void;
    onPalaceHover: (id: string | null) => void;
}

const OracleTouchEngine: React.FC<TouchEngineProps> = ({
    rawPoints, activePalaceId, hoveredPalaceId, onPalaceClick, onPalaceHover,
}) => {
    const { camera } = useThree();
    const geoRef = useRef<THREE.BufferGeometry>(null);
    const meshRef = useRef<THREE.Points>(null);
    const pulseRef = useRef(0);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    raycaster.params.Points = { threshold: 0.035 };

    const positions = useMemo(() => {
        const arr = new Float32Array(rawPoints.length);
        for (let i = 0; i < rawPoints.length; i++) arr[i] = rawPoints[i];
        return arr;
    }, [rawPoints]);

    const initialColors = useMemo(() => buildColorBuffer(null, null, 0), []);

    useFrame(({ clock }) => {
        if (!geoRef.current || !meshRef.current) return;

        // V52: Soul-Avatar Dynamic Animation (생동감 부여)
        const t = clock.getElapsedTime();
        meshRef.current.rotation.y = Math.sin(t * 0.12) * 0.25;
        meshRef.current.rotation.x = Math.cos(t * 0.08) * 0.1; // 고개 끄덕임 효과
        meshRef.current.position.y = Math.sin(t * 0.5) * 0.02; // 호흡하는 듯한 부유

        pulseRef.current = (Math.sin(t * 3.8) + 1) / 2;
        const newColors = buildColorBuffer(activePalaceId, hoveredPalaceId, pulseRef.current);
        const colorAttr = geoRef.current.attributes.color as THREE.BufferAttribute;
        if (colorAttr) { colorAttr.array.set(newColors); colorAttr.needsUpdate = true; }
    });

    const handlePointerMove = useCallback((e: any) => {
        if (!meshRef.current || !geoRef.current) return;
        raycaster.setFromCamera(new THREE.Vector2(e.point?.x ?? 0, e.point?.y ?? 0), camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        if (intersects.length > 0 && intersects[0].index !== undefined) {
            const palaceId = INDEX_TO_PALACE.get(intersects[0].index) ?? null;
            onPalaceHover(palaceId);
        } else {
            onPalaceHover(null);
        }
    }, [camera, raycaster, onPalaceHover]);

    const handleClick = useCallback((e: any) => {
        if (!meshRef.current) return;
        const ndc = {
            x: e.nativeEvent.offsetX / e.nativeEvent.target.clientWidth * 2 - 1,
            y: -(e.nativeEvent.offsetY / e.nativeEvent.target.clientHeight) * 2 + 1
        };
        raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        if (intersects.length > 0 && intersects[0].index !== undefined) {
            const palaceId = INDEX_TO_PALACE.get(intersects[0].index);
            if (palaceId) {
                onPalaceClick(palaceId, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
            }
        }
    }, [camera, raycaster, onPalaceClick]);

    return (
        <points
            ref={meshRef}
            onPointerMove={handlePointerMove}
            onPointerOut={() => onPalaceHover(null)}
            onClick={handleClick}
        >
            <bufferGeometry ref={geoRef}>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[initialColors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                vertexColors size={0.022} sizeAttenuation transparent opacity={0.92} depthWrite={false}
            />
        </points>
    );
};

// ── Oracle Card Popover ───────────────────────────────────────────────────

interface OracleCardProps {
    palace: Palace;
    facialScore: number;
    starPower: number;
    onClose: () => void;
}

const OracleCard: React.FC<OracleCardProps> = ({ palace, facialScore, starPower, onClose }) => {
    const matchRate = Math.round((facialScore + starPower) / 2);
    const matchLabel = matchRate >= 85
        ? '✦ 명반과 관상이 완벽 일치 — 확정적 운명'
        : matchRate >= 70
            ? '◈ 명반과 관상이 공명 — 강한 경향'
            : '◉ 기운이 발현 중 — 성장 中';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute z-50 w-64 rounded-2xl overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${palace.color}18, rgba(5,5,20,0.95))`,
                border: `1px solid ${palace.color}50`,
                backdropFilter: 'blur(20px)',
                boxShadow: `0 0 30px ${palace.color}30, 0 8px 32px rgba(0,0,0,0.6)`,
                // 화면 중앙 절대 위치 (Canvas DOM 기준)
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            }}
            onClick={e => e.stopPropagation()}
        >
            {/* 상단 글로우선 */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${palace.color}, transparent)` }} />

            <div className="p-5 space-y-3">
                {/* 헤더 */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[8px] font-black tracking-[0.4em] uppercase"
                            style={{ color: `${palace.color}70` }}>{palace.nameEn}</div>
                        <h4 className="text-sm font-black mt-0.5" style={{ color: palace.color }}>
                            {palace.nameKo}
                        </h4>
                    </div>
                    <button onClick={onClose}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                        ✕
                    </button>
                </div>

                {/* 주성 */}
                <div className="flex items-center gap-2 p-2 rounded-xl"
                    style={{ background: `${palace.color}10`, border: `1px solid ${palace.color}20` }}>
                    <Star className="w-3 h-3 flex-shrink-0" style={{ color: palace.color }} />
                    <div>
                        <div className="text-[9px] font-black" style={{ color: palace.color }}>{palace.primaryStar}</div>
                        <div className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{palace.attribute}</div>
                    </div>
                </div>

                {/* 싱크로율 바 */}
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-[8px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Synchro Rate
                        </span>
                        <motion.span
                            className="text-xs font-black font-serif"
                            style={{ color: matchRate >= 80 ? '#D4AF37' : '#60a5fa' }}
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            {matchRate}%
                        </motion.span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${matchRate}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ background: `linear-gradient(90deg, ${palace.color}80, ${palace.color})` }}
                        />
                    </div>
                    <div className="flex justify-between text-[7px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        <span>명반 {starPower}</span><span>관상 {facialScore}</span>
                    </div>
                </div>

                {/* 판정 */}
                <div className="text-center text-[9px] font-black py-1.5 rounded-xl"
                    style={{ background: `${palace.color}12`, color: palace.color }}>
                    {matchLabel}
                </div>

                {/* 의미 */}
                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {palace.meaning}
                </p>

                {/* 부위 */}
                <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    관상 부위: <span style={{ color: `${palace.color}80` }}>{palace.area}</span>
                </div>
            </div>
        </motion.div>
    );
};

// ── Sync Ticker ───────────────────────────────────────────────────────────

const SyncTicker: React.FC<{ activePalace: Palace | null; matchRate: number }> = ({ activePalace, matchRate }) => {
    const [chrono, setChrono] = useState(getChronosSyncInfo());

    useEffect(() => {
        const t = setInterval(() => setChrono(getChronosSyncInfo()), 60000);
        return () => clearInterval(t);
    }, []);

    const messages = activePalace ? [
        `${activePalace.area}(${activePalace.nameKo.split(' ')[0]})의 정합성 ${matchRate}% 감지`,
        `${activePalace.primaryStar}의 기운이 당신의 관상과 공명합니다`,
        `[Chronos] 현재 ${chrono.timeDisplay}: ${chrono.palaceId} 에너지가 활성화됨`,
    ] : [
        `지금 이 순간(${chrono.timeDisplay}), ${chrono.ji}시의 기운이 ${chrono.palaceId}에 머뭅니다.`,
        '3D 얼굴 위의 궁을 클릭하여 자미두수 명반을 탐색하세요',
        'V52 Eternal Resonance — 운명의 잔향을 계측합니다',
    ];

    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 3200);
        return () => clearInterval(t);
    }, [messages.length, activePalace]);

    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl overflow-hidden"
            style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
            <Zap className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(212,175,55,0.6)' }} />
            <AnimatePresence mode="wait">
                <motion.p
                    key={`${msgIdx}-${activePalace?.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[10px] truncate"
                    style={{ color: 'rgba(212,175,55,0.7)' }}
                >
                    {messages[msgIdx]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

interface JamiFaceMeshProps {
    pointsData: number[];
    facialScores?: Record<string, number>;
    starPowers?: Record<string, number>;
    defaultPalace?: string;
}

// 12궁 → 14주성 완전 매핑 (V42-Phase3 완성)
const PALACE_TO_STAR: Record<string, string> = {
    ming: 'ziwei',    // 명궁(인당)  → 자미성 (제왕)
    xiongdi: 'tianxiang',// 형제궁(눈썹) → 천상성 (보필)
    fuqi: 'tanlang',  // 부처궁(눈꼬리) → 탐랑성 (도화)
    zisun: 'tiantong', // 자녀궁(와잠) → 천동성 (복덕)
    caibo: 'wuqu',     // 재백궁(코끝) → 무곡성 (재물)
    jibing: 'lianzhen', // 질액궁(산근) → 염정성 (정의)
    qianyi: 'pojun',    // 천이궁(역마) → 파군성 (혁명)
    nucai: 'jumen',    // 노복궁(광대) → 거문성 (언변)
    guanlu: 'taiyang',  // 관록궁(이마) → 태양성 (명예)
    tiantu: 'tianfu',   // 전택궁(눈두덩) → 천부성 (재고)
    fude: 'tianliang',// 복덕궁(이마상단) → 천량성 (장수)
    fumu: 'qisha',    // 부모궁(일월각) → 칠살성 (투쟁)
};

const JamiFaceMesh: React.FC<JamiFaceMeshProps> = ({
    pointsData,
    facialScores = {},
    starPowers = {},
    defaultPalace = 'ming',
}) => {
    const [activePalace, setActivePalace] = useState<string>(defaultPalace);
    const [hoveredPalace, setHoveredPalace] = useState<string | null>(null);
    const [popoverPalace, setPopoverPalace] = useState<string | null>(defaultPalace);
    const [summon, setSummon] = useState<{ starId: string; pos: { x: number; y: number } } | null>(null);

    const getScore = (id: string) => facialScores[id] ?? (65 + ((id.charCodeAt(0) * 7) % 28));
    const getPower = (id: string) => starPowers[id] ?? (62 + ((id.charCodeAt(1) ?? 5) * 11 % 30));

    const selectedPalaceObj = PALACE_MAP.find(p => p.id === (popoverPalace || activePalace)) || PALACE_MAP[0];
    const matchRate = Math.round((getScore(selectedPalaceObj.id) + getPower(selectedPalaceObj.id)) / 2);

    const handlePalaceClick = useCallback((id: string, pos?: { x: number; y: number }) => {
        setActivePalace(id);
        setPopoverPalace(prev => prev === id ? null : id);
        // 주성 매핑된 궁 클릭 시 → 소환 시퀀스
        const starId = PALACE_TO_STAR[id];
        if (starId && pos) {
            setSummon({ starId, pos });
        }
    }, []);

    const handlePalaceHover = useCallback((id: string | null) => {
        setHoveredPalace(id);
    }, []);

    return (
        <>
            <div className="w-full space-y-5">
                {/* 섹션 헤더 */}
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3))' }} />
                    <div className="text-center">
                        <p className="text-[8px] font-black tracking-[0.5em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                            V41-Phase1 · Grand Oracle Fusion
                        </p>
                        <h3 className="text-sm font-serif font-black" style={{ color: 'rgba(212,175,55,0.9)' }}>
                            자미두수 12궁 × 3D 얼굴 하이퍼-매핑
                        </h3>
                        <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            얼굴 위 포인트를 클릭하면 해당 궁의 운명이 펼쳐집니다
                        </p>
                    </div>
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.3))' }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-5 items-start">
                    {/* 좌: 3D Canvas + Popover */}
                    <div className="space-y-3">
                        <div
                            className="relative rounded-2xl overflow-hidden cursor-crosshair"
                            style={{
                                height: '340px',
                                background: 'radial-gradient(ellipse at 50% 30%, rgba(18,18,46,0.95), #04040f)',
                                border: '1px solid rgba(212,175,55,0.12)',
                            }}
                        >
                            <Canvas camera={{ position: [0, 0, 2.3], fov: 44 }}>
                                <ambientLight intensity={0.2} />
                                <OracleTouchEngine
                                    rawPoints={pointsData}
                                    activePalaceId={activePalace}
                                    hoveredPalaceId={hoveredPalace}
                                    onPalaceClick={(id, pos) => handlePalaceClick(id, pos)}
                                    onPalaceHover={handlePalaceHover}
                                />
                                <OrbitControls
                                    enableZoom={false} enablePan={false} autoRotate={false}
                                    minPolarAngle={Math.PI / 4} maxPolarAngle={3 * Math.PI / 4}
                                />
                            </Canvas>

                            {/* Popover */}
                            <AnimatePresence>
                                {popoverPalace && (
                                    <OracleCard
                                        key={popoverPalace}
                                        palace={selectedPalaceObj}
                                        facialScore={getScore(selectedPalaceObj.id)}
                                        starPower={getPower(selectedPalaceObj.id)}
                                        onClose={() => setPopoverPalace(null)}
                                    />
                                )}
                            </AnimatePresence>

                            {/* 호버 라벨 */}
                            <AnimatePresence>
                                {hoveredPalace && hoveredPalace !== popoverPalace && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full pointer-events-none"
                                        style={{
                                            background: `${PALACE_MAP.find(p => p.id === hoveredPalace)?.color ?? '#D4AF37'}18`,
                                            border: `1px solid ${PALACE_MAP.find(p => p.id === hoveredPalace)?.color ?? '#D4AF37'}40`,
                                            color: PALACE_MAP.find(p => p.id === hoveredPalace)?.color ?? '#D4AF37',
                                        }}
                                    >
                                        <span className="text-[9px] font-black tracking-widest">
                                            {PALACE_MAP.find(p => p.id === hoveredPalace)?.nameKo} — 클릭하여 탐색
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sync Ticker */}
                        <SyncTicker activePalace={popoverPalace ? selectedPalaceObj : null} matchRate={matchRate} />
                    </div>

                    {/* 우: 12궁 선택 그리드 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3 h-3" style={{ color: 'rgba(212,175,55,0.5)' }} />
                            <span className="text-[8px] font-black tracking-[0.35em] uppercase" style={{ color: 'rgba(212,175,55,0.45)' }}>
                                12 Palaces
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            {PALACE_MAP.map(p => {
                                const score = Math.round((getScore(p.id) + getPower(p.id)) / 2);
                                const isActive = activePalace === p.id;
                                return (
                                    <motion.button
                                        key={p.id}
                                        onClick={() => handlePalaceClick(p.id)}
                                        onHoverStart={() => setHoveredPalace(p.id)}
                                        onHoverEnd={() => setHoveredPalace(null)}
                                        whileTap={{ scale: 0.95 }}
                                        className="py-2 px-1 rounded-xl text-center transition-all"
                                        style={{
                                            background: isActive ? `${p.color}18` : 'rgba(255,255,255,0.025)',
                                            border: `1px solid ${isActive ? p.color + '55' : 'rgba(255,255,255,0.06)'}`,
                                            boxShadow: isActive ? `0 0 12px ${p.color}25` : 'none',
                                        }}
                                    >
                                        <div className="text-[7px] font-black leading-tight"
                                            style={{ color: isActive ? p.color : 'rgba(255,255,255,0.38)' }}>
                                            {p.nameKo.split(' ')[0]}
                                        </div>
                                        <div className="text-[7px] mt-0.5 font-black"
                                            style={{ color: isActive ? `${p.color}90` : 'rgba(255,255,255,0.18)' }}>
                                            {score}%
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* 전체 종합 */}
                        <div className="rounded-xl p-3 space-y-1.5"
                            style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
                            <div className="text-[8px] font-black tracking-widest uppercase"
                                style={{ color: 'rgba(212,175,55,0.5)' }}>Overall Synchro</div>
                            <div className="text-lg font-serif font-black" style={{ color: '#D4AF37' }}>
                                {Math.round(PALACE_MAP.reduce((s, p) => s + (getScore(p.id) + getPower(p.id)) / 2, 0) / 12)}%
                            </div>
                            <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                12개 궁의 명반-관상 평균 정합성입니다.
                                클릭으로 각 궁을 탐색하세요.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* V42-Phase2: 스타-소울 카드 소환 오버레이 */}
            {
                summon && (
                    <StarSoulSummon
                        starId={summon.starId}
                        syncRate={Math.round((getScore(activePalace) + getPower(activePalace)) / 2)}
                        keyFeature={PALACE_MAP.find(p => p.id === activePalace)?.area}
                        isOpen
                        originPos={summon.pos}
                        onClose={() => setSummon(null)}
                    />
                )}
        </>
    );
};

export default JamiFaceMesh;
