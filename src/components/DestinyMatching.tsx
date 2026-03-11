/**
 * DestinyMatching.tsx - V52
 * 글로벌 운명 네트워크 시각화
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Link2, Share2 } from 'lucide-react';

export const DestinyMatching: React.FC<{ archetype: string }> = ({ archetype }) => {
    const matchCount = useMemo(() => Math.floor(Math.random() * 15) + 3, [archetype]);

    return (
        <div className="w-full mt-12 mb-8 glass-panel p-8 relative overflow-hidden group border-mystic-gold/20">
            {/* Background Constellation Effect */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000">
                <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
                    {[...Array(20)].map((_, i) => (
                        <circle key={i} cx={Math.random() * 400} cy={Math.random() * 200} r="1" fill="#D4AF37">
                            <animate attributeName="opacity" values="0;1;0" dur={`${Math.random() * 3 + 2}s`} repeatCount="indefinite" />
                        </circle>
                    ))}
                    <path d="M50,50 L150,80 L250,40 L350,120" stroke="#D4AF37" strokeWidth="0.5" fill="none" opacity="0.3" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-mystic-gold/10 border border-mystic-gold/30">
                    <Globe className="w-8 h-8 text-mystic-gold animate-spin-slow" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-black text-white">Global Destiny Connection</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        현재 에테르 라운지에 접속 중인 유저 중 당신과 상성 99%인 <span className="text-mystic-gold font-bold">'{archetype}'</span> 아키타입이 <span className="text-white font-black">{matchCount}명</span> 존재합니다.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-2.5 bg-mystic-gold/20 border border-mystic-gold/40 rounded-full text-mystic-gold text-[10px] font-black uppercase tracking-widest hover:bg-mystic-gold hover:text-black transition-all">
                        네트워크 연결하기
                    </button>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
                        <Share2 className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            </div>
        </div>
    );
};
