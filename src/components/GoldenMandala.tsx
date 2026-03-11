/**
 * GoldenMandala.tsx — V43
 * 황금빛 자미두수 12궁 명반 다이어그램
 *
 * ✦ 전통 4×4 명반 CSS Grid + 중앙 3D 얼굴 페이스 메쉬
 * ✦ 12개 궁마다 스타-소울 미니 카드 (글래스모피즘)
 * ✦ SVG 에테르 연결선 (삼방사정, 대궁)
 * ✦ 호버 → 중앙 얼굴 해당 부위 황금빛 줌인
 * ✦ 클릭 → StarSoulSummon 풀스크린 소환
 * ✦ 실시간 Sync Rate 카운터
 */

import React, {
    useState, useRef, useCallback, useEffect, useMemo, Suspense,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Download, Share2 } from 'lucide-react';

import { PALACE_MAP, Palace } from './JamiFaceMesh';
import { StarSoulSummon } from './StarSoulCard';
import { STAR_SOULS } from './StarSoulArchive';
import { STAR_WEIGHTS } from '../utils/starSyncEngine';

// ── 명반 4×4 레이아웃 위치 매핑 ──────────────────────────────────────────
// CSS Grid col 1-4, row 1-4 (center = col 2-3, row 2-3)

interface MandalaPalace {
    id: string;           // PALACE_MAP id
    gridCol: string;      // CSS grid-column value
    gridRow: string;      // CSS grid-row value
    dir: 'tl' | 'tc' | 'tr' | 'ml' | 'mr' | 'bl' | 'bc' | 'br'; // position direction
}

const MANDALA_LAYOUT: MandalaPalace[] = [
    // 상단 행 (위→아래: 형제궁, 명궁, 부모궁, 복덕궁)
    { id: 'xiongdi', gridCol: '1', gridRow: '1', dir: 'tl' },
    { id: 'ming', gridCol: '2', gridRow: '1', dir: 'tc' },
    { id: 'fumu', gridCol: '3', gridRow: '1', dir: 'tc' },
    { id: 'fude', gridCol: '4', gridRow: '1', dir: 'tr' },
    // 좌측 열 (중간 2개)
    { id: 'fuqi', gridCol: '1', gridRow: '2', dir: 'ml' },
    { id: 'zisun', gridCol: '1', gridRow: '3', dir: 'ml' },
    // 우측 열 (중간 2개)
    { id: 'tiantu', gridCol: '4', gridRow: '2', dir: 'mr' },
    { id: 'guanlu', gridCol: '4', gridRow: '3', dir: 'mr' },
    // 하단 행 (재백, 질액, 천이, 노복)
    { id: 'caibo', gridCol: '1', gridRow: '4', dir: 'bl' },
    { id: 'jibing', gridCol: '2', gridRow: '4', dir: 'bc' },
    { id: 'qianyi', gridCol: '3', gridRow: '4', dir: 'bc' },
    { id: 'nucai', gridCol: '4', gridRow: '4', dir: 'br' },
];

// 삼방사정 (三方四正) 관계 쌍 — 에테르 연결선
const ETHER_CONNECTIONS: [string, string][] = [
    ['ming', 'jibing'],  // 명궁 ↔ 질액궁 (대궁)
    ['fuqi', 'guanlu'],  // 부처궁 ↔ 관록궁 (대궁)
    ['xiongdi', 'tiantu'],  // 형제궁 ↔ 전택궁 (대궁)
    ['ming', 'caibo'],   // 명·재백 삼방
    ['ming', 'fude'],    // 명·복덕 삼방 (사정)
    ['guanlu', 'caibo'],   // 재백·관록 삼방
];

// 각 궁과 주성 ID (PALACE_TO_STAR)
const PALACE_TO_STAR: Record<string, string> = {
    ming: 'ziwei', fuqi: 'tanlang', guanlu: 'taiyang',
    nucai: 'jumen', qianyi: 'pojun', caibo: 'wuqu',
    fude: 'tianliang', fumu: 'qisha', xiongdi: 'tianxiang',
    zisun: 'tiantong', jibing: 'lianzhen', tiantu: 'tianfu',
};

// ── 에테르 라인 SVG (CSS absolute 위에 덮기) ─────────────────────────────

interface EtherLinesProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    cellRefs: Record<string, React.RefObject<HTMLDivElement | null>>;
    hovered: string | null;
}

const EtherLines: React.FC<EtherLinesProps> = ({ containerRef, cellRefs, hovered }) => {
    const [lines, setLines] = useState<Array<{
        x1: number; y1: number; x2: number; y2: number;
        id: string; active: boolean;
    }>>([]);

    useEffect(() => {
        const calc = () => {
            if (!containerRef.current) return;
            const box = containerRef.current.getBoundingClientRect();
            const newLines: typeof lines = [];
            ETHER_CONNECTIONS.forEach(([a, b]) => {
                const refA = cellRefs[a]?.current;
                const refB = cellRefs[b]?.current;
                if (!refA || !refB) return;
                const ra = refA.getBoundingClientRect();
                const rb = refB.getBoundingClientRect();
                newLines.push({
                    x1: ra.left + ra.width / 2 - box.left,
                    y1: ra.top + ra.height / 2 - box.top,
                    x2: rb.left + rb.width / 2 - box.left,
                    y2: rb.top + rb.height / 2 - box.top,
                    id: `${a}-${b}`,
                    active: a === hovered || b === hovered,
                });
            });
            setLines(newLines);
        };
        calc();
        window.addEventListener('resize', calc);
        return () => window.removeEventListener('resize', calc);
    }, [containerRef, cellRefs, hovered]);

    if (!containerRef.current) return null;
    const box = containerRef.current.getBoundingClientRect();

    return (
        <svg
            className="absolute inset-0 pointer-events-none z-0"
            width={box.width || '100%'}
            height={box.height || '100%'}
        >
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {lines.map(l => (
                <g key={l.id}>
                    {/* 글로우 선 */}
                    <line
                        x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                        stroke={l.active ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.12)'}
                        strokeWidth={l.active ? 1.5 : 0.8}
                        strokeDasharray={l.active ? '0' : '4 6'}
                        filter={l.active ? 'url(#glow)' : undefined}
                        style={{ transition: 'all 0.4s ease' }}
                    />
                    {/* 중간 마름모 장식 */}
                    {l.active && (
                        <rect
                            x={(l.x1 + l.x2) / 2 - 3}
                            y={(l.y1 + l.y2) / 2 - 3}
                            width={6} height={6}
                            fill="rgba(212,175,55,0.6)"
                            transform={`rotate(45 ${(l.x1 + l.x2) / 2} ${(l.y1 + l.y2) / 2})`}
                        />
                    )}
                </g>
            ))}
        </svg>
    );
};

// ── 중앙 3D 얼굴 메쉬 (경량 버전) ───────────────────────────────────────

interface FaceMeshCenterProps {
    pointsData: number[];
    highlightIndices?: number[];
    highlightColor?: string;
}

const FaceMeshInner: React.FC<FaceMeshCenterProps> = ({
    pointsData, highlightIndices = [], highlightColor = '#D4AF37',
}) => {
    const geoRef = useRef<THREE.BufferGeometry>(null);
    const meshRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const arr = new Float32Array(pointsData.length);
        for (let i = 0; i < pointsData.length; i++) arr[i] = pointsData[i];
        return arr;
    }, [pointsData]);

    const TOTAL = pointsData.length / 3;
    const colors = useMemo(() => {
        const c = new Float32Array(TOTAL * 3);
        const base = new THREE.Color('#1e1e3a');
        const hi = new THREE.Color(highlightColor);
        for (let i = 0; i < TOTAL; i++) {
            const isHi = highlightIndices.includes(i);
            c[i * 3] = isHi ? hi.r : base.r * 0.4;
            c[i * 3 + 1] = isHi ? hi.g : base.g * 0.5;
            c[i * 3 + 2] = isHi ? hi.b : base.b * 0.8;
        }
        return c;
    }, [TOTAL, highlightIndices, highlightColor]);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.25;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry ref={geoRef}>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial vertexColors size={0.015} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
        </points>
    );
};

// ── 궁 슬롯 카드 ─────────────────────────────────────────────────────────

interface PalaceSlotProps {
    palace: Palace;
    layout: MandalaPalace;
    syncRate: number;
    starId?: string;
    isHovered: boolean;
    isConnected: boolean;
    onHover: (id: string | null) => void;
    onClick: (id: string, e: React.MouseEvent) => void;
    cellRef: React.RefObject<HTMLDivElement | null>;
}

const PalaceSlot: React.FC<PalaceSlotProps> = ({
    palace, syncRate, starId, isHovered, isConnected,
    onHover, onClick, cellRef,
}) => {
    const star = starId ? STAR_SOULS.find(s => s.id === starId) : null;
    const color = star?.color ?? palace.color;

    const grade =
        syncRate >= 92 ? 'Legendary' :
            syncRate >= 80 ? 'Epic' :
                syncRate >= 68 ? 'Rare' : 'Awakened';

    const gradeColor =
        grade === 'Legendary' ? '#D4AF37' :
            grade === 'Epic' ? '#a855f7' :
                grade === 'Rare' ? '#3b82f6' : '#6b7280';

    return (
        <motion.div
            ref={cellRef as React.RefObject<HTMLDivElement>}
            className="relative rounded-xl overflow-hidden cursor-pointer select-none h-full min-h-[70px]"
            style={{
                background: isHovered
                    ? `linear-gradient(135deg, ${color}22, rgba(5,5,20,0.95))`
                    : 'rgba(5,5,20,0.75)',
                border: `1px solid ${isHovered ? color + '60' : isConnected ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)'}`,
                backdropFilter: 'blur(12px)',
                boxShadow: isHovered
                    ? `0 0 20px ${color}35, 0 0 40px ${color}18`
                    : isConnected ? `0 0 8px rgba(212,175,55,0.15)` : 'none',
                transition: 'all 0.3s ease',
                gridColumn: undefined,
                gridRow: undefined,
            }}
            onMouseEnter={() => onHover(palace.id)}
            onMouseLeave={() => onHover(null)}
            onClick={e => onClick(palace.id, e)}
            whileTap={{ scale: 0.97 }}
        >
            {/* 상단 글로우선 (호버 시) */}
            {isHovered && (
                <motion.div
                    className="absolute top-0 left-0 right-0 h-[1.5px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                />
            )}

            <div className="p-2 h-full flex flex-col justify-between">
                {/* 헤더: 궁 이름 + 등급 */}
                <div className="flex items-start justify-between gap-1">
                    <div>
                        <div className="text-[6px] font-black tracking-[0.25em] uppercase leading-none"
                            style={{ color: isHovered ? color : 'rgba(212,175,55,0.5)' }}>
                            {palace.nameEn.split(' ')[0].toUpperCase()}
                        </div>
                        <div className="text-[9px] font-black leading-tight mt-0.5"
                            style={{ color: isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)' }}>
                            {palace.nameKo.split(' ')[0]}
                        </div>
                    </div>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-1 py-0.5 rounded text-[5px] font-black"
                            style={{ background: `${gradeColor}20`, color: gradeColor, border: `1px solid ${gradeColor}40` }}
                        >
                            {grade.toUpperCase()}
                        </motion.div>
                    )}
                </div>

                {/* 별 아이콘 + 이름 OR 공궁(空宮) */}
                <div className="flex items-center gap-1 mt-1">
                    {star ? (
                        <>
                            <motion.div
                                className="text-base leading-none"
                                animate={isHovered ? { scale: [1, 1.15, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                {star.icon}
                            </motion.div>
                            <div>
                                <div className="text-[7px] font-black leading-tight"
                                    style={{ color: isHovered ? color : 'rgba(255,255,255,0.3)' }}>
                                    {palace.primaryStar.split('(')[0].trim()}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-1">
                            <div className="text-[9px] opacity-30">◌</div>
                            <div className="text-[6px] font-black tracking-widest"
                                style={{ color: 'rgba(255,255,255,0.15)' }}>공궁(空宮)</div>
                        </div>
                    )}
                </div>

                {/* 싱크로율 바 */}
                <div className="mt-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                        <div className="text-[5px] uppercase tracking-widest"
                            style={{ color: 'rgba(255,255,255,0.2)' }}>Sync</div>
                        <div className="text-[7px] font-black"
                            style={{ color: isHovered ? color : 'rgba(255,255,255,0.3)' }}>
                            {syncRate}%
                        </div>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${syncRate}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
                        />
                    </div>
                </div>

                {/* 관상 부위 (호버 시) */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-1 overflow-hidden"
                        >
                            <div className="text-[6px] leading-tight" style={{ color: `${color}70` }}>
                                ◉ {palace.area}
                            </div>
                            <div className="text-[5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                탭하여 소환
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 활성 파티클 */}
            {isHovered && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-0.5 h-0.5 rounded-full"
                            style={{
                                background: color,
                                left: `${20 + i * 15}%`,
                                top: '80%',
                            }}
                            animate={{ y: [-0, -30], opacity: [0.8, 0] }}
                            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// ── 실시간 Sync 카운터 ────────────────────────────────────────────────────

const SyncCounter: React.FC<{ rate: number; color?: string }> = ({ rate, color = '#D4AF37' }) => {
    const [display, setDisplay] = useState(rate);

    useEffect(() => {
        let frame: number;
        const animate = () => {
            setDisplay(v => {
                const diff = rate - v;
                if (Math.abs(diff) < 0.1) return rate;
                frame = requestAnimationFrame(animate);
                return +(v + diff * 0.08).toFixed(1);
            });
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [rate]);

    // 미세 변동 (살아있는 느낌)
    const [jitter, setJitter] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setJitter((Math.random() - 0.5) * 0.3), 800);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="flex items-baseline gap-1">
            <span className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Jami-Face Sync
            </span>
            <motion.span
                className="text-sm font-serif font-black"
                style={{ color }}
                animate={{ textShadow: [`0 0 8px ${color}60`, `0 0 20px ${color}80`, `0 0 8px ${color}60`] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {(display + jitter).toFixed(1)}%
            </motion.span>
        </div>
    );
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

interface GoldenMandalaProps {
    /** 12궁별 싱크로율 Record<palaceId, number> */
    syncRates?: Record<string, number>;
    /** 3D 포인트 데이터 */
    pointsData?: number[];
    /** 종합 관상 분석 한 줄 요약 */
    oracleSummary?: string;
    /** 주성 ID (사용자 명궁 주성) */
    userStarId?: string;
}

const GoldenMandala: React.FC<GoldenMandalaProps> = ({
    syncRates = {},
    pointsData = [],
    oracleSummary,
    userStarId,
}) => {
    const [hovered, setHovered] = useState<string | null>(null);
    const [summon, setSummon] = useState<{ starId: string; pos: { x: number; y: number } } | null>(null);
    const [tick, setTick] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);

    // 각 셀 Ref (에테르 라인용)
    const cellRefs = useMemo(() =>
        Object.fromEntries(MANDALA_LAYOUT.map(l => [l.id, React.createRef<HTMLDivElement>()])),
        []
    );

    // 전체 싱크로율 평균
    const overallSync = useMemo(() => {
        const vals = PALACE_MAP.map(p => syncRates[p.id] ?? (65 + p.id.charCodeAt(0) % 25));
        return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    }, [syncRates]);

    // 호버된 궁의 MediaPipe 인덱스
    const highlightIndices = useMemo(() => {
        if (!hovered) return [];
        return PALACE_MAP.find(p => p.id === hovered)?.indices ?? [];
    }, [hovered]);

    const highlightColor = useMemo(() => {
        const palace = PALACE_MAP.find(p => p.id === hovered);
        return palace?.color ?? '#D4AF37';
    }, [hovered]);

    // 연결된 궁 목록 (에테르 라인 active 판정)
    const connectedPalaces = useMemo(() => {
        if (!hovered) return new Set<string>();
        const set = new Set<string>();
        ETHER_CONNECTIONS.forEach(([a, b]) => {
            if (a === hovered) set.add(b);
            if (b === hovered) set.add(a);
        });
        return set;
    }, [hovered]);

    const handlePalaceClick = useCallback((id: string, e: React.MouseEvent) => {
        const starId = PALACE_TO_STAR[id];
        if (!starId) return;
        setSummon({ starId, pos: { x: e.clientX, y: e.clientY } });
    }, []);

    // 실시간 미세 변동 트리거
    useEffect(() => {
        const t = setInterval(() => setTick(v => v + 1), 3500);
        return () => clearInterval(t);
    }, []);

    // 동적 oracle summary 생성
    const summary = oracleSummary ?? (() => {
        const userStar = userStarId ? STAR_SOULS.find(s => s.id === userStarId) : null;
        const topPalace = PALACE_MAP.reduce((a, b) =>
            (syncRates[a.id] ?? 70) > (syncRates[b.id] ?? 70) ? a : b
        );
        return userStar
            ? `귀하의 명반은 ${userStar.nameKo}의 기운이 지배하며, ${topPalace.nameKo}(${topPalace.area})에서 관상과의 최고 공명(${syncRates[topPalace.id] ?? 88}%)이 감지됩니다.`
            : `12개 궁의 평균 Sync Rate ${overallSync}% — 궁을 클릭하여 주성을 소환하세요.`;
    })();

    return (
        <div className="w-full space-y-4">
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3))' }} />
                <div className="text-center">
                    <p className="text-[8px] font-black tracking-[0.5em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                        V43 · Golden Mandala
                    </p>
                    <h3 className="text-sm font-serif font-black" style={{ color: 'rgba(212,175,55,0.9)' }}>
                        황금빛 자미두수 12궁 명반
                    </h3>
                </div>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.3))' }} />
            </div>

            {/* 실시간 Sync 카운터 바 */}
            <div className="flex items-center justify-between px-1">
                <SyncCounter rate={overallSync + (tick % 3 === 0 ? (Math.random() - 0.5) * 0.4 : 0)} />
                <div className="flex gap-2">
                    <button
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest"
                        style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(212,175,55,0.6)', border: '1px solid rgba(212,175,55,0.2)' }}
                    >
                        <Share2 className="w-2.5 h-2.5" /> 공유
                    </button>
                    <button
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest"
                        style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(212,175,55,0.6)', border: '1px solid rgba(212,175,55,0.2)' }}
                    >
                        <Download className="w-2.5 h-2.5" /> PDF
                    </button>
                </div>
            </div>

            {/* 명반 다이어그램 */}
            <div
                ref={containerRef}
                className="relative w-full rounded-2xl overflow-hidden"
                style={{
                    background: 'radial-gradient(ellipse at 50% 40%, rgba(12,12,36,0.98), #04040e)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    boxShadow: '0 0 60px rgba(212,175,55,0.08), inset 0 0 100px rgba(0,0,0,0.6)',
                    aspectRatio: '1 / 1',
                    maxWidth: '540px',
                    margin: '0 auto',
                }}
            >
                {/* 배경: 신성 기하학 SVG 문양 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]" viewBox="0 0 540 540" fill="none">
                    {/* 외부 원 */}
                    <circle cx="270" cy="270" r="260" stroke="#D4AF37" strokeWidth="0.5" />
                    <circle cx="270" cy="270" r="195" stroke="#D4AF37" strokeWidth="0.4" strokeDasharray="4 8" />
                    <circle cx="270" cy="270" r="130" stroke="#D4AF37" strokeWidth="0.3" />
                    {/* 12방위 방사선 */}
                    {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i / 12) * Math.PI * 2;
                        return (
                            <line key={i}
                                x1={270 + Math.cos(angle) * 130} y1={270 + Math.sin(angle) * 130}
                                x2={270 + Math.cos(angle) * 260} y2={270 + Math.sin(angle) * 260}
                                stroke="#D4AF37" strokeWidth="0.4"
                            />
                        );
                    })}
                    {/* 삼각형 삼방 */}
                    <polygon points="270,80 460,350 80,350" stroke="#D4AF37" strokeWidth="0.4" fill="none" />
                    <polygon points="270,460 80,190 460,190" stroke="#D4AF37" strokeWidth="0.4" fill="none" />
                    {/* 중앙 꽃잎 (다윗의 별) */}
                    {Array.from({ length: 6 }).map((_, i) => {
                        const a = (i / 6) * Math.PI * 2;
                        return <circle key={i} cx={270 + Math.cos(a) * 65} cy={270 + Math.sin(a) * 65} r={65} stroke="#D4AF37" strokeWidth="0.3" fill="none" />;
                    })}
                    {/* 중앙점 */}
                    <circle cx="270" cy="270" r="4" fill="#D4AF37" opacity={0.6} />
                </svg>
                <div className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 80px rgba(212,175,55,0.05)' }} />

                {/* SVG 에테르 연결선 */}
                <EtherLines containerRef={containerRef} cellRefs={cellRefs} hovered={hovered} />

                {/* 4×4 CSS Grid (중앙 2×2 = 3D 얼굴 Canvas) */}
                <div
                    className="absolute inset-0 grid gap-1.5 p-2"
                    style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' }}
                >
                    {/* 12궁 슬롯 */}
                    {MANDALA_LAYOUT.map(layout => {
                        const palace = PALACE_MAP.find(p => p.id === layout.id);
                        if (!palace) return null;
                        const starId = PALACE_TO_STAR[layout.id];
                        const rate = syncRates[layout.id] ?? (65 + layout.id.charCodeAt(0) % 25);
                        return (
                            <div
                                key={layout.id}
                                style={{
                                    gridColumn: layout.gridCol,
                                    gridRow: layout.gridRow,
                                }}
                            >
                                <PalaceSlot
                                    palace={palace}
                                    layout={layout}
                                    syncRate={rate}
                                    starId={starId}
                                    isHovered={hovered === layout.id}
                                    isConnected={connectedPalaces.has(layout.id)}
                                    onHover={setHovered}
                                    onClick={handlePalaceClick}
                                    cellRef={cellRefs[layout.id]}
                                />
                            </div>
                        );
                    })}

                    {/* 중앙 2×2 = 3D 페이스 캔버스 */}
                    <div
                        className="relative rounded-2xl overflow-hidden"
                        style={{
                            gridColumn: '2 / 4',
                            gridRow: '2 / 4',
                            background: 'radial-gradient(ellipse at 50% 40%, rgba(18,18,46,0.9), rgba(4,4,14,0.98))',
                            border: '1px solid rgba(212,175,55,0.2)',
                            boxShadow: '0 0 30px rgba(212,175,55,0.1)',
                        }}
                    >
                        {/* 코너 장식 */}
                        {['tl', 'tr', 'bl', 'br'].map(c => (
                            <div key={c} className={`absolute w-3 h-3 ${c === 'tl' ? 'top-1 left-1' : c === 'tr' ? 'top-1 right-1' :
                                c === 'bl' ? 'bottom-1 left-1' : 'bottom-1 right-1'
                                }`}
                                style={{
                                    borderTop: c.startsWith('t') ? '1px solid rgba(212,175,55,0.5)' : 'none',
                                    borderBottom: c.startsWith('b') ? '1px solid rgba(212,175,55,0.5)' : 'none',
                                    borderLeft: c.endsWith('l') ? '1px solid rgba(212,175,55,0.5)' : 'none',
                                    borderRight: c.endsWith('r') ? '1px solid rgba(212,175,55,0.5)' : 'none',
                                }}
                            />
                        ))}

                        {/* 3D Face Mesh */}
                        {pointsData.length > 0 ? (
                            <Canvas camera={{ position: [0, 0, 2.4], fov: 42 }} style={{ width: '100%', height: '100%' }}>
                                <ambientLight intensity={0.15} />
                                <FaceMeshInner
                                    pointsData={pointsData}
                                    highlightIndices={highlightIndices}
                                    highlightColor={highlightColor}
                                />
                                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
                            </Canvas>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                <div className="text-3xl opacity-30">🌌</div>
                                <div className="text-[8px] font-black tracking-widest uppercase text-center" style={{ color: 'rgba(212,175,55,0.3)' }}>
                                    명반<br />다이어그램
                                </div>
                            </div>
                        )}

                        {/* 호버 부위 표시 */}
                        <AnimatePresence>
                            {hovered && (
                                <motion.div
                                    className="absolute bottom-1 left-0 right-0 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="text-[7px] font-black"
                                        style={{ color: PALACE_MAP.find(p => p.id === hovered)?.color ?? '#D4AF37' }}>
                                        ◉ {PALACE_MAP.find(p => p.id === hovered)?.area}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 중앙 로고 */}
                        <div className="absolute top-1 left-0 right-0 text-center pointer-events-none">
                            <div className="text-[6px] font-black tracking-[0.4em] uppercase" style={{ color: 'rgba(212,175,55,0.3)' }}>命盤</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 오라클 가이드 요약 */}
            <motion.div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'rgba(212,175,55,0.7)' }} />
                    <div className="space-y-1">
                        <div className="text-[7px] font-black tracking-[0.4em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                            Grand Oracle · 명반 분석 요약
                        </div>
                        <p className="text-[11px] leading-relaxed font-serif italic" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            "{summary}"
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* 하단 라이브 오라클 바 */}
            <div className="rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
                <div className="flex-1">
                    <div className="text-[7px] font-black tracking-[0.4em] uppercase mb-1"
                        style={{ color: 'rgba(255,255,255,0.25)' }}>Current Sync Focus</div>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={hovered ?? 'default'}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[11px] leading-relaxed font-serif italic"
                            style={{
                                color: hovered
                                    ? (PALACE_MAP.find(p => p.id === hovered)?.color ?? '#D4AF37')
                                    : 'rgba(212,175,55,0.7)'
                            }}
                        >
                            {hovered
                                ? `${PALACE_MAP.find(p => p.id === hovered)?.nameKo}과 ${PALACE_MAP.find(p => p.id === hovered)?.area} 계측 데이터 분석 중...`
                                : '명반 전체 동기화 완료 — 궁을 호버하여 상세 분석 시작'}
                        </motion.p>
                    </AnimatePresence>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                        <div className="text-[7px] font-black tracking-widest uppercase"
                            style={{ color: 'rgba(255,255,255,0.25)' }}>Total Harmony</div>
                        <motion.div
                            className="text-xl font-serif font-black"
                            style={{ color: '#D4AF37' }}
                            animate={{ textShadow: ['0 0 8px rgba(212,175,55,0.4)', '0 0 24px rgba(212,175,55,0.7)', '0 0 8px rgba(212,175,55,0.4)'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {overallSync}%
                        </motion.div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        className="px-4 py-2 font-black text-[9px] rounded-xl uppercase tracking-widest"
                        style={{
                            background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
                            border: '1px solid rgba(212,175,55,0.4)',
                            color: '#D4AF37',
                            boxShadow: '0 0 16px rgba(212,175,55,0.2)',
                        }}
                        onClick={(e) => hovered && handlePalaceClick(hovered, e as React.MouseEvent)}
                    >
                        {hovered ? '星 소환' : '명반 탐색'}
                    </motion.button>
                </div>
            </div>

            {/* 12궁 퀵 리스트 (모바일 접근성) */}
            <div className="grid grid-cols-4 gap-1">
                {PALACE_MAP.map(p => {
                    const rate = syncRates[p.id] ?? (65 + p.id.charCodeAt(0) % 25);
                    const starId = PALACE_TO_STAR[p.id];
                    const star = starId ? STAR_SOULS.find(s => s.id === starId) : null;
                    return (
                        <button
                            key={p.id}
                            onClick={(e) => handlePalaceClick(p.id, e)}
                            className="py-1.5 px-1 rounded-lg text-center transition-all"
                            style={{
                                background: hovered === p.id ? `${p.color}15` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${hovered === p.id ? p.color + '40' : 'rgba(255,255,255,0.05)'}`,
                            }}
                            onMouseEnter={() => setHovered(p.id)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div className="text-xs">{star?.icon ?? '✦'}</div>
                            <div className="text-[6px] font-black" style={{ color: hovered === p.id ? p.color : 'rgba(255,255,255,0.35)' }}>
                                {p.nameKo.split(' ')[0]}
                            </div>
                            <div className="text-[5px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{rate}%</div>
                        </button>
                    );
                })}
            </div>

            {/* StarSoul 소환 오버레이 */}
            {summon && (
                <StarSoulSummon
                    starId={summon.starId}
                    syncRate={syncRates[Object.entries(PALACE_TO_STAR).find(([, v]) => v === summon.starId)?.[0] ?? ''] ?? 80}
                    keyFeature={PALACE_MAP.find(p => PALACE_TO_STAR[p.id] === summon.starId)?.area}
                    isOpen
                    originPos={summon.pos}
                    onClose={() => setSummon(null)}
                />
            )}
        </div>
    );
};

export default GoldenMandala;
