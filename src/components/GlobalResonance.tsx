/**
 * GlobalResonance.tsx — V47
 * 전 세계 유저들의 운명 동기화 현황을 보여주는 실시간 티커(Ticker)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap } from 'lucide-react';

const resonanceData = [
    { city: 'Seoul', star: 'Zi Wei (자미)', archetype: 'The Emperor', time: 'Just now' },
    { city: 'New York', star: 'Tan Lang (탐랑)', archetype: 'The Mystic', time: '2m ago' },
    { city: 'Tokyo', star: 'Qi Sha (칠살)', archetype: 'The Warrior', time: '5m ago' },
    { city: 'Paris', star: 'Tian Ji (천기)', archetype: 'The Strategist', time: '8m ago' },
    { city: 'London', star: 'Wu Qu (무곡)', archetype: 'The Commander', time: '12m ago' },
    { city: 'Berlin', star: 'Tian Fu (천부)', archetype: 'The Treasurer', time: '15m ago' },
];

const GlobalResonance: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % resonanceData.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const current = resonanceData[index];

    return (
        <div className="w-full h-12 bg-black/60 backdrop-blur-md border-y border-white/5 flex items-center justify-center px-4 overflow-hidden">
            <div className="max-w-4xl w-full flex items-center justify-between pointer-events-none">
                {/* 라이브 지표 */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Globe className="w-3.5 h-3.5 text-mystic-gold/60" />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-mystic-gold/40 rounded-full"
                        />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-mystic-gold/40 uppercase">
                        Global Resonance Live
                    </span>
                </div>

                {/* 메시지 티커 */}
                <div className="flex-1 flex justify-center h-full relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <span className="text-[11px] font-bold text-white/80">{current.city}</span>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[11px] text-mystic-gold italic">{current.archetype}</span>
                            <span className="text-[10px] text-white/30 uppercase tracking-tighter">Synchronized</span>
                            <Zap className="w-2.5 h-2.5 text-mystic-gold/60 animate-pulse" />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 접속자 수 (가상) */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-[9px] font-mono text-white/40 tracking-tighter">
                            {Math.floor(2540 + Math.random() * 100).toLocaleString()} Active
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalResonance;
