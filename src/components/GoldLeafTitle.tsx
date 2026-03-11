/**
 * GoldLeafTitle.tsx — V47
 * 빛이 훑고 지나가는 듯한 금박(Gold Leaf) 텍스처 타이틀 애니메이션
 */

import React from 'react';
import { motion } from 'framer-motion';

interface GoldLeafTitleProps {
    children: React.ReactNode;
    className?: string;
}

const GoldLeafTitle: React.FC<GoldLeafTitleProps> = ({ children, className }) => {
    return (
        <h1 className={`relative font-serif font-black overflow-hidden ${className}`}>
            <span className="relative z-10" style={{
                background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                {children}
            </span>

            {/* 빛이 훑고 지나가는 이펙트 (Shine) */}
            <motion.div
                animate={{
                    x: ['-100%', '200%'],
                }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'linear',
                    repeatDelay: 2
                }}
                className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
            />
        </h1>
    );
};

export default GoldLeafTitle;
