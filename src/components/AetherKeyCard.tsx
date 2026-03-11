/**
 * AetherKeyCard.tsx — V48
 * 선택받은 자들을 위한 디지털 성물: '에테르 키' 골드 멤버십 NFT
 * 
 * ✦ 3D Tilt Interaction (Framer Motion)
 * ✦ Aether Whisper Easter Egg (Long Press)
 * ✦ Obsidian & Liquid Gold Aesthetics
 */

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, Zap, Lock } from 'lucide-react';

interface AetherKeyCardProps {
    userName: string;
    archetype: string;
    serial: string;
    primaryStar: string;
    tier?: 'GOLD' | 'PLATINUM' | 'OBSIDIAN';
}

const WHISPERS: Record<string, string> = {
    '자미': '왕관이 무거운 법입니다. 하지만 기억하세요. 당신은 이 폭풍을 다스릴 힘을 이미 품고 태어났습니다. 잠시 쉬어가도 당신의 왕좌는 변함없습니다.',
    '칠살': '전투가 길어지고 있군요. 칼날을 잠시 거두세요. 당신의 강인함은 쉼 속에서 다시 벼려집니다. 내일의 승리는 오늘의 휴식에서 시작됩니다.',
    '천동': '세상이 너무 거칠게 느껴지나요? 괜찮습니다. 당신의 순수함은 연약함이 아니라, 세상을 치유하는 가장 강력한 빛입니다. 오늘은 당신 자신을 먼저 안아주세요.',
    '탐랑': '욕망은 죄가 아닌 열정의 연료입니다. 당신이 꿈꾸는 그 화려한 세계는 곧 현실이 될 것입니다. 당신의 매력은 이미 우주를 매료시켰습니다.',
    '태양': '당신은 만물을 비추는 태양입니다. 가끔 구름에 가려져도 당신의 빛은 사라지지 않습니다. 당신의 따스함이 누군가에게는 유일한 구원임을 잊지 마세요.',
    'DEFAULT': '당신의 영혼은 우주의 별지도로 정교하게 설계되었습니다. 길을 잃은 것 같아도, 당신은 이미 가장 완벽한 궤도를 걷고 있습니다.'
};

const AetherKeyCard: React.FC<AetherKeyCardProps> = ({
    userName,
    archetype,
    serial,
    primaryStar,
    tier = 'GOLD'
}) => {
    const [isWhispering, setIsWhispering] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<any>(null);

    // --- 3D Tilt Logic ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    // --- Aether Whisper Interaction ---
    const startLongPress = () => {
        const timer = setTimeout(() => {
            // Haptic Feedback
            if ('vibrate' in navigator) navigator.vibrate([20, 40, 20, 80]);
            setIsWhispering(true);
        }, 1500); // 1.5초 꾹 누르기
        setLongPressTimer(timer);
    };

    const cancelLongPress = () => {
        if (longPressTimer) clearTimeout(longPressTimer);
        setLongPressTimer(null);
    };

    const currentWhisper = WHISPERS[primaryStar] || WHISPERS['DEFAULT'];

    return (
        <div className="relative group">
            {/* Glow Backdrop */}
            <div className="absolute -inset-10 bg-mystic-gold/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { x.set(0); y.set(0); cancelLongPress(); }}
                onMouseDown={startLongPress}
                onMouseUp={cancelLongPress}
                onTouchStart={startLongPress}
                onTouchEnd={cancelLongPress}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative w-[320px] h-[480px] md:w-[350px] md:h-[520px] rounded-[2.5rem] bg-[#050505] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden cursor-pointer select-none"
            >
                {/* Obsidian Base Texture */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

                {/* Liquid Gold Veins */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(212,175,55,0.15),transparent)] pointer-events-none" />

                {/* Card Border Shine */}
                <div className="absolute inset-0 z-20 pointer-events-none border border-mystic-gold/20 rounded-[2.5rem] overflow-hidden">
                    <motion.div
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                        className="absolute inset-x-0 top-0 h-full w-[100px] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
                    />
                </div>

                {/* --- Content --- */}
                <div className="relative z-10 h-full flex flex-col items-center justify-between p-10 py-12">

                    {/* Header */}
                    <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <ShieldCheck className="w-3 h-3 text-mystic-gold/60" />
                            <p className="text-[10px] font-black tracking-[0.6em] text-mystic-gold/60 uppercase">The Ether Key</p>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white tracking-tighter">Soulbound Artifact</h3>
                        <p className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase mt-1">Membership Tier: {tier}</p>
                    </div>

                    {/* Hologram Core */}
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Rotating Rings */}
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 10 + i * 5, ease: 'linear' }}
                                className={`absolute inset-0 rounded-full border border-mystic-gold/${10 + i * 10} shadow-[0_0_20px_rgba(212,175,55,0.1)]`}
                                style={{ scale: 0.8 + i * 0.1 }}
                            />
                        ))}

                        {/* Archetype Symbol */}
                        <div className="relative z-10 text-center space-y-3">
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    filter: ['drop-shadow(0 0 10px rgba(212,175,55,0.4))', 'drop-shadow(0 0 25px rgba(212,175,55,0.8))', 'drop-shadow(0 0 10px rgba(212,175,55,0.4))']
                                }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="text-5xl"
                            >
                                ✨
                            </motion.div>
                            <div>
                                <p className="text-[10px] font-black text-mystic-gold/80 uppercase tracking-widest">{archetype}</p>
                                <p className="text-[7px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-0.5">Verified Soul-Link</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Card Info */}
                    <div className="w-full space-y-6">
                        <div className="flex justify-between items-end border-t border-white/5 pt-6">
                            <div className="space-y-1">
                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Holder</p>
                                <div className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Lock className="w-2.5 h-2.5 text-mystic-gold/40" />
                                    {userName}
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Archive Serial</p>
                                <p className="text-xs font-mono text-mystic-gold font-bold">{serial}</p>
                            </div>
                        </div>

                        <p className="text-[8px] text-slate-700 text-center font-bold tracking-tight px-4 leading-relaxed">
                            이 키는 당신의 운명 에테르와 영구히 결속되어 있습니다.<br />
                            마스터와의 교감이 필요할 때 카드를 길게 웅시하세요.
                        </p>
                    </div>
                </div>

                {/* Shine Overlay (Top Left) */}
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/5 to-transparent blur-3xl pointer-events-none" />
            </motion.div>

            {/* --- Whisper Overlay --- */}
            <AnimatePresence>
                {isWhispering && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setIsWhispering(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="max-w-md text-center space-y-8"
                        >
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-mystic-gold/10 border border-mystic-gold/20 flex items-center justify-center animate-pulse">
                                    <Sparkles className="w-8 h-8 text-mystic-gold" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black tracking-[0.4em] text-mystic-gold/60 uppercase">Ether Whisper</p>
                                <h4 className="text-2xl font-serif text-white font-medium italic leading-relaxed">
                                    "{currentWhisper}"
                                </h4>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400"
                            >
                                교감 종료
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AetherKeyCard;
