/**
 * SmartCameraGuide.tsx
 * V36-Camera: 스마트 오라클 가이드 카메라 컴포넌트
 *
 * 모드별 SVG 가이드 오버레이 + 정렬 진행률 + 자동 캡처 시뮬레이션
 * 실제 MediaPipe 통합 시 isAligned 로직을 랜드마크 체크로 교체
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Zap, CheckCircle2, X, Fingerprint } from 'lucide-react';

// ── 관상 / 손금 수치 시뮬레이터 (학술적 연출) ──────────────────────────────

interface StatTicker {
    label: string;
    value: number;
    unit: string;
    delta: number; // 틱마다 변동폭
}

const FACE_STATS: StatTicker[] = [
    { label: 'SYM', value: 82.4, unit: '%', delta: 1.2 },
    { label: 'RATIO', value: 1.618, unit: 'φ', delta: 0.02 },
    { label: 'EYE-L', value: 126.4, unit: 'mm', delta: 0.8 },
    { label: 'EYE-R', value: 125.8, unit: 'mm', delta: 0.7 },
    { label: 'JAW', value: 98.2, unit: '°', delta: 0.5 },
    { label: 'FOREHEAD', value: 0.34, unit: 'r', delta: 0.005 },
];

const PALM_STATS: StatTicker[] = [
    { label: 'LIFE', value: 74.2, unit: 'mm', delta: 1.1 },
    { label: 'HEAD', value: 88.3, unit: 'mm', delta: 0.8 },
    { label: 'HEART', value: 83.7, unit: 'mm', delta: 0.9 },
    { label: 'FATE', value: 61.2, unit: 'mm', delta: 1.4 },
    { label: 'CURV', value: 0.72, unit: 'k', delta: 0.02 },
    { label: 'DEPTH', value: 3.8, unit: 'val', delta: 0.15 },
];

// ── 스캔 라인 컴포넌트 ────────────────────────────────────────────────────────

const ScanLine = ({ active }: { active: boolean }) => (
    <motion.div
        className="absolute left-0 right-0 h-[2px] pointer-events-none"
        style={{
            background: active
                ? 'linear-gradient(90deg, transparent 0%, #D4AF37 30%, #fff8dc 50%, #D4AF37 70%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            boxShadow: active ? '0 0 12px rgba(212,175,55,0.8)' : 'none',
        }}
        animate={{ top: ['10%', '90%', '10%'] }}
        transition={{ duration: active ? 2.5 : 5, repeat: Infinity, ease: 'linear' }}
    />
);

// ── 코너 마커 ────────────────────────────────────────────────────────────────

const CornerMarkers = ({ active }: { active: boolean }) => {
    const color = active ? '#D4AF37' : 'rgba(255,255,255,0.2)';
    const size = 24;
    const CORNER_DEFS = [
        { top: '8%', left: '6%', transform: 'rotate(0deg)' },
        { top: '8%', right: '6%', transform: 'rotate(90deg)' },
        { bottom: '8%', right: '6%', transform: 'rotate(180deg)' },
        { bottom: '8%', left: '6%', transform: 'rotate(270deg)' },
    ];

    return (
        <>
            {CORNER_DEFS.map((pos, i) => (
                <div
                    key={i}
                    className="absolute w-6 h-6 pointer-events-none"
                    style={{ ...pos, transition: 'all 0.4s ease' }}
                >
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <polyline points="0,16 0,0 16,0" fill="none" stroke={color} strokeWidth="2.5" />
                    </svg>
                </div>
            ))}
        </>
    );
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

interface SmartCameraGuideProps {
    mode: 'face' | 'palm';
    activeMode?: 'personal' | 'synergy' | 'business';
    onCapture: (dataUrl: string) => void;
    onClose?: () => void;
}

const SmartCameraGuide: React.FC<SmartCameraGuideProps> = ({ mode, activeMode, onCapture, onClose }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const [isAligned, setIsAligned] = useState(false);
    const [progress, setProgress] = useState(0);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [captured, setCaptured] = useState(false);
    const [stats, setStats] = useState(mode === 'face' ? FACE_STATS : PALM_STATS);
    const [showTip, setShowTip] = useState(true);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const progressRef = useRef(0);

    // ── 카메라 스트림 시작 ───────────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        const facingMode = mode === 'face' ? 'user' : 'environment';

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
            .then((stream) => {
                if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => { });
                }
            })
            .catch((err) => {
                if (!mounted) return;
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setCameraError('카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    setCameraError('카메라를 찾을 수 없습니다. 갤러리에서 사진을 업로드해주세요.');
                } else {
                    setCameraError('카메라를 시작할 수 없습니다. 갤러리에서 사진을 업로드해주세요.');
                }
            });

        return () => {
            mounted = false;
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [mode]);

    // ── 정렬 시뮬레이션 + 진행률 ─────────────────────────────────────────────────
    // 실제 구현: MediaPipe 랜드마크가 가이드 영역 내에 있는지 체크
    useEffect(() => {
        if (captured) return;

        const alignInterval = setInterval(() => {
            // 실제 구현 시 이 부분을 MediaPipe 결과로 교체
            const randomAligned = Math.random() > 0.25;
            setIsAligned(randomAligned);

            if (randomAligned) {
                progressRef.current = Math.min(100, progressRef.current + 4);
            } else {
                progressRef.current = Math.max(0, progressRef.current - 8);
            }
            setProgress(progressRef.current);
        }, 120);

        return () => clearInterval(alignInterval);
    }, [captured]);

    // ── 수치 틱커 업데이트 ────────────────────────────────────────────────────────
    useEffect(() => {
        if (captured) return;
        const ticker = setInterval(() => {
            setStats(prev =>
                prev.map(s => ({
                    ...s,
                    value: parseFloat(
                        (s.value + (Math.random() - 0.5) * s.delta).toFixed(
                            s.unit === 'φ' || s.unit === 'k' || s.unit === 'r' ? 3 : 1
                        )
                    ),
                }))
            );
        }, 180);
        return () => clearInterval(ticker);
    }, [captured]);

    // ── 100% 달성 → 카운트다운 → 캡처 ──────────────────────────────────────────
    useEffect(() => {
        if (progress >= 100 && !captured && countdown === null) {
            setCountdown(3);
        }
    }, [progress, captured, countdown]);

    useEffect(() => {
        if (countdown === null || captured) return;
        if (countdown === 0) {
            handleCapture();
            return;
        }
        // 햅틱 피드백 (지원 기기)
        if ('vibrate' in navigator) navigator.vibrate(80);

        const t = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
        return () => clearTimeout(t);
    }, [countdown, captured]);

    // ── 실제 캡처 ────────────────────────────────────────────────────────────────
    const handleCapture = useCallback(() => {
        if (captured) return;

        if (videoRef.current && canvasRef.current && streamRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                if (mode === 'face') ctx.scale(-1, 1), ctx.translate(-canvas.width, 0);
                ctx.drawImage(video, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                setCaptured(true);
                streamRef.current?.getTracks().forEach(t => t.stop());
                if ('vibrate' in navigator) navigator.vibrate([100, 50, 200]);
                onCapture(dataUrl);
                return;
            }
        }

        // 카메라 없는 경우 — 파일 선택으로 fallback
        fileInputRef.current?.click();
    }, [captured, mode, onCapture]);

    // ── 팁 숨기기 ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setShowTip(false), 3500);
        return () => clearTimeout(t);
    }, []);

    const isGold = isAligned && progress > 20;
    const goldColor = '#D4AF37';
    const dimColor = 'rgba(255,255,255,0.18)';

    return (
        <div className="relative w-full flex flex-col items-center gap-4">
            {/* ── 메인 카메라 박스 ── */}
            <div
                className="relative w-full overflow-hidden rounded-[2.5rem]"
                style={{
                    height: isMobile ? 'calc(100dvh - 220px)' : '580px',
                    aspectRatio: isMobile ? 'auto' : '3/4',
                    background: '#050508',
                    border: `2px solid ${isGold ? goldColor : dimColor}`,
                    boxShadow: isGold ? `0 0 40px rgba(212,175,55,0.25), 0 0 120px rgba(212,175,55,0.08)` : 'none',
                    transition: 'border-color 0.4s, box-shadow 0.4s',
                }}
            >
                {/* 카메라 피드 */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    style={{ transform: mode === 'face' ? 'scaleX(-1)' : 'none' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* 카메라 없을 때 배경 */}
                <div className="absolute inset-0 bg-[#050508] flex items-center justify-center z-0">
                    {mode === 'face'
                        ? <Camera className="w-14 h-14 opacity-10" />
                        : <Fingerprint className="w-14 h-14 opacity-10" />}
                </div>

                {/* 카메라 에러 메시지 */}
                {cameraError && (
                    <div className="absolute inset-0 z-[25] flex flex-col items-center justify-center gap-4 px-6 text-center"
                        style={{ background: 'rgba(5,5,8,0.9)' }}>
                        <Camera className="w-10 h-10 opacity-40" />
                        <p className="text-sm text-slate-300 leading-relaxed">{cameraError}</p>
                    </div>
                )}

                {/* ── SVG 가이드 오버레이 ── */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20"
                    viewBox="0 0 300 400"
                    preserveAspectRatio="none"
                    style={{ opacity: isGold ? 0.3 : 1, transition: 'opacity 0.5s' }}
                >
                    {mode === 'face' ? (
                        <>
                            {activeMode === 'synergy' ? (
                                <>
                                    {/* Synergy mode: Dual face guides */}
                                    {[100, 200].map((cx, i) => (
                                        <motion.ellipse
                                            key={i}
                                            cx={cx} cy="170" rx="65" ry="85"
                                            fill="none"
                                            stroke={isGold ? goldColor : dimColor}
                                            strokeWidth="2"
                                            strokeDasharray="12 6"
                                            animate={{ strokeDashoffset: [0, -90] }}
                                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                            style={{ filter: isGold ? `drop-shadow(0 0 8px ${goldColor})` : 'none', transition: 'stroke 0.4s' }}
                                        />
                                    ))}
                                    <text x="150" y="70" textAnchor="middle" className="text-[10px] font-black" fill={goldColor} style={{ opacity: 0.6 }}>[ SYNERGY MODE: 2 PERSONS ]</text>
                                </>
                            ) : (
                                <>
                                    {/* Personal mode: Single face guide */}
                                    <motion.ellipse
                                        cx="150" cy="170" rx="90" ry="115"
                                        fill="none"
                                        stroke={isGold ? goldColor : dimColor}
                                        strokeWidth="2"
                                        strokeDasharray="12 6"
                                        animate={{ strokeDashoffset: [0, -90] }}
                                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                        style={{ filter: isGold ? `drop-shadow(0 0 8px ${goldColor})` : 'none', transition: 'stroke 0.4s' }}
                                    />
                                </>
                            )}
                            {/* 눈 수평선 */}
                            <motion.line x1="60" y1="158" x2="240" y2="158" stroke={isGold ? `${goldColor}60` : `${dimColor}40`}
                                strokeWidth="1" strokeDasharray="4 8"
                                animate={{ strokeDashoffset: [0, -48] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
                            {/* 코 수직선 */}
                            <motion.line x1="150" y1="90" x2="150" y2="280" stroke={isGold ? `${goldColor}40` : `${dimColor}30`}
                                strokeWidth="1" strokeDasharray="3 9"
                                animate={{ strokeDashoffset: [0, -36] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
                            {/* 교점 점 */}
                            {isGold && (
                                <>
                                    {[{ cx: 110, cy: 158 }, { cx: 190, cy: 158 }, { cx: 150, cy: 200 }, { cx: 150, cy: 155 }].map((p, i) => (
                                        <motion.circle key={i} cx={p.cx} cy={p.cy} r="3" fill={goldColor}
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />
                                    ))}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {/* 손바닥 윤곽 가이드 */}
                            <motion.rect x="55" y="50" width="190" height="300" rx="40" ry="40"
                                fill="none"
                                stroke={isGold ? goldColor : dimColor}
                                strokeWidth="2" strokeDasharray="10 6"
                                animate={{ strokeDashoffset: [0, -80] }}
                                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                style={{ filter: isGold ? `drop-shadow(0 0 8px ${goldColor})` : 'none', transition: 'stroke 0.4s' }}
                            />
                            {/* 생명선 (Life Line) */}
                            <motion.path d="M 100 310 Q 80 220 130 160 Q 160 110 175 80"
                                fill="none" stroke={isGold ? '#22d3ee90' : `${dimColor}50`} strokeWidth="1.5" strokeDasharray="6 5"
                                animate={{ strokeDashoffset: [0, -66] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
                            {/* 두뇌선 (Head Line) */}
                            <motion.path d="M 100 200 Q 140 195 180 200 Q 210 205 230 190"
                                fill="none" stroke={isGold ? '#a78bfa90' : `${dimColor}50`} strokeWidth="1.5" strokeDasharray="6 5"
                                animate={{ strokeDashoffset: [0, -66] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: 0.5 }} />
                            {/* 감정선 (Heart Line) */}
                            <motion.path d="M 110 150 Q 160 120 200 140 Q 230 155 245 140"
                                fill="none" stroke={isGold ? '#f472b690' : `${dimColor}50`} strokeWidth="1.5" strokeDasharray="6 5"
                                animate={{ strokeDashoffset: [0, -66] }}
                                transition={{ duration: 7, repeat: Infinity, ease: 'linear', delay: 1 }} />
                            {/* 손금 레이블 */}
                            {isGold && (
                                <>
                                    {[
                                        { x: 58, y: 230, label: 'LIFE', color: '#22d3ee' },
                                        { x: 215, y: 212, label: 'HEAD', color: '#a78bfa' },
                                        { x: 205, y: 158, label: 'HEART', color: '#f472b6' },
                                    ].map((item, i) => (
                                        <motion.text key={i} x={item.x} y={item.y}
                                            fontSize="7" fontWeight="900" letterSpacing="1"
                                            fill={item.color} fontFamily="monospace"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}>
                                            {item.label}
                                        </motion.text>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </svg>

                {/* ── 스캔라인 ── */}
                <ScanLine active={isGold} />

                {/* ── 코너 마커 ── */}
                <CornerMarkers active={isGold} />

                {/* ── 실시간 수치 사이드바 ── */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            className="text-right"
                            animate={{ opacity: isGold ? 1 : 0.25 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <span className="text-[7px] font-black tracking-widest block"
                                style={{ color: isGold ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.2)' }}>
                                {s.label}
                            </span>
                            <span className="text-[9px] font-mono font-black"
                                style={{ color: isGold ? '#D4AF37' : 'rgba(255,255,255,0.2)' }}>
                                {s.value}{s.unit}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* ── PERFECT ALIGNMENT 토스트 ── */}
                <AnimatePresence>
                    {isGold && (
                        <motion.div
                            className="absolute top-5 left-1/2 -translate-x-1/2 z-20"
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[9px] tracking-[0.25em] uppercase text-black"
                                style={{ background: goldColor, boxShadow: `0 0 20px rgba(212,175,55,0.6)` }}>
                                <Zap size={10} fill="currentColor" /> PERFECT ALIGNMENT
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── 카운트다운 오버레이 ── */}
                <AnimatePresence>
                    {countdown !== null && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center z-30"
                            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        >
                            <motion.span
                                key={countdown}
                                className="font-serif font-black"
                                style={{
                                    fontSize: '120px', color: goldColor, lineHeight: 1,
                                    textShadow: `0 0 40px ${goldColor}, 0 0 80px rgba(212,175,55,0.4)`
                                }}
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {countdown === 0 ? '✦' : countdown}
                            </motion.span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── 초기 안내 툴팁 ── */}
                <AnimatePresence>
                    {showTip && !isGold && (
                        <motion.div
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-52 text-center"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        >
                            <div className="px-4 py-2 rounded-2xl text-[10px] leading-relaxed"
                                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                                {mode === 'face'
                                    ? '얼굴을 타원 가이드 안에 맞추세요\n정렬 완료 시 자동 촬영됩니다'
                                    : '손바닥을 화면 중앙에 펼쳐 놓으세요\n손금 감지 후 자동 촬영됩니다'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── 닫기 버튼 ── */}
                {onClose && (
                    <button onClick={onClose}
                        className="absolute top-4 right-4 z-30 p-2 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* ── 하단 진행률 바 ── */}
            <div className="w-full space-y-2 px-1">
                <div className="flex justify-between items-center">
                    <motion.p
                        className="text-[9px] font-black tracking-[0.3em] uppercase"
                        animate={{ color: isGold ? goldColor : 'rgba(255,255,255,0.25)' }}
                    >
                        {isGold ? `Synchronizing ${mode === 'face' ? 'Facial' : 'Palm'} Destiny...` : `Align your ${mode === 'face' ? 'face' : 'palm'} to guide`}
                    </motion.p>
                    <motion.span
                        className="text-base font-serif italic font-bold"
                        animate={{ color: isGold ? goldColor : 'rgba(255,255,255,0.2)' }}
                    >
                        {progress}%
                    </motion.span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, #b8860b, ${goldColor}, #fff8dc, ${goldColor})` }}
                        animate={{
                            width: `${progress}%`,
                            boxShadow: isGold ? `0 0 16px rgba(212,175,55,0.9)` : 'none',
                        }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                </div>
            </div>

            {/* ── 수동 촬영 + 갤러리 업로드 폴백 ── */}
            <div className="w-full flex gap-3">
                <label className="flex-1 cursor-pointer">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => onCapture(reader.result as string);
                            reader.readAsDataURL(file);
                        }}
                    />
                    <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold text-slate-300"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <RefreshCw className="w-4 h-4" />
                        갤러리 업로드
                    </div>
                </label>

                <motion.button
                    onClick={handleCapture}
                    whileTap={{ scale: 0.96 }}
                    className="flex-[2] py-3.5 rounded-2xl text-xs font-black text-black flex items-center justify-center gap-2"
                    style={{
                        background: isGold
                            ? `linear-gradient(135deg, #b8860b, ${goldColor}, #f5d87d)`
                            : 'rgba(255,255,255,0.08)',
                        color: isGold ? '#000' : 'rgba(255,255,255,0.3)',
                        border: `1px solid ${isGold ? goldColor : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isGold ? `0 0 20px rgba(212,175,55,0.4)` : 'none',
                        transition: 'all 0.3s',
                    }}
                >
                    <Camera className="w-4 h-4" />
                    {isGold ? '지금 즉시 촬영' : '수동 촬영'}
                </motion.button>
            </div>
        </div>
    );
};

export default SmartCameraGuide;
