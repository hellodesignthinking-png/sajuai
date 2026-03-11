/**
 * StarSoulCard.tsx — V42-Phase 2
 * 자미두수 주성 시네마틱 소환 카드
 *
 * ✦ 카드 플립 애니메이션 (rotateY 180° → 0°)
 * ✦ 아우라 글로우 + 배경 파티클 CSS
 * ✦ 관상 수치 기반 Affinity Score
 * ✦ DALL-E 프롬프트 + 공유 기능
 * ✦ 전체화면 모달 + 닫기 시 fade
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Share2, Copy, Check, X, Zap, Crown } from 'lucide-react';
import { STAR_SOULS } from './StarSoulArchive';

// ── 아키타입 테마 (자미·탐랑 중심, 전 주성 지원) ───────────────────────

interface StarTheme {
    gradient: string;
    glowColor: string;
    borderColor: string;
    particleColor: string;
    titleKo: string;
    affinityLabel: string;
    keyFeatureLabel: string;
}

const STAR_THEMES: Record<string, StarTheme> = {
    // ── 전사 그룹 ──
    ziwei: {
        gradient: 'linear-gradient(160deg, #0a0015 0%, #1a003d 35%, #2d0060 65%, #0a0015 100%)',
        glowColor: 'rgba(139,92,246,0.55)', borderColor: 'rgba(168,85,247,0.6)',
        particleColor: '#a855f7', titleKo: '제왕의 현신 (帝星)',
        affinityLabel: '제왕 기질 일치도', keyFeatureLabel: '인당 · 이마 (명궁)',
    },
    qisha: {
        gradient: 'linear-gradient(160deg, #120500 0%, #281000 40%, #441800 65%, #120500 100%)',
        glowColor: 'rgba(249,115,22,0.5)', borderColor: 'rgba(249,115,22,0.6)',
        particleColor: '#f97316', titleKo: '고독한 무장 (殺星)',
        affinityLabel: '투쟁 기질 일치도', keyFeatureLabel: '하악각 · 턱선 (부모궁)',
    },
    pojun: {
        gradient: 'linear-gradient(160deg, #160018 0%, #2a003a 40%, #440060 65%, #160018 100%)',
        glowColor: 'rgba(232,121,249,0.5)', borderColor: 'rgba(232,121,249,0.6)',
        particleColor: '#e879f9', titleKo: '혁명의 파괴자 (破星)',
        affinityLabel: '혁신 기질 일치도', keyFeatureLabel: '눈매 · 눈꼬리 (천이궁)',
    },
    lianzhen: {
        gradient: 'linear-gradient(160deg, #1a0000 0%, #330000 40%, #550011 65%, #1a0000 100%)',
        glowColor: 'rgba(239,68,68,0.5)', borderColor: 'rgba(239,68,68,0.6)',
        particleColor: '#ef4444', titleKo: '정의의 심판관 (廉·火星)',
        affinityLabel: '정의 기질 일치도', keyFeatureLabel: '산근 · 눈매 (질액궁)',
    },
    // ── 지도자 그룹 ──
    taiyang: {
        gradient: 'linear-gradient(160deg, #150800 0%, #2a1500 35%, #442200 65%, #150800 100%)',
        glowColor: 'rgba(245,158,11,0.5)', borderColor: 'rgba(245,158,11,0.6)',
        particleColor: '#f59e0b', titleKo: '광명의 지도자 (日星)',
        affinityLabel: '리더십 기질 일치도', keyFeatureLabel: '이마 중앙 (관록궁)',
    },
    tianfu: {
        gradient: 'linear-gradient(160deg, #1a1000 0%, #332200 40%, #553300 65%, #1a1000 100%)',
        glowColor: 'rgba(251,191,36,0.4)', borderColor: 'rgba(251,191,36,0.55)',
        particleColor: '#fbbf24', titleKo: '황금 보고 (天府星)',
        affinityLabel: '재물 보유 일치도', keyFeatureLabel: '관골 · 광대뼈 (전택궁)',
    },
    wuqu: {
        gradient: 'linear-gradient(160deg, #0a0a0f 0%, #1a1a2e 35%, #2a2a44 65%, #0a0a0f 100%)',
        glowColor: 'rgba(226,232,240,0.3)', borderColor: 'rgba(226,232,240,0.45)',
        particleColor: '#e2e8f0', titleKo: '철의 재무관 (武曲星)',
        affinityLabel: '재물 결단 일치도', keyFeatureLabel: '입술 · 일자형 (재백궁)',
    },
    tianxiang: {
        gradient: 'linear-gradient(160deg, #001226 0%, #00264a 40%, #003d6e 65%, #001226 100%)',
        glowColor: 'rgba(125,211,252,0.35)', borderColor: 'rgba(125,211,252,0.5)',
        particleColor: '#7dd3fc', titleKo: '순백의 보필관 (天相星)',
        affinityLabel: '조화 기질 일치도', keyFeatureLabel: '피부 · 대칭 (형제궁)',
    },
    // ── 학자 그룹 ──
    tianji: {
        gradient: 'linear-gradient(160deg, #001220 0%, #00264a 40%, #003d6e 70%, #001220 100%)',
        glowColor: 'rgba(6,182,212,0.45)', borderColor: 'rgba(6,182,212,0.55)',
        particleColor: '#06b6d4', titleKo: '지략의 현인 (謀星)',
        affinityLabel: '전략 기질 일치도', keyFeatureLabel: '콧대 · 산근 (형제궁)',
    },
    jumen: {
        gradient: 'linear-gradient(160deg, #0a0e14 0%, #141e28 40%, #1e2e3c 65%, #0a0e14 100%)',
        glowColor: 'rgba(148,163,184,0.3)', borderColor: 'rgba(148,163,184,0.45)',
        particleColor: '#94a3b8', titleKo: '진실의 언변 (巨門星)',
        affinityLabel: '언변 기질 일치도', keyFeatureLabel: '입술 · 구각 (노복궁)',
    },
    // ── 조율자 그룹 ──
    taiyin: {
        gradient: 'linear-gradient(160deg, #0a0015 0%, #150025 40%, #200035 65%, #0a0015 100%)',
        glowColor: 'rgba(196,181,253,0.4)', borderColor: 'rgba(196,181,253,0.55)',
        particleColor: '#c4b5fd', titleKo: '달빛의 뮤즈 (月星)',
        affinityLabel: '감성 기질 일치도', keyFeatureLabel: '얼굴형 · 곡선미 (전택궁)',
    },
    tanlang: {
        gradient: 'linear-gradient(160deg, #1a0010 0%, #330020 35%, #550030 65%, #1a0010 100%)',
        glowColor: 'rgba(244,63,94,0.5)', borderColor: 'rgba(244,63,94,0.6)',
        particleColor: '#f43f5e', titleKo: '욕망의 화신 (桃花星)',
        affinityLabel: '도화 기질 일치도', keyFeatureLabel: '눈꼬리 · 어미 (부처궁)',
    },
    tiantong: {
        gradient: 'linear-gradient(160deg, #001a10 0%, #003322 40%, #005533 65%, #001a10 100%)',
        glowColor: 'rgba(52,211,153,0.35)', borderColor: 'rgba(52,211,153,0.5)',
        particleColor: '#34d399', titleKo: '천진한 복덕성 (天同星)',
        affinityLabel: '복덕 기질 일치도', keyFeatureLabel: '볼 · 둥근 광대 (자녀궁)',
    },
    tianliang: {
        gradient: 'linear-gradient(160deg, #001a0a 0%, #003314 40%, #00551e 65%, #001a0a 100%)',
        glowColor: 'rgba(134,239,172,0.35)', borderColor: 'rgba(134,239,172,0.5)',
        particleColor: '#86efac', titleKo: '현인의 수호자 (天梁星)',
        affinityLabel: '청렴 기질 일치도', keyFeatureLabel: '귀 · 귓불 (복덕궁)',
    },
};

// 기본 테마 폴백
function getTheme(starId: string): StarTheme {
    return STAR_THEMES[starId] ?? {
        gradient: 'linear-gradient(160deg, #0a0a14, #141428, #0a0a14)',
        glowColor: 'rgba(212,175,55,0.4)', borderColor: 'rgba(212,175,55,0.5)',
        particleColor: '#D4AF37', titleKo: '운명의 별',
        affinityLabel: '기질 일치도', keyFeatureLabel: '관상 핵심 부위',
    };
}

// ── CSS 파티클 배경 ───────────────────────────────────────────────────────

const CardParticles: React.FC<{ color: string }> = ({ color }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => {
            const size = 1 + Math.random() * 2.5;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const dur = 2.5 + Math.random() * 3;
            const del = Math.random() * 2;
            return (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: size, height: size,
                        left: `${x}%`, top: `${y}%`,
                        background: color,
                        boxShadow: `0 0 ${size * 3}px ${color}`,
                    }}
                    animate={{ opacity: [0, 0.9, 0], y: [0, -20 - Math.random() * 30, 0] }}
                    transition={{ duration: dur, delay: del, repeat: Infinity, ease: 'easeInOut' }}
                />
            );
        })}
    </div>
);

// ── 별자리 패턴 SVG ───────────────────────────────────────────────────────

const ConstellationPattern: React.FC<{ color: string }> = ({ color }) => (
    <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 320 520" fill="none">
        {/* 별 연결선 */}
        <polyline points="40,80 120,40 200,80 280,40" stroke={color} strokeWidth="0.5" strokeDasharray="3 5" />
        <polyline points="60,200 160,150 260,200" stroke={color} strokeWidth="0.5" strokeDasharray="3 5" />
        <polyline points="80,350 160,300 240,350 160,420 80,350" stroke={color} strokeWidth="0.5" strokeDasharray="3 5" />
        {/* 별점 */}
        {[[40, 80], [120, 40], [200, 80], [280, 40], [60, 200], [160, 150], [260, 200], [80, 350], [160, 300], [240, 350], [160, 420]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill={color} opacity={0.8} />
        ))}
    </svg>
);

// ── 소환 링 ───────────────────────────────────────────────────────────────

const SummonRings: React.FC<{ color: string }> = ({ color }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2, 3].map(i => (
            <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{ borderColor: `${color}60` }}
                initial={{ width: 30, height: 30, opacity: 1 }}
                animate={{ width: 280, height: 280, opacity: 0 }}
                transition={{ duration: 1.8, delay: i * 0.35, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.2 }}
            />
        ))}
    </div>
);

// ── 메인 카드 컴포넌트 ────────────────────────────────────────────────────

interface StarSoulCardProps {
    /** 주성 ID (ziwei, tanlang, qisha ...) */
    starId: string;
    /** 관상 일치도 0–100 */
    syncRate?: number;
    /** 관상 핵심 특징 설명 */
    keyFeature?: string;
    /** 공유 카드가 표시될 때 자동 소환 시퀀스 실행 여부 */
    autoPlay?: boolean;
    /** 닫기 버튼 콜백 */
    onClose?: () => void;
}

const StarSoulCard: React.FC<StarSoulCardProps> = ({
    starId,
    syncRate: syncRateProp,
    keyFeature,
    autoPlay = true,
    onClose,
}) => {
    const star = STAR_SOULS.find(s => s.id === starId);
    const theme = getTheme(starId);

    const [phase, setPhase] = useState<'hidden' | 'summon' | 'card' | 'full'>('hidden' as 'hidden' | 'summon' | 'card' | 'full');
    const [copied, setCopied] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    // Affinity 계산 (syncRate 없으면 기본 범위)
    const syncRate = syncRateProp ?? (78 + Math.round(
        ((starId.charCodeAt(0) ?? 65) % 20)
    ));

    const dallePrompt = star
        ? `Anime style tarot card of ${star.codename} archetype. Facial features: ${keyFeature ?? 'sharp eyes, strong brow'}.
Classic tarot frame with gold ornaments. ${star.dallePromptBase}.
Dramatic cinematic lighting, neon ${theme.particleColor} glow, obsidian and gold palette. 8k, ultra-detailed.`
        : '';

    // 자동 소환 시퀀스
    useEffect(() => {
        if (!autoPlay) { setPhase('card'); return; }
        const t1 = setTimeout(() => setPhase('summon'), 100);
        const t2 = setTimeout(() => setPhase('card'), 1200);
        const t3 = setTimeout(() => setPhase('full'), 2000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [autoPlay]);

    const handleCopy = () => {
        navigator.clipboard.writeText(dallePrompt).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!star) return null;

    return (
        <div className="w-full flex flex-col items-center gap-6">
            {/* ── 카드 본체 ── */}
            <div className="relative" style={{ perspective: '1200px' }}>
                <AnimatePresence>
                    {phase !== 'hidden' && (
                        <motion.div
                            className="relative rounded-[2rem] overflow-hidden"
                            style={{
                                width: 300,
                                height: 480,
                                background: theme.gradient,
                                border: `1.5px solid ${theme.borderColor}`,
                                boxShadow: `0 0 60px ${theme.glowColor}, 0 0 120px ${theme.glowColor}, 0 20px 60px rgba(0,0,0,0.8)`,
                            }}
                            initial={{ rotateY: -180, opacity: 0, scale: 0.7 }}
                            animate={{
                                rotateY: phase === 'summon' ? -90 : 0,
                                opacity: (phase as string) === 'hidden' ? 0 : 1,
                                scale: phase === 'full' ? 1.04 : 1,
                            }}
                            transition={{ type: 'spring', stiffness: 180, damping: 22, delay: phase === 'summon' ? 0 : 0.1 }}
                        >
                            {/* 배경 파티클 */}
                            <CardParticles color={theme.particleColor} />

                            {/* 별자리 패턴 */}
                            <ConstellationPattern color={theme.particleColor} />

                            {/* 소환 링 */}
                            {phase === 'summon' && <SummonRings color={theme.particleColor} />}

                            {/* 카드 상단 장식 */}
                            <div className="absolute top-0 left-0 right-0 h-[2px]"
                                style={{ background: `linear-gradient(90deg, transparent, ${theme.particleColor}, transparent)` }} />
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${theme.particleColor}60)` }} />
                                <div className="w-1 h-1 rounded-full" style={{ background: theme.particleColor }} />
                                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${theme.particleColor}60)` }} />
                            </div>

                            {/* 중앙 아이콘 영역 */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <motion.div
                                    className="text-8xl"
                                    animate={{ scale: [1, 1.08, 1], filter: [`drop-shadow(0 0 8px ${theme.particleColor})`, `drop-shadow(0 0 24px ${theme.particleColor})`, `drop-shadow(0 0 8px ${theme.particleColor})`] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    {star.icon}
                                </motion.div>
                                <div className="text-center space-y-1 px-6">
                                    <div className="text-[7px] font-black tracking-[0.6em] uppercase" style={{ color: `${theme.particleColor}70` }}>
                                        {star.nameCN}
                                    </div>
                                    <div className="text-3xl font-serif font-black italic">{star.nameKo}</div>
                                    <div className="text-[9px]" style={{ color: `${theme.particleColor}80` }}>{star.codename}</div>
                                </div>
                            </div>

                            {/* 하단 정보 레이어 */}
                            <div className="absolute bottom-0 left-0 right-0 p-6"
                                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)' }}>

                                {/* 타이틀 */}
                                <div className="text-[8px] font-black tracking-[0.5em] uppercase mb-1"
                                    style={{ color: theme.particleColor }}>
                                    {theme.titleKo}
                                </div>

                                {/* 구분선 */}
                                <div className="border-t mb-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                                {/* 싱크로율 + 부위 */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[7px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                            Facial Sync
                                        </div>
                                        <motion.div
                                            className="text-xl font-serif font-black"
                                            style={{ color: theme.particleColor }}
                                            animate={{ textShadow: [`0 0 10px ${theme.glowColor}`, `0 0 28px ${theme.glowColor}`, `0 0 10px ${theme.glowColor}`] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            {syncRate}%
                                        </motion.div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[7px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                            Key Feature
                                        </div>
                                        <div className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                            {keyFeature ?? theme.keyFeatureLabel}
                                        </div>
                                    </div>
                                </div>

                                {/* 싱크로율 바 */}
                                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <motion.div
                                        className="h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${syncRate}%` }}
                                        transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                                        style={{ background: `linear-gradient(90deg, ${theme.particleColor}60, ${theme.particleColor})` }}
                                    />
                                </div>

                                {/* Affinity 판정 */}
                                <motion.div
                                    className="text-center text-[8px] font-black mt-3 py-1.5 rounded-full"
                                    style={{ background: `${theme.particleColor}15`, color: theme.particleColor, border: `1px solid ${theme.particleColor}30` }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                >
                                    {syncRate >= 90
                                        ? `✦ ${theme.affinityLabel}: 완벽 현신 — 전생의 기억`
                                        : syncRate >= 78
                                            ? `◈ ${theme.affinityLabel}: 확정 — 현신 진행 중`
                                            : `◉ ${theme.affinityLabel}: 잠재 — 각성 대기`}
                                </motion.div>
                            </div>

                            {/* 레어리티 배지 */}
                            <div className="absolute top-5 right-4">
                                <div className="px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-widest uppercase"
                                    style={{
                                        background: `${star.rarity === 'Legendary' ? '#D4AF37' : star.rarity === 'Epic' ? '#a855f7' : '#3b82f6'}20`,
                                        border: `1px solid ${star.rarity === 'Legendary' ? '#D4AF37' : star.rarity === 'Epic' ? '#a855f7' : '#3b82f6'}50`,
                                        color: star.rarity === 'Legendary' ? '#D4AF37' : star.rarity === 'Epic' ? '#a855f7' : '#3b82f6',
                                    }}>
                                    {star.rarity}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── 하단 액션 버튼 ── */}
            <AnimatePresence>
                {phase === 'full' && (
                    <motion.div
                        className="w-full max-w-[300px] space-y-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* 기질 태그 */}
                        <div className="flex flex-wrap gap-1.5 justify-center">
                            {star.traits.map(t => (
                                <span key={t}
                                    className="px-2.5 py-1 rounded-full text-[8px] font-black"
                                    style={{
                                        background: `${theme.particleColor}15`,
                                        color: theme.particleColor,
                                        border: `1px solid ${theme.particleColor}30`,
                                    }}>
                                    # {t}
                                </span>
                            ))}
                        </div>

                        {/* DALL-E 프롬프트 */}
                        <div className="rounded-xl p-3 space-y-2"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center gap-1.5">
                                <Zap className="w-3 h-3" style={{ color: 'rgba(212,175,55,0.6)' }} />
                                <span className="text-[8px] font-black tracking-widest uppercase"
                                    style={{ color: 'rgba(212,175,55,0.5)' }}>Character Synthesis Prompt</span>
                            </div>
                            <p className="text-[8px] leading-relaxed font-mono"
                                style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {dallePrompt.slice(0, 90)}...
                            </p>
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all"
                                style={{
                                    background: copied ? 'rgba(52,211,153,0.12)' : `${theme.particleColor}12`,
                                    border: `1px solid ${copied ? '#34d399' : theme.particleColor}40`,
                                    color: copied ? '#34d399' : theme.particleColor,
                                }}
                            >
                                {copied ? <><Check className="w-3 h-3" />복사됨</> : <><Copy className="w-3 h-3" />프롬프트 복사</>}
                            </button>
                        </div>

                        {/* 공유 버튼 */}
                        <button
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all"
                            style={{
                                background: `linear-gradient(135deg, ${theme.particleColor}25, ${theme.particleColor}12)`,
                                border: `1.5px solid ${theme.borderColor}`,
                                color: theme.particleColor,
                                boxShadow: `0 0 20px ${theme.glowColor}`,
                            }}
                        >
                            <Share2 className="w-4 h-4" />
                            나의 주성 인스타그램 공유
                        </button>

                        {/* 닫기 */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 rounded-2xl font-black text-xs tracking-widest uppercase"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.3)',
                                }}
                            >
                                수호성 아카이브로
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── 풀스크린 소환 오버레이 ────────────────────────────────────────────────

interface StarSoulSummonProps {
    starId: string;
    syncRate?: number;
    keyFeature?: string;
    isOpen: boolean;
    onClose: () => void;
    /** 소환 위치 (명궁 클릭 좌표) */
    originPos?: { x: number; y: number };
}

export const StarSoulSummon: React.FC<StarSoulSummonProps> = ({
    starId, syncRate, keyFeature, isOpen, onClose, originPos,
}) => {
    const theme = getTheme(starId);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[700] flex items-center justify-center overflow-y-auto"
                    style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* 원점 파티클 버스트 */}
                    {originPos && (
                        <div className="fixed pointer-events-none"
                            style={{ left: originPos.x, top: originPos.y }}>
                            {Array.from({ length: 20 }).map((_, i) => {
                                const angle = (i / 20) * Math.PI * 2;
                                const dist = 60 + Math.random() * 80;
                                return (
                                    <motion.div key={i}
                                        className="absolute w-1 h-1 rounded-full"
                                        style={{ background: theme.particleColor }}
                                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                        animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0 }}
                                        transition={{ duration: 0.8, delay: i * 0.02, ease: 'easeOut' }}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* 카드 컨테이너 */}
                    <motion.div
                        className="relative py-10 px-4"
                        initial={{ scale: 0.6, opacity: 0, y: originPos ? (originPos.y - window.innerHeight / 2) : 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* X 버튼 */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <StarSoulCard
                            starId={starId}
                            syncRate={syncRate}
                            keyFeature={keyFeature}
                            autoPlay
                            onClose={onClose}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StarSoulCard;
