import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// ─── Timeline data ────────────────────────────────────────────────
const SEQUENCE = [
    {
        id: 0,
        duration: 3000,
        label: '태어난 순간의 우주 기운 동기화 중...',
        sublabel: 'SYNCHRONIZING CELESTIAL ENERGIES',
        progress: 20,
        accentColor: '#D4AF37',
    },
    {
        id: 1,
        duration: 4000,
        label: '안면 468개 지점 정밀 계측 중...',
        sublabel: 'SCANNING 468 FACIAL LANDMARKS',
        progress: 40,
        accentColor: '#22d3ee',
    },
    {
        id: 2,
        duration: 3000,
        label: '생애 에너지 및 궤적선 스캔 중...',
        sublabel: 'TRACING PALMISTRY LIFE PATHS',
        progress: 60,
        accentColor: '#a78bfa',
    },
    {
        id: 3,
        duration: 3000,
        label: '심리 원형 및 성격 구조 정렬 중...',
        sublabel: 'ALIGNING PSYCHOLOGICAL ARCHETYPE',
        progress: 80,
        accentColor: '#f472b6',
    },
    {
        id: 4,
        duration: 2000,
        label: '당신의 운명 비전을 생성하고 있습니다...',
        sublabel: 'MANIFESTING ORACLE THESIS',
        progress: 100,
        accentColor: '#D4AF37',
    },
];

// ─── 3D Visual: Step-reactive scene ──────────────────────────────

// Step 0: 5 element orbs converging
const ElementOrbs = ({ active }: { active: boolean }) => {
    const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#e2e8f0', '#3b82f6'];
    const refs = useRef<THREE.Mesh[]>([]);
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        refs.current.forEach((r, i) => {
            if (!r) return;
            const angle = (i / 5) * Math.PI * 2 + t * 0.4;
            const radius = active ? Math.max(0.3, 3.5 - t * 0.3) : 4;
            r.position.x = Math.cos(angle) * radius;
            r.position.y = Math.sin(angle) * radius * 0.6;
            r.position.z = Math.sin(angle * 0.5) * 1.5;
            (r.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(t * 2 + i) * 0.3;
        });
    });
    return (
        <>
            {COLORS.map((color, i) => (
                <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }}>
                    <sphereGeometry args={[0.35, 16, 16]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.85} />
                </mesh>
            ))}
        </>
    );
};

// Step 1: Face landmark dots appearing
const FaceLandmarks = () => {
    const points = useMemo(() => {
        const pts: [number, number, number][] = [];
        for (let i = 0; i < 120; i++) {
            const angle = (i / 120) * Math.PI * 2;
            const radiusX = 1.8;
            const radiusY = 2.2;
            const nx = Math.cos(angle) * radiusX * (0.8 + Math.random() * 0.3);
            const ny = Math.sin(angle) * radiusY * (0.8 + Math.random() * 0.2) - 0.2;
            const nz = (Math.random() - 0.5) * 0.5;
            pts.push([nx, ny, nz]);
        }
        return pts;
    }, []);
    return (
        <>
            {points.map((pos, i) => (
                <group key={i}>
                    <mesh position={pos as [number, number, number]}>
                        <sphereGeometry args={[0.025, 6, 6]} />
                        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} transparent opacity={0.9} />
                    </mesh>
                </group>
            ))}
        </>
    );
};

// Step 2: Palm lines (neon traces)
const PalmLines = () => {
    const group = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
        }
    });
    const makeLinePts = (pts: [number, number, number][]) =>
        new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));

    return (
        <group ref={group}>
            {[
                [[- 0.8, -1.5, 0], [0.2, 0, 0.3], [0.6, 1.5, 0]] as [number, number, number][],
                [[-0.3, -1.5, 0], [0.5, 0, 0.2], [0.9, 1.5, 0]] as [number, number, number][],
                [[-1.2, -0.5, 0], [0, 0.2, 0.2], [1.3, -0.3, 0]] as [number, number, number][],
            ].map((pts, li) => (
                <line key={li}>
                    <bufferGeometry {...makeLinePts(pts)} />
                    <lineBasicMaterial color="#a78bfa" linewidth={2} />
                </line>
            ))}
        </group>
    );
};

// Step 3: Spinning MBTI dial letters
const MBTIDial = () => {
    const letters = ['I', 'N', 'F', 'J'];
    const group = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (group.current) {
            group.current.rotation.y += 0.04;
        }
    });
    return (
        <group ref={group}>
            {letters.map((_, i) => (
                <Sphere key={i} args={[0.15, 12, 12]} position={[Math.cos((i / 4) * Math.PI * 2) * 2, Math.sin((i / 4) * Math.PI * 2) * 1, 0]}>
                    <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.8} />
                </Sphere>
            ))}
        </group>
    );
};

// Step 4: Tarot card manifest — glowing rotating plane
const TarotManifest = () => {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (mesh.current) {
            mesh.current.rotation.y = clock.getElapsedTime() * 0.6;
            const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
            mesh.current.scale.setScalar(s);
        }
    });
    return (
        <Float speed={2} floatIntensity={0.5} rotationIntensity={0.3}>
            <mesh ref={mesh}>
                <boxGeometry args={[2.4, 4, 0.05]} />
                <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} transparent opacity={0.4} />
            </mesh>
        </Float>
    );
};

const VisualStep = ({ step }: { step: number }) => (
    <>
        {step === 0 && <ElementOrbs active={true} />}
        {step === 1 && <FaceLandmarks />}
        {step === 2 && <PalmLines />}
        {step === 3 && <MBTIDial />}
        {step === 4 && <TarotManifest />}
    </>
);

// ─── MBTI dial HTML overlay ───────────────────────────────────────
const MBTIDialOverlay = ({ active }: { active: boolean }) => {
    const [settled, setSettled] = useState(false);
    const CHOICES = [
        ['I', 'E'], ['N', 'S'], ['F', 'T'], ['J', 'P'],
    ];
    const [indices, setIndices] = useState([0, 0, 0, 0]);

    useEffect(() => {
        if (!active) return;
        const interval = setInterval(() => {
            setIndices(prev => prev.map((v, i) => (Math.random() > 0.5 ? 1 - v : v)));
        }, 120);
        const timeout = setTimeout(() => {
            clearInterval(interval);
            setIndices([0, 0, 0, 0]);
            setSettled(true);
        }, 2400);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [active]);

    return (
        <div className="flex gap-6 mt-6">
            {CHOICES.map((pair, i) => (
                <motion.div
                    key={i}
                    animate={{ rotateX: settled ? 0 : [0, 360] }}
                    transition={{ duration: 0.1, repeat: settled ? 0 : Infinity }}
                    className="w-16 h-20 rounded-xl border-2 border-[#f472b6]/40 bg-[#f472b6]/10 flex items-center justify-center"
                >
                    <span className="text-4xl font-black text-[#f472b6]">{pair[indices[i]]}</span>
                </motion.div>
            ))}
        </div>
    );
};

// ─── Face scan SVG overlay ────────────────────────────────────────
const FaceScanSVG = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        <motion.path
            d="M30,20 Q50,10 70,20 Q85,50 70,80 Q50,95 30,80 Q15,50 30,20"
            stroke="#22d3ee" strokeWidth="0.6" fill="none" strokeDasharray="3,2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {[
            [35, 38], [65, 38], [50, 52], [42, 65], [58, 65], [50, 30],
        ].map(([cx, cy], i) => (
            <motion.circle key={i} cx={cx} cy={cy} r="1.2" fill="#22d3ee"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.5], scale: 1 }}
                transition={{ delay: i * 0.25, duration: 0.4 }}
            />
        ))}
        {/* Scan line */}
        <motion.line x1="15" x2="85"
            animate={{ y1: [10, 90, 10], y2: [10, 90, 10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.5"
        />
    </svg>
);

// ─── Palm line SVG overlay ────────────────────────────────────────
const PalmScanSVG = () => (
    <svg className="w-48 h-48" viewBox="0 0 100 100">
        <motion.path d="M50,90 C40,70 30,50 35,20" stroke="#a78bfa" strokeWidth="1.5" fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
        <motion.path d="M60,88 C55,65 60,40 65,15" stroke="#a78bfa" strokeWidth="1.5" fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }} />
        <motion.path d="M20,55 C40,50 65,48 85,40" stroke="#a78bfa" strokeWidth="1.5" fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.6, ease: 'easeInOut' }} />
        {/* Neon glow dot */}
        <motion.circle cx="50" cy="50" r="3" fill="none" stroke="#a78bfa" strokeWidth="0.8"
            animate={{ r: [2, 5, 2], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
    </svg>
);

// ─── Main component ───────────────────────────────────────────────
interface CinematicLoadingProps {
    isAnalysisComplete: boolean;
    onMinimumDurationElapsed: () => void;
}

const CinematicLoading: React.FC<CinematicLoadingProps> = ({ isAnalysisComplete, onMinimumDurationElapsed }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const MIN_DURATION = 12000; // 최소 12초 노출

    // Step ticker
    useEffect(() => {
        let step = 0;
        let accum = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];

        SEQUENCE.forEach((s, i) => {
            const delay = accum;
            timers.push(setTimeout(() => setCurrentStep(i), delay));
            accum += s.duration;
        });
        return () => timers.forEach(clearTimeout);
    }, []);

    // Track total elapsed time
    useEffect(() => {
        const interval = setInterval(() => setElapsed(prev => prev + 200), 200);
        return () => clearInterval(interval);
    }, []);

    // When analysis done AND min duration passed
    useEffect(() => {
        if (isAnalysisComplete && elapsed >= MIN_DURATION) {
            onMinimumDurationElapsed();
        }
    }, [isAnalysisComplete, elapsed, onMinimumDurationElapsed, MIN_DURATION]);

    const seq = SEQUENCE[currentStep];
    const smoothProgress = Math.min(100, (elapsed / MIN_DURATION) * 100);

    return (
        <div className="fixed inset-0 z-[200] bg-[#050510] flex flex-col items-center justify-center overflow-hidden">
            {/* ── 3D Background ── */}
            <div className="absolute inset-0 opacity-35 pointer-events-none">
                <Suspense fallback={null}>
                    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                        <ambientLight intensity={0.4} />
                        <pointLight position={[0, 0, 5]} intensity={2} color={seq.accentColor} />
                        <Stars radius={80} depth={40} count={3000} factor={3} saturation={0} fade speed={2} />
                        <VisualStep step={currentStep} />
                    </Canvas>
                </Suspense>
            </div>

            {/* ── Radial vignette ── */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, transparent 35%, #050510 100%)' }} />

            {/* ── Central content ── */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-xl w-full">

                {/* Logo / Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="text-[10px] font-black tracking-[0.5em] text-[#D4AF37]/50 uppercase">Fate · Sync</div>
                    <div className="text-[10px] text-slate-600 tracking-widest uppercase">Destiny Engine v3.5</div>
                </motion.div>

                {/* Step visual overlay */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {currentStep === 0 && (
                            <motion.div key="step0"
                                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="w-32 h-32 relative"
                            >
                                {['#10b981', '#ef4444', '#f59e0b', '#e2e8f0', '#3b82f6'].map((c, i) => (
                                    <motion.div key={i}
                                        className="absolute w-6 h-6 rounded-full"
                                        style={{ background: c, top: '50%', left: '50%', boxShadow: `0 0 16px ${c}` }}
                                        animate={{
                                            x: Math.cos((i / 5) * Math.PI * 2) * 52 - 12,
                                            y: Math.sin((i / 5) * Math.PI * 2) * 36 - 12,
                                        }}
                                        transition={{ duration: 1.5, ease: 'easeOut', delay: i * 0.1 }}
                                    />
                                ))}
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 m-6"
                                    animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                />
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div key="step1"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="relative w-48 h-48"
                            >
                                <FaceScanSVG />
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div key="step2"
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            >
                                <PalmScanSVG />
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div key="step3"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <MBTIDialOverlay active={true} />
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div key="step4"
                                initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 80, damping: 10 }}
                                className="w-28 h-44 rounded-2xl border-2 flex items-center justify-center"
                                style={{ borderColor: '#D4AF37', boxShadow: '0 0 60px rgba(212,175,55,0.5)', background: 'rgba(212,175,55,0.05)' }}
                            >
                                <span className="text-5xl">✦</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Step text */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentStep}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-3"
                    >
                        <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
                            {seq.label}
                        </h2>
                        <p className="text-[10px] font-black tracking-[0.35em] uppercase"
                            style={{ color: seq.accentColor + 'aa' }}>
                            {seq.sublabel}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress bar */}
                <div className="w-full h-px bg-white/5 rounded-full overflow-hidden mt-2">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(to right, ${seq.accentColor}88, ${seq.accentColor})`, boxShadow: `0 0 12px ${seq.accentColor}88` }}
                        animate={{ width: `${smoothProgress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Percentage */}
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: seq.accentColor }} />
                    <span className="text-[11px] font-black tracking-widest" style={{ color: seq.accentColor + '99' }}>
                        PROCESSING {Math.round(smoothProgress)}%
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: seq.accentColor }} />
                </div>

                {/* Spinning ring */}
                <motion.div
                    className="w-12 h-12 rounded-full border-t-2 border-r-2"
                    style={{ borderColor: seq.accentColor + '60' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
            </div>
        </div>
    );
};

export default CinematicLoading;
