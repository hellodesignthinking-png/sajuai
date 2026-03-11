/**
 * StarSoulArchive.tsx — V42
 * 자미두수 14주성 '스타-소울 아카이브'
 *
 * ✦ 14개 주성 × 애니메이션 홀로그램 카드
 * ✦ 사용자 주성(MingStar) 하이라이트 + 소환 시퀀스
 * ✦ DALL-E 프롬프트 자동 생성기 (얼굴 수치 반영)
 * ✦ 바이럴 공유 카드 스냅샷
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Share2, Copy, Check } from 'lucide-react';

// ── 14주성 아키타입 정의 ──────────────────────────────────────────────────

export interface StarSoul {
    id: string;
    nameKo: string;
    nameCN: string;
    codename: string;        // 캐릭터 코드명
    archetype: string;       // 현대적 아키타입
    color: string;
    glow: string;
    gradient: string;
    icon: string;            // 이모지 아이콘
    traits: string[];
    element: string;         // 오행
    energy: 'yin' | 'yang';
    rarity: 'Legendary' | 'Epic' | 'Rare' | 'Uncommon';
    dallePromptBase: string;
    bgPattern: string;       // CSS 배경 패턴 설명
}

export const STAR_SOULS: StarSoul[] = [
    {
        id: 'ziwei', nameKo: '자미성', nameCN: '紫微星',
        codename: 'THE REGAL EMPEROR',
        archetype: '제왕형 지배자',
        color: '#a855f7', glow: 'rgba(168,85,247,0.4)',
        gradient: 'linear-gradient(135deg, #1a003d, #2d0060, #4a0080)',
        icon: '👑', traits: ['권위', '지배력', '완벽주의', '카리스마'],
        element: '토', energy: 'yang', rarity: 'Legendary',
        dallePromptBase: 'regal emperor in violet imperial robes, golden celestial crown, commanding gaze, imperial throne room',
        bgPattern: 'radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.3) 0%, transparent 60%)',
    },
    {
        id: 'tianji', nameKo: '천기성', nameCN: '天機星',
        codename: 'THE GRAND STRATEGIST',
        archetype: '전략가형 지식인',
        color: '#06b6d4', glow: 'rgba(6,182,212,0.35)',
        gradient: 'linear-gradient(135deg, #001a26, #003344, #005566)',
        icon: '🧠', traits: ['지혜', '고도의 계획력', '예민함', '변화 적응'],
        element: '목', energy: 'yin', rarity: 'Epic',
        dallePromptBase: 'intellectual strategist with holographic star maps, thin-rimmed glasses, elegant research lab, glowing data streams',
        bgPattern: 'radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.25) 0%, transparent 55%)',
    },
    {
        id: 'taiyang', nameKo: '태양성', nameCN: '太陽星',
        codename: 'THE RADIANT LEADER',
        archetype: '광명형 리더',
        color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',
        gradient: 'linear-gradient(135deg, #1a0e00, #332200, #554400)',
        icon: '☀️', traits: ['공익심', '명예', '강한 에너지', '정의감'],
        element: '화', energy: 'yang', rarity: 'Legendary',
        dallePromptBase: 'radiant knight leader in shining gold armor with solar emblems, bright confident smile, crowds cheering',
        bgPattern: 'radial-gradient(ellipse at 50% 10%, rgba(245,158,11,0.35) 0%, transparent 50%)',
    },
    {
        id: 'wuqu', nameKo: '무곡성', nameCN: '武曲星',
        codename: 'THE IRON TREASURER',
        archetype: '재력형 결단가',
        color: '#e2e8f0', glow: 'rgba(226,232,240,0.3)',
        gradient: 'linear-gradient(135deg, #0a0a0f, #1a1a2e, #2a2a44)',
        icon: '⚖️', traits: ['재물욕', '결단력', '독립심', '숫자 감각'],
        element: '금', energy: 'yang', rarity: 'Epic',
        dallePromptBase: 'silver-armored financial strategist, massive iron scales, vault room filled with starlit coins, cold precise eyes',
        bgPattern: 'radial-gradient(ellipse at 20% 80%, rgba(226,232,240,0.15) 0%, transparent 50%)',
    },
    {
        id: 'tiantong', nameKo: '천동성', nameCN: '天同星',
        codename: 'THE GENTLE HEALER',
        archetype: '치유형 복지인',
        color: '#34d399', glow: 'rgba(52,211,153,0.3)',
        gradient: 'linear-gradient(135deg, #001a10, #003322, #005533)',
        icon: '🌿', traits: ['복덕', '낙천성', '인내심', '평화 추구'],
        element: '수', energy: 'yin', rarity: 'Rare',
        dallePromptBase: 'gentle healer in soft jade robes, surrounded by glowing nature spirits and healing light, warm serene smile',
        bgPattern: 'radial-gradient(ellipse at 60% 70%, rgba(52,211,153,0.2) 0%, transparent 55%)',
    },
    {
        id: 'lianzhen', nameKo: '염정성', nameCN: '廉貞星',
        codename: 'THE FLAME JUSTICE',
        archetype: '정의형 투사',
        color: '#ef4444', glow: 'rgba(239,68,68,0.35)',
        gradient: 'linear-gradient(135deg, #1a0000, #330000, #550011)',
        icon: '⚔️', traits: ['정의감', '강한 의지', '승부욕', '솔직함'],
        element: '화', energy: 'yang', rarity: 'Epic',
        dallePromptBase: 'fierce justice warrior wielding a flaming sword, deep red phoenix armor, intense burning gaze, battlefield backdrop',
        bgPattern: 'radial-gradient(ellipse at 80% 20%, rgba(239,68,68,0.3) 0%, transparent 50%)',
    },
    {
        id: 'tianfu', nameKo: '천부성', nameCN: '天府星',
        codename: 'THE CELESTIAL GUARDIAN',
        archetype: '보수형 수호자',
        color: '#fbbf24', glow: 'rgba(251,191,36,0.3)',
        gradient: 'linear-gradient(135deg, #1a1000, #332200, #553300)',
        icon: '🏛️', traits: ['안정 지향', '자산 축적', '신뢰감', '보수적'],
        element: '토', energy: 'yin', rarity: 'Rare',
        dallePromptBase: 'celestial guardian standing before golden treasury vault, blessed armor engraved with wealth symbols, calm protective stance',
        bgPattern: 'radial-gradient(ellipse at 40% 60%, rgba(251,191,36,0.2) 0%, transparent 55%)',
    },
    {
        id: 'taiyin', nameKo: '태음성', nameCN: '太陰星',
        codename: 'THE LUNAR MUSE',
        archetype: '감성형 몽상가',
        color: '#c4b5fd', glow: 'rgba(196,181,253,0.35)',
        gradient: 'linear-gradient(135deg, #0a0015, #150025, #200035)',
        icon: '🌙', traits: ['감수성', '예술적', '직관력', '은근한 매력'],
        element: '수', energy: 'yin', rarity: 'Epic',
        dallePromptBase: 'mysterious lunar muse in translucent moonlit robes, silver crescent crown, dreamy ethereal background, otherworldly beauty',
        bgPattern: 'radial-gradient(ellipse at 30% 30%, rgba(196,181,253,0.3) 0%, transparent 55%)',
    },
    {
        id: 'tanlang', nameKo: '탐랑성', nameCN: '貪狼星',
        codename: 'THE MYSTIC SEDUCER',
        archetype: '도화형 예술가',
        color: '#f43f5e', glow: 'rgba(244,63,94,0.4)',
        gradient: 'linear-gradient(135deg, #1a0010, #330020, #550030)',
        icon: '🌹', traits: ['욕망', '도화 기질', '사교성', '다재다능'],
        element: '수·목', energy: 'yin', rarity: 'Legendary',
        dallePromptBase: 'alluring mystic seducer with ornate jewelry, roses and smoke, enchanting eyes, bohemian baroque aesthetic, nightclub atmosphere',
        bgPattern: 'radial-gradient(ellipse at 65% 35%, rgba(244,63,94,0.35) 0%, transparent 50%)',
    },
    {
        id: 'jumen', nameKo: '거문성', nameCN: '巨門星',
        codename: 'THE SILVER TONGUE',
        archetype: '언변형 논객',
        color: '#94a3b8', glow: 'rgba(148,163,184,0.3)',
        gradient: 'linear-gradient(135deg, #0a0e14, #141e28, #1e2e3c)',
        icon: '📖', traits: ['언변', '학문', '논리력', '비판적 사고'],
        element: '수', energy: 'yin', rarity: 'Uncommon',
        dallePromptBase: 'eloquent silver-tongued scholar with ancient scrolls, debate chamber, blue-silver scholar robes, piercing analytical gaze',
        bgPattern: 'radial-gradient(ellipse at 50% 50%, rgba(148,163,184,0.15) 0%, transparent 60%)',
    },
    {
        id: 'tianxiang', nameKo: '천상성', nameCN: '天相星',
        codename: 'THE DIVINE AIDE',
        archetype: '조력형 보필자',
        color: '#7dd3fc', glow: 'rgba(125,211,252,0.3)',
        gradient: 'linear-gradient(135deg, #001226, #002244, #003366)',
        icon: '🦋', traits: ['봉사', '협력', '세심함', '사교 능력'],
        element: '수', energy: 'yang', rarity: 'Rare',
        dallePromptBase: 'graceful divine aide with butterfly wings, celestial blue robes, assisting a great leader, angelic support energy',
        bgPattern: 'radial-gradient(ellipse at 70% 60%, rgba(125,211,252,0.2) 0%, transparent 55%)',
    },
    {
        id: 'tianliang', nameKo: '천량성', nameCN: '天梁星',
        codename: 'THE SAGE PROTECTOR',
        archetype: '지혜형 수호성인',
        color: '#86efac', glow: 'rgba(134,239,172,0.3)',
        gradient: 'linear-gradient(135deg, #001a0a, #003314, #00551e)',
        icon: '🛡️', traits: ['청렴함', '정직', '풍요 기원', '장수'],
        element: '토', energy: 'yang', rarity: 'Rare',
        dallePromptBase: 'ancient sage protector with jade shield, emerald ceremonial robes, benevolent smile, historical temple background',
        bgPattern: 'radial-gradient(ellipse at 25% 75%, rgba(134,239,172,0.2) 0%, transparent 55%)',
    },
    {
        id: 'qisha', nameKo: '칠살성', nameCN: '七殺星',
        codename: 'THE LONE GENERAL',
        archetype: '독립형 전사',
        color: '#f97316', glow: 'rgba(249,115,22,0.4)',
        gradient: 'linear-gradient(135deg, #1a0a00, #331400, #551e00)',
        icon: '⚡', traits: ['투쟁심', '독립성', '결단력', '외로운 승부사'],
        element: '금', energy: 'yang', rarity: 'Epic',
        dallePromptBase: 'lone general with battle-scarred face and massive sword, storm and lightning backdrop, solitary figure on cliff, fierce independence',
        bgPattern: 'radial-gradient(ellipse at 80% 80%, rgba(249,115,22,0.3) 0%, transparent 50%)',
    },
    {
        id: 'pojun', nameKo: '파군성', nameCN: '破軍星',
        codename: 'THE REBEL DESTROYER',
        archetype: '혁명형 파괴자',
        color: '#e879f9', glow: 'rgba(232,121,249,0.4)',
        gradient: 'linear-gradient(135deg, #1a001a, #330033, #550055)',
        icon: '💥', traits: ['파괴와 혁신', '모험심', '개척자', '변혁 에너지'],
        element: '수', energy: 'yang', rarity: 'Legendary',
        dallePromptBase: 'charismatic rebel destroyer in tattered royal cloak, burning city in background, wild hair, anarchic energy, revolutionary spirit',
        bgPattern: 'radial-gradient(ellipse at 40% 20%, rgba(232,121,249,0.35) 0%, transparent 50%)',
    },
];

const RARITY_COLOR: Record<string, string> = {
    Legendary: '#D4AF37',
    Epic: '#a855f7',
    Rare: '#3b82f6',
    Uncommon: '#94a3b8',
};

// ── 소환 동심원 애니메이션 ─────────────────────────────────────────────────

const SummonRings = ({ color }: { color: string }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2].map(i => (
            <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{ borderColor: `${color}60` }}
                initial={{ width: 20, height: 20, opacity: 0.8 }}
                animate={{ width: 200, height: 200, opacity: 0 }}
                transition={{ duration: 1.4, delay: i * 0.28, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.5 }}
            />
        ))}
    </div>
);

// ── 주성 카드 ─────────────────────────────────────────────────────────────

interface StarCardProps {
    star: StarSoul;
    isActive: boolean;
    isOwned: boolean;
    onClick: (star: StarSoul) => void;
}

const StarCard: React.FC<StarCardProps> = ({ star, isActive, isOwned, onClick }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.button
            onClick={() => onClick(star)}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden text-left transition-all"
            style={{
                background: star.gradient,
                border: `1.5px solid ${isActive || isOwned ? star.color + '70' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: isActive
                    ? `0 0 28px ${star.glow}, 0 0 60px ${star.glow}`
                    : isOwned
                        ? `0 0 16px ${star.glow}`
                        : 'none',
                filter: !isOwned ? 'brightness(0.55) saturate(0.4)' : 'none',
                transition: 'all 0.3s ease',
            }}
            layout
        >
            {/* 배경 패턴 */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: star.bgPattern }} />

            {/* 소환 동심원 (활성 상태) */}
            {isActive && <SummonRings color={star.color} />}

            {/* 상단 레어리티 뱃지 */}
            <div className="absolute top-2 right-2 z-10">
                <div className="px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-widest uppercase"
                    style={{
                        background: `${RARITY_COLOR[star.rarity]}20`,
                        border: `1px solid ${RARITY_COLOR[star.rarity]}50`,
                        color: RARITY_COLOR[star.rarity],
                    }}>
                    {star.rarity}
                </div>
            </div>

            {/* 소유 배지 */}
            {isOwned && !isActive && (
                <div className="absolute top-2 left-2 z-10">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: star.color }}>
                        <Star className="w-2 h-2 text-black" fill="currentColor" />
                    </div>
                </div>
            )}

            <div className="relative z-10 p-3 space-y-2">
                {/* 아이콘 */}
                <div className="text-2xl leading-none">{star.icon}</div>

                {/* 이름 */}
                <div>
                    <div className="text-[7px] font-black tracking-[0.3em] uppercase"
                        style={{ color: `${star.color}80` }}>{star.nameCN}</div>
                    <div className="text-[10px] font-black leading-tight mt-0.5"
                        style={{ color: isOwned ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}>
                        {star.nameKo}
                    </div>
                    <div className="text-[7px] mt-0.5 leading-tight"
                        style={{ color: isOwned ? `${star.color}80` : 'rgba(255,255,255,0.15)' }}>
                        {star.codename}
                    </div>
                </div>

                {/* 기질 태그 (활성/소유 시만) */}
                {isOwned && (
                    <div className="flex flex-wrap gap-0.5">
                        {star.traits.slice(0, 2).map(t => (
                            <span key={t} className="px-1 py-0.5 rounded text-[6px] font-black"
                                style={{
                                    background: `${star.color}15`,
                                    color: `${star.color}80`,
                                    border: `1px solid ${star.color}20`,
                                }}>
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                {/* 잠금 표시 (미소유) */}
                {!isOwned && (
                    <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                        ??? 미확인 성좌
                    </div>
                )}
            </div>

            {/* 활성 펄스 테두리 */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ border: `2px solid ${star.color}`, boxShadow: `inset 0 0 20px ${star.glow}` }}
                />
            )}
        </motion.button>
    );
};

// ── 활성 카드 상세 모달 ─────────────────────────────────────────────────────

interface StarDetailModalProps {
    star: StarSoul;
    isUserStar: boolean;
    facialDesc?: string;
    onClose: () => void;
    onCopyPrompt: () => void;
    copied: boolean;
}

const StarDetailModal: React.FC<StarDetailModalProps> = ({
    star, isUserStar, facialDesc = 'sharp eyes, balanced features',
    onClose, onCopyPrompt, copied,
}) => {
    const fullPrompt = `Anime style tarot card of ${star.codename} archetype. The character has facial features inspired by: [${facialDesc}]. Classic tarot frame with gold ornaments. ${star.dallePromptBase}. Neon effect and obsidian background. High-quality digital art, 8k resolution, cinematic lighting.`;
    const synchroRate = isUserStar ? (82 + Math.round(Math.random() * 15)) : 0;

    return (
        <motion.div
            className="fixed inset-0 z-[600] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="relative w-full max-w-sm rounded-3xl overflow-hidden"
                style={{
                    background: star.gradient,
                    border: `1.5px solid ${star.color}60`,
                    boxShadow: `0 0 60px ${star.glow}, 0 20px 80px rgba(0,0,0,0.7)`,
                }}
                initial={{ scale: 0.85, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                onClick={e => e.stopPropagation()}
            >
                {/* 배경 패턴 */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: star.bgPattern }} />

                {/* 소환 동심원 */}
                <SummonRings color={star.color} />

                {/* 상단 글로우선 */}
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${star.color}, transparent)` }} />

                <div className="relative z-10 p-6 space-y-5">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">{star.icon}</div>
                            <div>
                                <div className="text-[8px] font-black tracking-[0.4em] uppercase"
                                    style={{ color: `${star.color}70` }}>{star.nameCN} · {star.nameKo}</div>
                                <h3 className="text-lg font-black leading-tight mt-0.5">{star.codename}</h3>
                                <div className="text-[9px] mt-0.5" style={{ color: `${star.color}80` }}>{star.archetype}</div>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                            style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.5)' }}>✕</button>
                    </div>

                    {/* 레어리티 + 소유 배지 */}
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-[8px] font-black tracking-widest uppercase"
                            style={{ background: `${RARITY_COLOR[star.rarity]}20`, color: RARITY_COLOR[star.rarity], border: `1px solid ${RARITY_COLOR[star.rarity]}40` }}>
                            ✦ {star.rarity}
                        </span>
                        <span className="px-2 py-1 rounded-full text-[8px] font-black"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                            오행: {star.element}
                        </span>
                        <span className="px-2 py-1 rounded-full text-[8px] font-black"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                            {star.energy === 'yang' ? '양(陽)' : '음(陰)'}
                        </span>
                    </div>

                    {/* 싱크로율 (내 별일 때) */}
                    {isUserStar && (
                        <div className="rounded-2xl p-4 space-y-2"
                            style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${star.color}30` }}>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black tracking-wider uppercase"
                                    style={{ color: `${star.color}70` }}>관상 일치도 (Synchro)</span>
                                <motion.span
                                    className="text-xl font-serif font-black"
                                    style={{ color: star.color }}
                                    animate={{ textShadow: [`0 0 10px ${star.glow}`, `0 0 25px ${star.glow}`, `0 0 10px ${star.glow}`] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {synchroRate}%
                                </motion.span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <motion.div className="h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${synchroRate}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    style={{ background: `linear-gradient(90deg, ${star.color}60, ${star.color})` }}
                                />
                            </div>
                            <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                당신의 명궁 관상이 <span style={{ color: star.color }}>{star.nameKo}</span>의
                                기운과 {synchroRate}% 일치합니다. 이 별의 기질이 당신의 외형으로 완벽히 현신(Manifest)했습니다.
                            </p>
                        </div>
                    )}

                    {/* 기질 태그 */}
                    <div className="flex flex-wrap gap-1.5">
                        {star.traits.map(t => (
                            <span key={t} className="px-2.5 py-1 rounded-full text-[9px] font-black"
                                style={{ background: `${star.color}15`, color: star.color, border: `1px solid ${star.color}30` }}>
                                # {t}
                            </span>
                        ))}
                    </div>

                    {/* DALL-E 프롬프트 */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3" style={{ color: 'rgba(212,175,55,0.6)' }} />
                            <span className="text-[8px] font-black tracking-[0.3em] uppercase"
                                style={{ color: 'rgba(212,175,55,0.5)' }}>Character Synthesis Prompt</span>
                        </div>
                        <div className="rounded-xl p-3 text-[9px] leading-relaxed font-mono"
                            style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.45)',
                            }}>
                            {fullPrompt.slice(0, 120)}...
                        </div>
                        <button
                            onClick={onCopyPrompt}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all"
                            style={{
                                background: copied ? 'rgba(52,211,153,0.15)' : `${star.color}15`,
                                border: `1px solid ${copied ? '#34d399' : star.color}40`,
                                color: copied ? '#34d399' : star.color,
                            }}
                        >
                            {copied ? <><Check className="w-3 h-3" /> 복사됨</> : <><Copy className="w-3 h-3" /> 프롬프트 복사</>}
                        </button>
                    </div>

                    {/* 공유 버튼 */}
                    <button
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs tracking-widest uppercase"
                        style={{
                            background: `linear-gradient(135deg, ${star.color}30, ${star.color}15)`,
                            border: `1px solid ${star.color}50`,
                            color: star.color,
                            boxShadow: `0 0 20px ${star.glow}`,
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        나의 주성 공유하기
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

interface StarSoulArchiveProps {
    /** 사용자의 자미두수 주성 ID (예: 'ziwei', 'tanlang') */
    userStarId?: string;
    /** 관상 수치 기반 얼굴 설명 문자열 (DALL-E 프롬프트용) */
    facialDesc?: string;
}

const StarSoulArchive: React.FC<StarSoulArchiveProps> = ({
    userStarId,
    facialDesc = 'sharp eyes, strong jaw, balanced facial features',
}) => {
    const [activeStar, setActiveStar] = useState<StarSoul | null>(null);
    const [detailStar, setDetailStar] = useState<StarSoul | null>(
        userStarId ? STAR_SOULS.find(s => s.id === userStarId) ?? null : null
    );
    const [copied, setCopied] = useState(false);
    const [revealed, setRevealed] = useState(false);

    // 사용자가 주성을 받았을 때 자동 소환 시퀀스
    useEffect(() => {
        if (userStarId && !revealed) {
            const star = STAR_SOULS.find(s => s.id === userStarId);
            if (star) {
                const t1 = setTimeout(() => setActiveStar(star), 600);
                const t2 = setTimeout(() => setRevealed(true), 2400);
                return () => { clearTimeout(t1); clearTimeout(t2); };
            }
        }
    }, [userStarId, revealed]);

    const handleCardClick = useCallback((star: StarSoul) => {
        const isOwned = star.id === userStarId;
        if (!isOwned) return; // 미소유 별은 클릭 불가
        setActiveStar(star);
        setDetailStar(star);
    }, [userStarId]);

    const handleCopyPrompt = useCallback(() => {
        if (!detailStar) return;
        const prompt = `Anime style tarot card of ${detailStar.codename} archetype. The character has facial features inspired by: [${facialDesc}]. Classic tarot frame with gold ornaments. ${detailStar.dallePromptBase}. Neon effect and obsidian background. High-quality digital art, 8k resolution, cinematic lighting.`;
        navigator.clipboard.writeText(prompt).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }, [detailStar, facialDesc]);

    const userStar = userStarId ? STAR_SOULS.find(s => s.id === userStarId) : null;

    return (
        <div className="w-full space-y-6">
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3))' }} />
                <div className="text-center">
                    <p className="text-[8px] font-black tracking-[0.5em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                        V42 · Star-Soul Archive
                    </p>
                    <h3 className="text-sm font-serif font-black" style={{ color: 'rgba(212,175,55,0.9)' }}>
                        자미두수 14주성 소울 아카이브
                    </h3>
                    {userStar && (
                        <motion.p
                            className="text-[9px] mt-1"
                            style={{ color: userStar.color }}
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            당신의 명궁 주성: {userStar.icon} {userStar.nameKo} — {userStar.codename}
                        </motion.p>
                    )}
                </div>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.3))' }} />
            </div>

            {/* 사용자 주성 배너 */}
            {userStar && (
                <motion.div
                    className="relative rounded-2xl overflow-hidden p-5 cursor-pointer"
                    style={{
                        background: userStar.gradient,
                        border: `1.5px solid ${userStar.color}60`,
                        boxShadow: `0 0 40px ${userStar.glow}`,
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => { setActiveStar(userStar); setDetailStar(userStar); }}
                >
                    <div className="absolute inset-0 pointer-events-none" style={{ background: userStar.bgPattern }} />
                    <SummonRings color={userStar.color} />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="text-5xl">{userStar.icon}</div>
                        <div className="flex-1">
                            <div className="text-[8px] font-black tracking-[0.4em] uppercase"
                                style={{ color: `${userStar.color}70` }}>YOUR DESTINY STAR · {userStar.nameCN}</div>
                            <h4 className="text-xl font-black mt-0.5">{userStar.codename}</h4>
                            <p className="text-[10px] mt-1" style={{ color: `${userStar.color}80` }}>{userStar.archetype}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>RARITY</div>
                            <div className="text-sm font-black" style={{ color: RARITY_COLOR[userStar.rarity] }}>
                                {userStar.rarity}
                            </div>
                            <div className="text-[8px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>탭하여 상세 보기</div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 14주성 카드 그리드 */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Star className="w-3 h-3" style={{ color: 'rgba(212,175,55,0.5)' }} />
                    <span className="text-[8px] font-black tracking-[0.35em] uppercase" style={{ color: 'rgba(212,175,55,0.45)' }}>
                        전체 아카이브 — {userStarId ? '1' : '0'}/14 해제됨
                    </span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {STAR_SOULS.map((star, i) => (
                        <motion.div
                            key={star.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                        >
                            <StarCard
                                star={star}
                                isActive={activeStar?.id === star.id}
                                isOwned={star.id === userStarId}
                                onClick={handleCardClick}
                            />
                        </motion.div>
                    ))}
                </div>
                <p className="text-center text-[8px] mt-3" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    잠긴 카드는 추가 분석 시 해제됩니다
                </p>
            </div>

            {/* 상세 모달 */}
            <AnimatePresence>
                {detailStar && (
                    <StarDetailModal
                        key={detailStar.id}
                        star={detailStar}
                        isUserStar={detailStar.id === userStarId}
                        facialDesc={facialDesc}
                        onClose={() => setDetailStar(null)}
                        onCopyPrompt={handleCopyPrompt}
                        copied={copied}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default StarSoulArchive;
