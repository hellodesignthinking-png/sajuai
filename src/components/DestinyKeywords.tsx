/**
 * DestinyKeywords.tsx
 * V36-Detail: 트라이어드 오브 페이트 (Triad of Fate)
 *
 * - 오행별 색상 글래스모피즘 칩
 * - Rare / Unique 희귀도 배지
 * - 스캔-디코드 입장 애니메이션
 * - 바이럴 공유 멘트 자동 생성
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, ShieldCheck, Copy, Share2 } from 'lucide-react';

// ── 타입 ─────────────────────────────────────────────────────────────────────

export type ElementKey = '목' | '화' | '토' | '금' | '수' | string;
export type Rarity = 'Common' | 'Rare' | 'Unique';

export interface DestinyKeywordData {
    text: string;           // 한글 키워드 (예: "냉철한_재력가")
    element?: ElementKey;   // 오행 속성 (개별 오버라이드)
    rarity?: Rarity;
    viralHook?: string;     // 공유용 문구 오버라이드
}

// ── 오행 테마 ─────────────────────────────────────────────────────────────────

const ELEMENT_THEME: Record<string, {
    border: string; glow: string; text: string;
    bg: string; badgeBg: string;
}> = {
    '목': {
        border: 'rgba(52,211,153,0.5)',
        glow: 'rgba(52,211,153,0.2)',
        text: '#34d399',
        bg: 'rgba(6,78,59,0.12)',
        badgeBg: '#059669',
    },
    '화': {
        border: 'rgba(251,113,133,0.5)',
        glow: 'rgba(251,113,133,0.2)',
        text: '#fb7185',
        bg: 'rgba(76,5,25,0.12)',
        badgeBg: '#e11d48',
    },
    '토': {
        border: 'rgba(251,191,36,0.5)',
        glow: 'rgba(251,191,36,0.2)',
        text: '#fbbf24',
        bg: 'rgba(78,52,0,0.12)',
        badgeBg: '#d97706',
    },
    '금': {
        border: 'rgba(203,213,225,0.45)',
        glow: 'rgba(203,213,225,0.15)',
        text: '#e2e8f0',
        bg: 'rgba(15,23,42,0.2)',
        badgeBg: '#94a3b8',
    },
    '수': {
        border: 'rgba(96,165,250,0.5)',
        glow: 'rgba(96,165,250,0.2)',
        text: '#60a5fa',
        bg: 'rgba(3,7,69,0.12)',
        badgeBg: '#2563eb',
    },
    default: {
        border: 'rgba(212,175,55,0.5)',
        glow: 'rgba(212,175,55,0.15)',
        text: '#D4AF37',
        bg: 'rgba(30,20,0,0.12)',
        badgeBg: '#b8860b',
    },
};

function getTheme(element?: string) {
    if (!element) return ELEMENT_THEME.default;
    const key = element.replace(/[\s木火土金水]/g, '').toLowerCase();
    const map: Record<string, string> = {
        '목': '목', '木': '목', 'wood': '목',
        '화': '화', '火': '화', 'fire': '화',
        '토': '토', '土': '토', 'earth': '토',
        '금': '금', '金': '금', 'metal': '금',
        '수': '수', '水': '수', 'water': '수',
    };
    const k = map[element] || key;
    return ELEMENT_THEME[k] || ELEMENT_THEME.default;
}

// ── 희귀도 배지 ───────────────────────────────────────────────────────────────

const RarityBadge = ({ rarity, badgeBg }: { rarity: Rarity; badgeBg: string }) => {
    if (rarity === 'Common') return null;
    return (
        <motion.div
            className="absolute -top-2.5 -right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[7px] font-black text-black tracking-widest z-10"
            style={{ background: rarity === 'Unique' ? '#D4AF37' : badgeBg }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
            {rarity === 'Unique' ? <Zap size={7} fill="currentColor" /> : <Star size={7} fill="currentColor" />}
            {rarity.toUpperCase()}
        </motion.div>
    );
};

// ── 노이즈/글리치 텍스트 디코딩 애니메이션 ────────────────────────────────────

const GLITCH_CHARS = '▓░▒█#@&%$ΨΩΦΣΔ';

function useDecodeText(target: string, active: boolean, delay = 0): string {
    const [displayed, setDisplayed] = useState('');
    const [phase, setPhase] = useState<'idle' | 'glitch' | 'done'>('idle');

    useEffect(() => {
        if (!active) return;
        let timeout = setTimeout(() => {
            setPhase('glitch');

            let tick = 0;
            const maxTicks = target.length * 4;
            const interval = setInterval(() => {
                tick++;
                // 점진적으로 실제 글자 해제 (앞에서부터)
                const revealed = Math.floor((tick / maxTicks) * target.length);
                const glitchPart = Array.from({ length: target.length - revealed })
                    .map(() => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)])
                    .join('');
                setDisplayed(target.slice(0, revealed) + glitchPart);

                if (tick >= maxTicks) {
                    clearInterval(interval);
                    setDisplayed(target);
                    setPhase('done');
                }
            }, 40);
        }, delay);

        return () => clearTimeout(timeout);
    }, [active, target, delay]);

    return phase === 'idle' ? '' : displayed;
}

// ── 개별 키워드 칩 ────────────────────────────────────────────────────────────

interface ChipProps {
    data: DestinyKeywordData;
    elementOverride?: ElementKey;
    index: number;
    isActive: boolean;
}

const DestinyKeywordChip: React.FC<ChipProps> = ({ data, elementOverride, index, isActive }) => {
    const element = data.element || elementOverride;
    const rarity = data.rarity || 'Common';
    const theme = getTheme(element);
    const decoded = useDecodeText(data.text, isActive, index * 420);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.88 }}
            animate={isActive ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: index * 0.38, type: 'spring', stiffness: 260, damping: 18 }}
            whileHover={{ scale: 1.07, y: -5 }}
            className="relative cursor-default"
        >
            <RarityBadge rarity={rarity} badgeBg={theme.badgeBg} />

            <div
                className="relative px-6 py-3.5 rounded-2xl overflow-hidden"
                style={{
                    background: `${theme.bg}`,
                    backdropFilter: 'blur(16px)',
                    border: `1.5px solid ${theme.border}`,
                    boxShadow: `0 0 20px ${theme.glow}, inset 0 0 30px rgba(0,0,0,0.3)`,
                }}
            >
                {/* 내부 광택선 */}
                <div className="absolute inset-x-0 top-0 h-[1px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${theme.text}40, transparent)` }} />

                {/* 희귀도별 배경 패턴 */}
                {rarity === 'Unique' && (
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, ${theme.text} 0px, ${theme.text} 1px, transparent 1px, transparent 6px)`,
                        }} />
                )}

                {/* 오행 아이콘 + 키워드 */}
                <div className="flex items-center gap-2">
                    {rarity !== 'Common' && (
                        <ShieldCheck size={12} style={{ color: `${theme.text}80` }} />
                    )}
                    <span
                        className="text-base font-black tracking-widest font-mono"
                        style={{ color: theme.text, textShadow: `0 0 12px ${theme.glow}` }}
                    >
                        #{decoded || '\u00a0'.repeat(data.text.length)}
                    </span>
                </div>

                {/* Unique 전용 골드 글로우 펄스 */}
                {rarity === 'Unique' && (
                    <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        animate={{ opacity: [0, 0.15, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ background: `radial-gradient(circle at 50% 50%, ${theme.text}, transparent 70%)` }}
                    />
                )}
            </div>
        </motion.div>
    );
};

// ── 바이럴 공유 멘트 생성 ─────────────────────────────────────────────────────

function generateViralText(keywords: DestinyKeywordData[]): string {
    const kw = keywords[0]?.text || '운명의 설계자';
    const rarity = keywords[0]?.rarity || 'Rare';
    const rarityLabel = rarity === 'Unique' ? '상위 1%' : rarity === 'Rare' ? '상위 5%' : '상위 10%';

    const templates = [
        `나는 ${rarityLabel}의 #${kw} 아키타입을 타고났어. 너는? 🔮`,
        `운명이 나에게 준 칭호는 #${kw}. Fate-Sync가 증명했다. ✨`,
        `AI가 분석한 나의 운명 코드: #${kw} — ${rarityLabel} 등급. 당신도 확인해봐.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

// ── 메인 섹션 컴포넌트 ────────────────────────────────────────────────────────

interface DestinyKeywordSectionProps {
    keywords: (string | DestinyKeywordData)[];
    element?: ElementKey;    // 지배 오행 (전체 기본값)
    title?: string;
    showShareHook?: boolean;
    /** 자동 시작 여부 (false면 버튼 클릭 시 시작) */
    autoReveal?: boolean;
}

export const DestinyKeywordSection: React.FC<DestinyKeywordSectionProps> = ({
    keywords,
    element,
    title = 'The Three Pillars of Fate',
    showShareHook = true,
    autoReveal = true,
}) => {
    const [isActive, setIsActive] = useState(false);
    const [copied, setCopied] = useState(false);

    // 키워드 정규화 (string → DestinyKeywordData)
    const normalized: DestinyKeywordData[] = keywords.map((kw, i) => {
        if (typeof kw === 'string') {
            return {
                text: kw,
                rarity: i === 0 ? 'Unique' : i === 1 ? 'Rare' : 'Common',
            };
        }
        return kw;
    });

    const viralText = generateViralText(normalized);

    useEffect(() => {
        if (!autoReveal) return;
        const t = setTimeout(() => setIsActive(true), 300);
        return () => clearTimeout(t);
    }, [autoReveal]);

    const handleCopyViral = async () => {
        await navigator.clipboard.writeText(viralText).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full flex flex-col items-center gap-6">
            {/* 헤더 */}
            <div className="text-center space-y-2">
                <p className="text-[9px] font-black tracking-[0.45em] uppercase"
                    style={{ color: 'rgba(212,175,55,0.45)' }}>
                    ✦ {title} ✦
                </p>
                {!autoReveal && !isActive && (
                    <motion.button
                        onClick={() => setIsActive(true)}
                        whileTap={{ scale: 0.96 }}
                        className="mt-2 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase"
                        style={{
                            background: 'rgba(212,175,55,0.1)',
                            border: '1px solid rgba(212,175,55,0.3)',
                            color: '#D4AF37',
                        }}
                    >
                        <Zap size={10} className="inline mr-1" />
                        운명 인장 해독하기
                    </motion.button>
                )}
            </div>

            {/* 키워드 칩 그리드 */}
            <div className="flex flex-wrap justify-center gap-4">
                {normalized.map((kw, idx) => (
                    <DestinyKeywordChip
                        key={`${kw.text}-${idx}`}
                        data={kw}
                        elementOverride={element}
                        index={idx}
                        isActive={isActive}
                    />
                ))}
            </div>

            {/* 바이럴 공유 훅 */}
            <AnimatePresence>
                {showShareHook && isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: normalized.length * 0.38 + 1.2 }}
                        className="w-full max-w-md"
                    >
                        <div className="rounded-2xl p-4 space-y-3"
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(212,175,55,0.12)',
                                backdropFilter: 'blur(12px)',
                            }}>
                            <p className="text-[9px] font-black tracking-[0.3em] uppercase"
                                style={{ color: 'rgba(212,175,55,0.4)' }}>
                                ✦ Oracle's Viral Dispatch
                            </p>
                            <p className="text-sm font-light leading-relaxed text-white/70 italic">
                                "{viralText}"
                            </p>
                            <div className="flex gap-2">
                                <motion.button
                                    onClick={handleCopyViral}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all"
                                    style={{
                                        background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${copied ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                        color: copied ? '#34d399' : 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    <Copy size={9} />
                                    {copied ? '복사 완료 ✓' : '텍스트 복사'}
                                </motion.button>
                                <motion.button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({ text: viralText, url: window.location.href }).catch(() => { });
                                        } else {
                                            handleCopyViral();
                                        }
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase"
                                    style={{
                                        background: 'rgba(212,175,55,0.12)',
                                        border: '1px solid rgba(212,175,55,0.3)',
                                        color: '#D4AF37',
                                    }}
                                >
                                    <Share2 size={9} />
                                    공유하기
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DestinyKeywordSection;
