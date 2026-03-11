/**
 * AetherTrail.tsx — V47 Micro-Interaction
 * 마우스 커서를 따라다니는 에테르 글로우 & 파티클 트레일
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AetherTrail: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* 메인 에테르 글로우 */}
            <motion.div
                animate={{
                    x: mousePos.x - 150,
                    y: mousePos.y - 150,
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
                className="w-[300px] h-[300px] rounded-full bg-mystic-gold/10 blur-[100px] opacity-40"
            />

            {/* 커서 포인트 (Spark) */}
            <motion.div
                animate={{
                    x: mousePos.x - 4,
                    y: mousePos.y - 4,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 400, mass: 0.1 }}
                className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_2px_#D4AF37] opacity-80"
            />

            {/* 뒤따라오는 에테르 파편들 (Traces) */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        x: mousePos.x - 2,
                        y: mousePos.y - 2,
                    }}
                    transition={{
                        type: 'spring',
                        damping: 25 + i * 5,
                        stiffness: 150 - i * 20,
                        mass: 0.5 + i * 0.2
                    }}
                    className="absolute w-1 h-1 rounded-full bg-mystic-gold opacity-20"
                    style={{ filter: 'blur(1px)' }}
                />
            ))}
        </div>
    );
};

export default AetherTrail;
