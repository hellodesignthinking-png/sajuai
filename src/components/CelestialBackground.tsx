import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, MeshDistortMaterial, Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface CelestialBackgroundProps {
    element?: string;
    facialStats?: { eyes: number; chin: number };
}

const ElementParticles = ({ element, speed = 1 }: { element?: string; speed?: number }) => {
    const points = useMemo(() => {
        const p = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000; i++) {
            p[i * 3] = (Math.random() - 0.5) * 50;
            p[i * 3 + 1] = (Math.random() - 0.5) * 50;
            p[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return p;
    }, []);

    const color = useMemo(() => {
        switch (element?.toLowerCase()) {
            case 'wood': case '목': return '#10b981';
            case 'fire': case '화': return '#f43f5e';
            case 'earth': case '토': return '#f59e0b';
            case 'metal': case '금': return '#f8fafc';
            case 'water': case '수': return '#3b82f6';
            default: return '#fbbf24';
        }
    }, [element]);

    const pRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (pRef.current) {
            pRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 * speed;
            pRef.current.rotation.x = state.clock.getElapsedTime() * 0.02 * speed;
        }
    });

    return (
        <Points ref={pRef} positions={points} stride={3}>
            <PointMaterial
                transparent
                color={color}
                size={0.15}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
};

const CelestialOverlay = ({ element, speed = 1, distort = 0.3 }: { element?: string; speed?: number; distort?: number }) => {
    const colors = {
        'wood': '#064e3b', '목': '#064e3b',
        'fire': '#450a0a', '화': '#450a0a',
        'earth': '#451a03', '토': '#451a03',
        'metal': '#1e293b', '금': '#1e293b',
        'water': '#0c4a6e', '수': '#0c4a6e',
        'default': '#0f172a'
    };
    const activeColor = colors[element?.toLowerCase() as keyof typeof colors] || colors.default;

    return (
        <Float speed={speed / 2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere args={[1, 100, 100]} scale={2.5} position={[0, 0, -10]}>
                <MeshDistortMaterial
                    color={activeColor}
                    speed={speed}
                    distort={distort}
                    radius={1}
                    opacity={0.12}
                    transparent
                />
            </Sphere>
        </Float>
    );
};

export const CelestialBackground: React.FC<CelestialBackgroundProps> = ({ element, facialStats }) => {
    // Hyper-Synchronicity Logic: Derived from User Instructions
    // Eyes sharpness maps to Speed, Chin strength maps to Distortion
    const stats = useMemo(() => facialStats || { eyes: 0.5, chin: 0.5 }, [facialStats]);

    const dynamicSpeed = useMemo(() => 1 + (stats.eyes * 4), [stats.eyes]);
    const dynamicDistort = useMemo(() => 0.2 + (stats.chin * 0.6), [stats.chin]);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40">
            <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={dynamicSpeed / 4} />

                    <ElementParticles element={element} speed={dynamicSpeed / 2} />

                    <CelestialOverlay element={element} speed={dynamicSpeed} distort={dynamicDistort} />

                    <Sparkles count={50} scale={20} size={2} speed={0.5} color="#D4AF37" />
                </Suspense>
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060612]/60 to-[#060612]" />
        </div>
    );
};

export default CelestialBackground;
