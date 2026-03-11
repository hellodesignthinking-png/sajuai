/**
 * CosmicHero.tsx — V47
 * 사이트의 첫인상을 결정하는 시네마틱 히어로 섹션
 * 
 * ✦ 3D Milky Way Particle System (react-three-fiber)
 * ✦ Gold Leaf Title Animation
 * ✦ Aether Trail Interaction
 */

import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

// ── 에테르 트레일 파티클 ──
const AetherParticles = () => {
    const count = 2000;
    const meshRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y += 0.0005;
        meshRef.current.rotation.x += 0.0002;

        // 마우스 상호작용 (에테르 트레일)
        const { x, y } = state.mouse;
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, x * 2, 0.05);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, y * 2, 0.05);
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#D4AF37"
                size={0.05}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
};

// ── 메인 히어로 컴포넌트 ───────────────────────────────────────────────────

interface CosmicHeroProps {
    onStart: (mode: 'personal' | 'synergy' | 'business') => void;
}

const CosmicHero: React.FC<CosmicHeroProps> = ({ onStart }) => {
    return (
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020205]">
            {/* Three.js Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 20] }}>
                    <AetherParticles />
                    <fog attach="fog" args={['#020205', 10, 50]} />
                </Canvas>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center px-6 max-w-5xl space-y-12">
                {/* 배지 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mystic-gold/10 border border-mystic-gold/20 backdrop-blur-xl"
                >
                    <Sparkles className="w-3 h-3 text-mystic-gold animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.4em] text-mystic-gold uppercase">V47 · The Grand Oracle Origin</span>
                </motion.div>

                {/* 타이틀 */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-9xl font-serif font-black tracking-tight leading-none"
                    >
                        <span className="block italic text-white/90">Your Destiny,</span>
                        <span className="block mt-2" style={{
                            background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.3))'
                        }}>
                            Decoded by AI
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-sm md:text-lg text-white/40 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
                    >
                        2026년 오행 공학 시스템이 당신의 사주, 관상, 손금속에 숨겨진<br className="hidden md:block" />
                        천상의 코드를 해독하여 가장 고귀한 아키타입으로 현신시킵니다.
                    </motion.p>
                </div>

                {/* CTA 버튼 그룹 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6"
                >
                    <button
                        onClick={() => onStart('personal')}
                        className="group relative px-10 py-5 bg-mystic-gold rounded-2xl text-black font-black text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(212,175,55,0.4)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            성소 입장하기 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl" />
                    </button>

                    <button
                        onClick={() => onStart('synergy')}
                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 font-black text-xs tracking-widest uppercase hover:bg-white/10 hover:text-white transition-all backdrop-blur-xl"
                    >
                        인연 동기화 (2인)
                    </button>
                </motion.div>

                {/* 트러스트 인디케이터 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="pt-12 flex items-center justify-center gap-8 border-t border-white/5"
                >
                    <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                        <Zap className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Gemini 2.0 Flash Engine</span>
                    </div>
                </motion.div>
            </div>

            {/* 배경 장식 (라이트 빔) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-mystic-gold/40 via-transparent to-transparent opacity-20" />
        </div>
    );
};

export default CosmicHero;
