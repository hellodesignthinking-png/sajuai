/**
 * AetherScript.tsx - V52
 * 인터랙티브 텍스트 컴포넌트: 특정 키워드에 마우스를 올리면 숨겨진 하이브리드 인사이트 노출
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Info } from 'lucide-react';

interface AetherScriptProps {
    keyword: string;
    insight: string;
    mbtiMatch?: string;
}

export const AetherScript: React.FC<AetherScriptProps> = ({ keyword, insight, mbtiMatch }) => {
    const [show, setShow] = useState(false);

    return (
        <span
            className="relative inline-block cursor-help group"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={() => setShow(!show)} // 모바일 대응
        >
            <span className="text-mystic-gold border-b border-mystic-gold/30 hover:border-mystic-gold transition-all duration-300 font-bold">
                {keyword}
            </span>
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 z-[100] glass-panel"
                        style={{
                            background: 'rgba(5,5,15,0.95)',
                            borderColor: 'rgba(212,175,55,0.4)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3 h-3 text-mystic-gold" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-mystic-gold">Secret Resonance</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {insight}
                        </p>
                        {mbtiMatch && (
                            <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                                <div className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[8px] font-bold">{mbtiMatch}</div>
                                <span className="text-[8px] text-slate-500">성향 시너지 감지</span>
                            </div>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0c0c1e]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};
