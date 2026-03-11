/**
 * SanctuaryIntro.tsx — V47 The Origin
 * 사이트 진입 시 5초 동안 펼쳐지는 '빅뱅 오브 데스티니' 부팅 시퀀스
 * 
 * ✦ 암흑 속 싱귤래러티(Singularity) 폭발 애니메이션
 * ✦ Three.js 파티클 빅뱅 효과
 * ✦ 시네마틱 보이스 & 드론 앰비언스 (브라우저 정책 대기)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── 빅뱅 파티클 엔진 ──────────────────────────────────────────────────

const BigBangParticles = ({ isExploded }: { isExploded: boolean }) => {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions, setPositions] = useState<Float32Array>(() => {
        const pos = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 0.1;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }
        return pos;
    });

    const [velocities] = useState(() => {
        const vel = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = Math.random() * 5 + 2;
            vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
            vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
            vel[i * 3 + 2] = Math.cos(phi) * speed;
        }
        return vel;
    });

    useFrame((state, delta) => {
        if (!pointsRef.current || !isExploded) return;

        const posAttr = pointsRef.current.geometry.attributes.position;
        const pos = posAttr.array as Float32Array;

        for (let i = 0; i < 3000; i++) {
            pos[i * 3] += velocities[i * 3] * delta;
            pos[i * 3 + 1] += velocities[i * 3 + 1] * delta;
            pos[i * 3 + 2] += velocities[i * 3 + 2] * delta;

            // 약간의 감쇄
            velocities[i * 3] *= 0.985;
            velocities[i * 3 + 1] *= 0.985;
            velocities[i * 3 + 2] *= 0.985;
        }
        posAttr.needsUpdate = true;
        pointsRef.current.rotation.y += delta * 0.1;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={3000}
                    itemSize={3}
                    array={positions}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#D4AF37"
                size={0.08}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

interface SanctuaryIntroProps {
    onComplete: () => void;
}

const SanctuaryIntro: React.FC<SanctuaryIntroProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'singularity' | 'explosion' | 'logo' | 'complete'>('singularity');

    useEffect(() => {
        // 1초 후 폭발
        const t1 = setTimeout(() => setPhase('explosion'), 1000);
        // 3초 후 로고 등장
        const t2 = setTimeout(() => setPhase('logo'), 2500);
        // 5초 후 완료
        const t3 = setTimeout(() => onComplete(), 5500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden">
            {/* 3D 파티클 캔버스 */}
            <div className="absolute inset-0">
                <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                    <BigBangParticles isExploded={phase !== 'singularity'} />
                </Canvas>
            </div>

            {/* 싱큘래러티 (중앙 점) */}
            <AnimatePresence>
                {phase === 'singularity' && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                        exit={{ scale: 20, opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeIn' }}
                        className="w-2 h-2 bg-white rounded-full shadow-[0_0_50px_20px_rgba(212,175,55,0.8)] z-10"
                    />
                )}
            </AnimatePresence>

            {/* 섬광 (Explosion Whiteout) */}
            {phase === 'explosion' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5 }}
                    className="fixed inset-0 bg-white z-[20] pointer-events-none"
                />
            )}

            {/* 로고 & 칭호 */}
            <AnimatePresence>
                {phase === 'logo' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="z-30 text-center space-y-4"
                    >
                        <h1 className="text-5xl md:text-7xl font-serif font-black tracking-[0.3em] overflow-hidden">
                            <span className="block italic" style={{
                                background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                FATE-SYNC
                            </span>
                        </h1>
                        <p className="text-[10px] md:text-xs font-black tracking-[0.8em] text-mystic-gold/60 uppercase">
                            The Grand Oracle · Origin V47
                        </p>
                        <div className="w-24 h-px bg-gradient-to-r from-transparent via-mystic-gold/40 to-transparent mx-auto mt-6" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 하단 로딩 바 */}
            <div className="absolute bottom-12 w-48 h-[1px] bg-white/10 overflow-hidden">
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="w-full h-full bg-mystic-gold/40"
                />
            </div>
        </div>
    );
};

export default SanctuaryIntro;
