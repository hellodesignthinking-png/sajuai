/**
 * DestinyFlex.tsx — V45
 * 데스티니 플렉스: 프리뷰 + 내보내기 컨트롤 패널
 *
 * ✦ 프레임 선택 (다크우드 / 샴페인 골드)
 * ✦ 미리보기 → 고화질 PNG 다운로드
 * ✦ 클립보드 복사 + Web Share (모바일)
 * ✦ 고유 시리얼 번호 자동 발급
 * ✦ 다운로드 진행 상태 피드백
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Copy, Check, Image, FrameIcon, Sparkles } from 'lucide-react';

import DestinyCanvas, { type DestinyCanvasData } from './DestinyCanvas';
import { exportDestinyCanvas, shareDestiny, copyToClipboard, generateSerial } from '../utils/CanvasExporter';

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

interface DestinyFlexProps {
    starId?: string;
    mbti?: string;
    dominantElement?: string;
    personaTitle?: string;
    personaSubtitle?: string;
    synergyScore?: number;
    facialSyncRate?: number;
    oracleSummary?: string;
    syncRates?: Record<string, number>;
    userName?: string;
    serial?: string;
    onExport?: () => void;
}

const DestinyFlex: React.FC<DestinyFlexProps> = (props) => {
    const [frameStyle, setFrameStyle] = useState<'darkwood' | 'champagne'>('champagne');
    const [isExporting, setIsExporting] = useState(false);
    const [exportStep, setExportStep] = useState('');
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [lastDataUrl, setLastDataUrl] = useState<string | null>(null);

    const serial = useMemo(() => props.serial || generateSerial(), [props.serial]);

    const canvasData: DestinyCanvasData = {
        ...props,
        serial,
        frameStyle,
    };

    const CANVAS_ID = `destiny-canvas-export-${serial}`;

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        setExportStep('🎨 마스터 오라클이 캔버스에 금박을 입히는 중...');

        const dataUrl = await exportDestinyCanvas(CANVAS_ID, {
            scale: 4,
            filename: `FateSync-Masterpiece-${serial}.png`,
            onProgress: (step) => setExportStep(step),
        });

        if (dataUrl) {
            setLastDataUrl(dataUrl);
            props.onExport?.(); // 크레딧 보상 트리거
        }
        setIsExporting(false);
        setExportStep('');
    }, [CANVAS_ID, serial, props.onExport]);

    const handleShare = useCallback(async () => {
        if (!lastDataUrl) {
            // 먼저 렌더링
            setIsExporting(true);
            setExportStep('📸 공유용 이미지 생성 중...');
            const dataUrl = await exportDestinyCanvas(CANVAS_ID, {
                scale: 3,
                onProgress: setExportStep,
            });
            setIsExporting(false);
            setExportStep('');
            if (!dataUrl) return;
            setLastDataUrl(dataUrl);
            const ok = await shareDestiny(dataUrl, serial);
            if (!ok) {
                // Web Share 불가 시 클립보드로 폴백
                await copyToClipboard(dataUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } else {
                setShared(true);
                setTimeout(() => setShared(false), 3000);
            }
            return;
        }
        const ok = await shareDestiny(lastDataUrl, serial);
        if (!ok) {
            await copyToClipboard(lastDataUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    }, [lastDataUrl, CANVAS_ID, serial]);

    return (
        <div className="w-full space-y-5">
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3))' }} />
                <div className="text-center">
                    <p className="text-[8px] font-black tracking-[0.5em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                        V45 · Destiny Flex
                    </p>
                    <h3 className="text-sm font-serif font-black" style={{ color: 'rgba(212,175,55,0.9)' }}>
                        데스티니 플렉스
                    </h3>
                    <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        SNS에 박제할 나의 황금빛 명반 마스터피스
                    </p>
                </div>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.3))' }} />
            </div>

            {/* 프레임 선택 */}
            <div className="flex gap-2">
                {(['champagne', 'darkwood'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFrameStyle(f)}
                        className="flex-1 py-2 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                        style={{
                            background: frameStyle === f ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${frameStyle === f ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`,
                            color: frameStyle === f ? 'rgba(212,175,55,0.9)' : 'rgba(255,255,255,0.3)',
                        }}
                    >
                        {f === 'champagne' ? '🥂 샴페인 골드' : '🪵 다크 우드'}
                    </button>
                ))}
            </div>

            {/* 미니 프리뷰 토글 */}
            <button
                onClick={() => setShowPreview(v => !v)}
                className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                style={{
                    background: showPreview ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${showPreview ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: showPreview ? 'rgba(212,175,55,0.8)' : 'rgba(255,255,255,0.4)',
                }}
            >
                <Image className="w-3.5 h-3.5" />
                {showPreview ? '미리보기 닫기' : '캔버스 미리보기'}
            </button>

            {/* 캔버스 프리뷰 (숨김/표시) */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex justify-center py-2 overflow-x-auto">
                            <div style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                                <DestinyCanvas data={canvasData} id={CANVAS_ID} />
                            </div>
                        </div>
                        {/* 숨겨진 실제 캡처 대상 (scale 1:1, off-screen) */}
                        <div style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}>
                            <DestinyCanvas data={canvasData} id={`${CANVAS_ID}-hidden`} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 숨겨진 고해상도 캡처 대상 */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}>
                <DestinyCanvas data={canvasData} id={CANVAS_ID} />
            </div>

            {/* 다운로드 진행 표시 */}
            <AnimatePresence>
                {isExporting && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2 p-3 rounded-xl"
                        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
                    >
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
                            style={{ borderColor: 'rgba(212,175,55,0.6)', borderTopColor: 'transparent' }} />
                        <span className="text-[9px] font-black" style={{ color: 'rgba(212,175,55,0.8)' }}>
                            {exportStep}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 시리얼 번호 */}
            <div className="flex items-center justify-between px-1">
                <div className="text-[7px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    고유 인장 번호: <span style={{ color: 'rgba(212,175,55,0.4)' }}>{serial}</span>
                </div>
                <div className="text-[7px] font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    Limited Edition
                </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-2">
                {/* 메인: 고화질 다운로드 */}
                <motion.button
                    onClick={handleExport}
                    disabled={isExporting}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all"
                    style={{
                        background: isExporting
                            ? 'rgba(212,175,55,0.08)'
                            : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.15))',
                        border: '1.5px solid rgba(212,175,55,0.5)',
                        color: isExporting ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.95)',
                        boxShadow: isExporting ? 'none' : '0 0 30px rgba(212,175,55,0.25)',
                    }}
                >
                    <Download className="w-4 h-4" />
                    {isExporting ? '렌더링 중...' : '고화질 PNG 다운로드 (4x)'}
                </motion.button>

                {/* 서브: 공유 / 클립보드 */}
                <div className="grid grid-cols-2 gap-2">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleShare}
                        disabled={isExporting}
                        className="py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                        style={{
                            background: shared ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${shared ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
                            color: shared ? '#34d399' : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        <Share2 className="w-3 h-3" />
                        {shared ? '공유 완료!' : '인스타 공유'}
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={async () => {
                            if (lastDataUrl) {
                                await copyToClipboard(lastDataUrl);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2500);
                            }
                        }}
                        disabled={!lastDataUrl}
                        className="py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                        style={{
                            background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${copied ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
                            color: copied ? '#34d399' : lastDataUrl ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                            cursor: lastDataUrl ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? '복사됨!' : '클립보드'}
                    </motion.button>
                </div>
            </div>

            {/* 안내 문구 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3" style={{ color: 'rgba(212,175,55,0.5)' }} />
                    <span className="text-[7px] font-black tracking-[0.3em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                        인쇄 시에도 깨지지 않는 300DPI급 고해상도
                    </span>
                </div>
                <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    다운로드한 이미지를 인스타그램 스토리·피드에 공유하면<br />
                    자동으로 4:5 황금비율로 최적 표시됩니다.
                </p>
            </motion.div>
        </div>
    );
};

export default DestinyFlex;
