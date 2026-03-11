import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, FileText, Instagram } from 'lucide-react';

interface FinalFarewellProps {
    result: any;
    activeMode: 'personal' | 'synergy' | 'business';
    onShareCard: () => void;
    onDownloadPDF: () => void;
    isExportingPDF: boolean;
}

// ── 3가지 문구 버전 ────────────────────────────────────────────────

const FAREWELLS = {
    spiritual: {
        label: '영혼의 공명',
        icon: '🔮',
        quote: `Seeker여, 당신의 영혼에 새겨진 이 찬란한 궤적을 보십시오.\n이 빛은 당신 혼자만 간직하기엔 너무나 눈부십니다.`,
        cta: '당신의 소울 카드를 세상에 드러내어, 같은 진동을 가진 인연들을 당신의 궤적으로 끌어당기십시오. 우주는 당신이 증명될 때 비로소 응답합니다.',
        shareLabel: '인연을 끌어당기기',
        pdfLabel: '비전을 소장하기',
    },
    authority: {
        label: '운명의 선언',
        icon: '👑',
        quote: `데이터는 거짓말을 하지 않습니다. 당신은 이미 완성된 설계도입니다.`,
        cta: '이 운명 비전을 선언함으로써 당신의 영역을 확고히 하십시오. 리더의 운명은 스스로를 증명하는 것에서 시작됩니다.',
        shareLabel: '아키타입 공표하기',
        pdfLabel: '운명 비전 PDF 저장',
    },
    trendy: {
        label: '우주적 플렉스',
        icon: '⚡',
        quote: `이 정도 정합성이면 이건 거의 '운명 스포일러' 수준이군요.`,
        cta: '혼자만 알고 있기엔 너무 억울할 정도로 완벽한 당신의 캐릭터 카드입니다. 친구들에게 당신의 싱크로율을 슬쩍 보여주세요.',
        shareLabel: '스토리로 플렉스하기',
        pdfLabel: '내 운명 아카이브 저장',
    },
};

// Mode → farewell variant
const modeToVariant: Record<string, keyof typeof FAREWELLS> = {
    business: 'authority',
    synergy: 'trendy',
    personal: 'spiritual',
};

export const FinalFarewell: React.FC<FinalFarewellProps> = ({
    result,
    activeMode,
    onShareCard,
    onDownloadPDF,
    isExportingPDF
}) => {
    const element = result?.saju?.dayMasterElement || result?.saju?.element;
    const syncRate = result?.hybrid?.synergyScore || 0;
    const characterName = result?.hybrid?.cartoonInfo?.characterName?.split('(')[0]?.trim() || '운명의 아키타입';

    // Auto-pick variant by mode, but allow user to switch
    const defaultVariant = modeToVariant[activeMode] || 'spiritual';
    const [variant, setVariant] = useState<keyof typeof FAREWELLS>(defaultVariant);
    const fw = FAREWELLS[variant];

    const elementAccent: Record<string, string> = {
        '목': '#10b981', '화': '#ef4444', '토': '#f59e0b', '금': '#e2e8f0', '수': '#3b82f6',
    };
    const accent = elementAccent[element] || '#D4AF37';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mt-24 mb-8 relative"
        >
            {/* Glow backdrop */}
            <div
                className="absolute inset-0 rounded-[3rem] pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14, transparent 70%)` }}
            />

            <div className="relative p-10 md:p-16 rounded-[3rem] border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent text-center space-y-10">

                {/* Icon */}
                <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border"
                    style={{ borderColor: accent + '44', background: accent + '15' }}
                >
                    <Sparkles className="w-7 h-7" style={{ color: accent }} />
                </motion.div>

                {/* Sync stat badge */}
                <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-px" style={{ background: `linear-gradient(to right, transparent, ${accent})` }} />
                    <span className="text-[11px] font-black tracking-[0.4em] uppercase" style={{ color: accent + 'bb' }}>
                        {characterName} · 싱크로율 {syncRate}%
                    </span>
                    <div className="w-10 h-px" style={{ background: `linear-gradient(to left, transparent, ${accent})` }} />
                </div>

                {/* Variant selector tabs */}
                <div className="flex justify-center gap-3 flex-wrap">
                    {(Object.keys(FAREWELLS) as (keyof typeof FAREWELLS)[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setVariant(key)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${variant === key
                                    ? 'text-white border-white/30 bg-white/10'
                                    : 'text-slate-500 border-white/5 bg-transparent hover:border-white/15'
                                }`}
                        >
                            {FAREWELLS[key].icon} {FAREWELLS[key].label}
                        </button>
                    ))}
                </div>

                {/* Quote block */}
                <motion.div
                    key={variant}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 max-w-2xl mx-auto"
                >
                    <blockquote className="text-lg md:text-xl font-serif italic text-slate-200 leading-relaxed whitespace-pre-line">
                        "{fw.quote}"
                    </blockquote>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
                        {fw.cta}
                    </p>
                </motion.div>

                {/* Gold divider */}
                <div className="flex items-center gap-4 max-w-xs mx-auto">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
                    <span className="text-[#D4AF37]/50 text-xs">✦</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                    {/* Instagram Story share */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onShareCard}
                        className="group px-8 py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-3 overflow-hidden relative"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
                    >
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'linear-gradient(135deg, #6d28d9, #be185d)' }}
                        />
                        <Instagram className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">{fw.shareLabel}</span>
                    </motion.button>

                    {/* PDF download */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onDownloadPDF}
                        disabled={isExportingPDF}
                        className="px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 border transition-all disabled:opacity-50"
                        style={{ color: '#D4AF37', borderColor: '#D4AF37' + '44', background: '#D4AF37' + '0d' }}
                    >
                        <FileText className="w-5 h-5" />
                        <span>
                            {isExportingPDF ? '비전 생성 중...' : fw.pdfLabel}
                        </span>
                    </motion.button>
                </div>

                {/* Final seal */}
                <p className="text-[10px] text-slate-600 tracking-[0.4em] uppercase pt-2">
                    Master Oracle's Final Blessing · Fate-Sync Eternal Edition
                </p>
            </div>
        </motion.div>
    );
};

export default FinalFarewell;
