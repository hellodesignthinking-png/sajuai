/**
 * GrandOracleCategory.tsx
 * V41: 그랜드 오라클 퓨전 — 5대 카테고리 목적 선택 UI
 *
 * 사용자가 분석의 '목적'을 선택하면 백엔드 fusion.py가
 * 해당 분류에 집중된 전문 리포트를 생성합니다.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Coins, Heart, Activity, Compass, ChevronRight } from 'lucide-react';

// ── 카테고리 데이터 ───────────────────────────────────────────────────────

export type OracleCategory = '총운' | '재물' | '인연' | '건강' | '택일';

interface CategoryDef {
    id: OracleCategory;
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    tools: string[];          // 사용 점술 도구
    output: string;           // 결과물 형태
    color: string;            // 테마 색상
    glow: string;
}

const CATEGORIES: CategoryDef[] = [
    {
        id: '총운',
        icon: <Crown className="w-6 h-6" />,
        label: '총운 · 명반',
        sublabel: 'Destiny Overview',
        tools: ['사주', '자미두수', '관상 12궁'],
        output: '생애 주기 그래프 & 아키타입 타로',
        color: '#D4AF37',
        glow: 'rgba(212,175,55,0.3)',
    },
    {
        id: '재물',
        icon: <Coins className="w-6 h-6" />,
        label: '재물 · 성공',
        sublabel: 'Wealth & Career',
        tools: ['사주 재성', '손금 재운선', 'MBTI 성취욕'],
        output: '3단계 비즈니스 로드맵',
        color: '#10b981',
        glow: 'rgba(16,185,129,0.3)',
    },
    {
        id: '인연',
        icon: <Heart className="w-6 h-6" />,
        label: '인연 · 결혼',
        sublabel: 'Love & Connection',
        tools: ['숙요', '점성술', '2인 관상 궁합', '감정선'],
        output: '영혼의 싱크로율 & 갈등 해결법',
        color: '#f43f5e',
        glow: 'rgba(244,63,94,0.3)',
    },
    {
        id: '건강',
        icon: <Activity className="w-6 h-6" />,
        label: '건강 · 기질',
        sublabel: 'Health & Vitality',
        tools: ['사주 오행 허실', '관상 기색', '생명선'],
        output: '신체 에너지 밸런스 차트',
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.3)',
    },
    {
        id: '택일',
        icon: <Compass className="w-6 h-6" />,
        label: '택일 · 방향',
        sublabel: 'Timing & Direction',
        tools: ['기문둔갑', '구성기학', '오행 방위'],
        output: '행운의 좌표 & 이동 방향 가이드',
        color: '#a78bfa',
        glow: 'rgba(167,139,250,0.3)',
    },
];

// ── 카테고리 카드 ────────────────────────────────────────────────────────

const CategoryCard = ({
    cat,
    selected,
    onSelect,
}: {
    cat: CategoryDef;
    selected: boolean;
    onSelect: (id: OracleCategory) => void;
}) => {
    const [hovered, setHovered] = useState(false);
    const active = selected || hovered;

    return (
        <motion.button
            onClick={() => onSelect(cat.id)}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.97 }}
            className="relative w-full text-left rounded-3xl overflow-hidden transition-all group/cat"
            style={{
                background: selected
                    ? `linear-gradient(135deg, ${cat.color}15, ${cat.color}05)`
                    : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active ? cat.color + '40' : 'rgba(255,255,255,0.04)'}`,
                backdropFilter: 'blur(20px)',
                boxShadow: selected ? `0 20px 40px -15px ${cat.glow}` : 'none',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
        >
            {/* 선택 시 상단 강조선 */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-[2px]"
                animate={{ opacity: selected ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }}
            />

            <div className="p-4 flex items-start gap-3">
                {/* 아이콘 */}
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                        background: `${cat.color}18`,
                        border: `1px solid ${cat.color}40`,
                        color: cat.color,
                    }}
                >
                    {cat.icon}
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-black">{cat.label}</span>
                            <span className="text-[9px] font-bold ml-2 tracking-widest uppercase"
                                style={{ color: `${cat.color}70` }}>
                                {cat.sublabel}
                            </span>
                        </div>
                        {selected && (
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: cat.color }}
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <polyline points="2,5 4,7 8,3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.div>
                        )}
                    </div>

                    {/* 사용 도구 태그 */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {cat.tools.map(t => (
                            <span key={t}
                                className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide"
                                style={{
                                    background: `${cat.color}12`,
                                    color: `${cat.color}90`,
                                    border: `1px solid ${cat.color}20`,
                                }}>
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* 결과물 */}
                    <AnimatePresence>
                        {selected && (
                            <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="text-[10px] mt-2 leading-relaxed overflow-hidden"
                                style={{ color: 'rgba(255,255,255,0.5)' }}
                            >
                                → {cat.output}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.button>
    );
};

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────

interface GrandOracleCategoryProps {
    value?: OracleCategory;
    onChange: (cat: OracleCategory) => void;
    /** 콤팩트 모드 (기본: false — 전체 카드, true — 수평 칩 형태) */
    compact?: boolean;
}

const GrandOracleCategory: React.FC<GrandOracleCategoryProps> = ({
    value,
    onChange,
    compact = false,
}) => {
    if (compact) {
        // 수평 칩 형태 (이미 선택된 화면에서 재선택용)
        return (
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                    <motion.button
                        key={cat.id}
                        onClick={() => onChange(cat.id)}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide transition-all"
                        style={{
                            background: value === cat.id ? `${cat.color}20` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${value === cat.id ? cat.color + '70' : 'rgba(255,255,255,0.08)'}`,
                            color: value === cat.id ? cat.color : 'rgba(255,255,255,0.35)',
                            boxShadow: value === cat.id ? `0 0 12px ${cat.glow}` : 'none',
                        }}
                    >
                        <span style={{ color: cat.color }}>{cat.icon}</span>
                        {cat.label}
                    </motion.button>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-4">
                <ChevronRight className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.6)' }} />
                <div>
                    <p className="text-sm font-black tracking-tight">분석의 목적을 선택하세요</p>
                    <p className="text-[9px] font-black tracking-[0.3em] uppercase mt-0.5"
                        style={{ color: 'rgba(212,175,55,0.45)' }}>
                        Grand Oracle Fusion — 목적 지향형 통합 분석
                    </p>
                </div>
            </div>

            {/* 카테고리 카드 그리드 */}
            <div className="grid grid-cols-1 gap-2">
                {CATEGORIES.map((cat, i) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
                    >
                        <CategoryCard cat={cat} selected={value === cat.id} onSelect={onChange} />
                    </motion.div>
                ))}
            </div>

            {/* 선택 안내 */}
            {!value && (
                <motion.p
                    className="text-[9px] text-center mt-3"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    선택하지 않으면 '총운' 분석이 기본 적용됩니다
                </motion.p>
            )}
        </div>
    );
};

export default GrandOracleCategory;
