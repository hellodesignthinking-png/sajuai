/**
 * DestinyReceipt.tsx
 * V38: The Destiny Receipt (운명 영수증)
 *
 * - 감열지 영수증 스타일 (도트 매트릭스 폰트 · 흑백)
 * - 절취선, 고유 분석 번호, 오행 행운 아이템
 * - html2canvas 기반 이미지 다운로드
 * - "NO REFUNDS ON YOUR FATE" 위트 피날레
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Scissors } from 'lucide-react';
import { getLuckyData } from '../utils/luckyElements';

// ── 방향 매핑 (오행 → 행운 방위) ─────────────────────────────────────────

const DIRECTION_MAP: Record<string, string> = {
    '목': '동쪽 (EAST)', '木': '동쪽 (EAST)',
    '화': '남쪽 (SOUTH)', '火': '남쪽 (SOUTH)',
    '토': '중앙 (CENTER)', '土': '중앙 (CENTER)',
    '금': '서쪽 (WEST)', '金': '서쪽 (WEST)',
    '수': '북쪽 (NORTH)', '水': '북쪽 (NORTH)',
};

// ── 점선 구분자 ──────────────────────────────────────────────────────────

const Dashes = ({ char = '-', count = 32 }: { char?: string; count?: number }) => (
    <div className="text-center text-[10px] tracking-widest overflow-hidden whitespace-nowrap"
        style={{ letterSpacing: '0.05em' }}>
        {char.repeat(count)}
    </div>
);

// ── 절취선 장식 ──────────────────────────────────────────────────────────

const PerforationLine = ({ position }: { position: 'top' | 'bottom' }) => (
    <div className={`absolute ${position === 'top' ? '-top-3.5' : '-bottom-3.5'} left-0 right-0 flex items-center`}>
        <Scissors
            className={`absolute ${position === 'top' ? 'left-1' : 'right-1'} w-4 h-4 text-slate-500`}
            style={{ transform: position === 'bottom' ? 'scaleX(-1)' : undefined }}
        />
        <div className="w-full border-t-2 border-dashed border-slate-300" />
    </div>
);

// ── 영수증 본체 ──────────────────────────────────────────────────────────

interface ReceiptData {
    userName?: string;
    soulCard?: string;
    element?: string;
    synergyScore?: number;
    keywords?: string[];
    oracleMessage?: string;
}

const ReceiptBody = React.forwardRef<HTMLDivElement, ReceiptData>((props, ref) => {
    const {
        userName = '운명의 여행자',
        soulCard = 'THE ORACLE',
        element,
        synergyScore = 88,
        keywords = [],
        oracleMessage = '당신의 운명은 이미 쓰여졌습니다.',
    } = props;

    const lucky = getLuckyData(element);
    const direction = element ? (DIRECTION_MAP[element] || '중앙') : '중앙';
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const receiptId = Math.random().toString(36).substring(2, 10).toUpperCase();

    const Row = ({ label, value }: { label: string; value: string }) => (
        <div className="flex justify-between text-[11px]">
            <span className="text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="font-bold">{value}</span>
        </div>
    );

    return (
        <div
            ref={ref}
            className="bg-white text-black w-full max-w-[340px] mx-auto font-mono relative"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
            {/* 상단 절취선 */}
            <PerforationLine position="top" />

            {/* 영수증 헤더 */}
            <div className="px-6 pt-8 pb-4 text-center border-b-2 border-dashed border-black space-y-1">
                <div className="text-[8px] tracking-[0.5em] uppercase text-slate-400">Official Document</div>
                <h2 className="text-2xl font-black tracking-tighter leading-none">FATE-SYNC</h2>
                <div className="text-[9px] tracking-[0.3em] text-slate-500">DESTINY ANALYTICS INSTITUTE</div>
                <div className="pt-2 space-y-0.5">
                    <div className="text-[9px] text-slate-400">ORDER #{receiptId}</div>
                    <div className="text-[9px] text-slate-400">{dateStr} {timeStr} KST</div>
                </div>
            </div>

            {/* 본문: 기본 정보 */}
            <div className="px-6 py-4 space-y-1.5 border-b border-dashed border-slate-300">
                <Row label="SEEKER" value={userName.slice(0, 8) + (userName.length > 8 ? '...' : '')} />
                <Row label="SOUL CARD" value={soulCard.replace('The ', '').toUpperCase().slice(0, 12)} />
                <Row label="ELEMENT" value={`${element || '?'} (${lucky.elementEn})`} />
                <Row label="SYNC RATE" value={`${synergyScore}%`} />
            </div>

            {/* 행운 아이템 */}
            <div className="px-6 py-4 border-b border-dashed border-slate-300 space-y-1.5">
                <div className="text-[10px] font-black underline underline-offset-2 mb-2 tracking-widest">[ LUCKY ITEMS ]</div>
                <Row label="NUMBER" value={lucky.numbers.join(' & ')} />
                <Row label="COLOR" value={lucky.colorName.toUpperCase().slice(0, 14)} />
                <Row label="COLOR (KO)" value={lucky.colorKo} />
                <Row label="DIRECTION" value={direction} />
            </div>

            {/* 키워드 */}
            {keywords.length > 0 && (
                <div className="px-6 py-4 border-b border-dashed border-slate-300 space-y-1">
                    <div className="text-[10px] font-black underline underline-offset-2 mb-2 tracking-widest">[ TRIAD OF FATE ]</div>
                    {keywords.slice(0, 3).map((kw, i) => (
                        <div key={i} className="flex justify-between text-[11px]">
                            <span className="text-slate-400">SEAL-{i + 1}</span>
                            <span className="font-bold">#{kw.slice(0, 14)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* 마스터의 한 줄 평 */}
            <div className="px-6 py-4 border-b border-dashed border-slate-300 space-y-2">
                <div className="text-[10px] font-black underline underline-offset-2 mb-2 tracking-widest">[ ORACLE'S NOTE ]</div>
                <p className="text-[10px] leading-relaxed text-slate-600 italic text-center">
                    "{oracleMessage.slice(0, 100)}"
                </p>
            </div>

            {/* QR 플레이스홀더 + 위트 문구 */}
            <div className="px-6 py-6 text-center space-y-4">
                {/* QR 패턴 (CSS 모자이크) */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 grid grid-cols-5 grid-rows-5 gap-0.5">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-[1px]"
                                style={{
                                    background: [0, 1, 2, 5, 10, 12, 14, 20, 22, 23, 24, 6, 18, 7, 17].includes(i)
                                        ? '#000' : '#e2e8f0',
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 tracking-widest">
                        fate-sync.vercel.app
                    </p>
                    <Dashes char="*" count={28} />
                    <p className="text-[10px] font-black tracking-widest uppercase pt-1">
                        Thank you for your visit
                    </p>
                    <p className="text-[9px] text-slate-500 italic">
                        * NO REFUNDS ON YOUR FATE *
                    </p>
                    <p className="text-[8px] text-slate-400 pt-1">
                        운명은 환불되지 않습니다
                    </p>
                </div>
            </div>

            {/* 하단 절취선 */}
            <PerforationLine position="bottom" />
        </div>
    );
});
ReceiptBody.displayName = 'ReceiptBody';

// ── 메인 모달 컴포넌트 ────────────────────────────────────────────────────

interface DestinyReceiptProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    soulCard?: string;
    element?: string;
    synergyScore?: number;
    keywords?: string[];
    oracleMessage?: string;
}

const DestinyReceipt: React.FC<DestinyReceiptProps> = ({
    isOpen, onClose, ...receiptData
}) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    // 영수증 이미지 다운로드 (html2canvas 방식)
    const handleDownload = async () => {
        if (!receiptRef.current) return;
        setDownloading(true);
        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: '#ffffff',
                scale: 3,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.download = `fate-receipt-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.warn('Download failed:', e);
        }
        setDownloading(false);
    };

    // Esc 키 닫기
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[500] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.85)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* 영수증 슬라이드업 */}
                    <motion.div
                        className="relative w-full max-w-[360px]"
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 60, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 닫기 버튼 (영수증 위) */}
                        <button
                            onClick={onClose}
                            className="absolute -top-10 right-0 p-2 rounded-full text-white/50 hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* 영수증 종이 그림자 */}
                        <div className="shadow-[0_0_60px_rgba(255,255,255,0.15),0_20px_60px_rgba(0,0,0,0.6)] rounded-sm">
                            <ReceiptBody ref={receiptRef} {...receiptData} />
                        </div>

                        {/* 하단 조작 버튼 */}
                        <div className="mt-6 flex gap-3">
                            <motion.button
                                onClick={handleDownload}
                                disabled={downloading}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs tracking-widest uppercase text-black disabled:opacity-60"
                                style={{
                                    background: 'linear-gradient(135deg, #b8860b, #D4AF37, #f5d87d)',
                                    boxShadow: '0 0 20px rgba(212,175,55,0.4)',
                                }}
                            >
                                <Download className="w-3.5 h-3.5" />
                                {downloading ? 'SAVING...' : 'SAVE IMAGE'}
                            </motion.button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-black text-xs tracking-widest uppercase text-white/60 border border-white/10 hover:border-white/25 transition-colors"
                            >
                                CLOSE
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DestinyReceipt;
