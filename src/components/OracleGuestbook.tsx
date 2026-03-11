/**
 * OracleGuestbook.tsx
 * V48: The Golden Ledger of Destiny (Sovereign Edition)
 *
 * - 익명 소울 카드 + 성씨 표기
 * - 실시간 공명 지수 (Resonance Index)
 * - V48: 골드 멤버십 전용 황금 체크마크 표시
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Quote, Sparkles, Send, Flame, TrendingUp, CheckCircle2 } from 'lucide-react';

// ── 타입 ─────────────────────────────────────────────────────────────────────

interface GuestbookEntry {
    id: number;
    soulName: string;   // "The Magician 김님"
    text: string;
    date: string;
    element: string;    // 오행 (색상용)
    resonance: number;  // 해당 글의 공명 점수
    isGold?: boolean;   // V48: 골드 멤버십 여부
}

// ── 공명 지수 계산 ─────────────────────────────────────────────────────────

const POSITIVE_WORDS = [
    '감사', '소름', '정확', '감동', '신기', '맞아', '위로', '희망', '놀라', '행복',
    '완벽', '대단', '신뢰', '확신', '도움', '변화', '계기', '결심', '감격', '울컥'
];

function calcResonance(text: string): number {
    const count = POSITIVE_WORDS.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
    return Math.min(100, 60 + count * 12 + (text.length > 20 ? 8 : 0));
}

function calcGroupResonance(entries: GuestbookEntry[]): number {
    if (!entries.length) return 72;
    return Math.round(entries.reduce((a, e) => a + e.resonance, 0) / entries.length);
}

// ── 오행별 색상 ────────────────────────────────────────────────────────────

const ELEMENT_COLOR: Record<string, string> = {
    '목': '#2ecc71', '木': '#2ecc71',
    '화': '#e74c3c', '火': '#e74c3c',
    '토': '#f39c12', '土': '#f39c12',
    '금': '#bdc3c7', '金': '#bdc3c7',
    '수': '#3498db', '水': '#3498db',
};
function elementColor(el?: string) {
    return el ? (ELEMENT_COLOR[el] || '#D4AF37') : '#D4AF37';
}

// ── 타임스탬프 포맷 ────────────────────────────────────────────────────────

function formatDate(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
}

// ── 샘플 시드 데이터 ──────────────────────────────────────────────────────

const SEED: GuestbookEntry[] = [
    {
        id: 1,
        soulName: 'The Sun 이님',
        text: '사업 고민이 깊었는데 갈 길을 정해주시네요. 3단계 로드맵대로 해볼게요. 감사합니다.',
        date: '1시간 전', element: '화', resonance: 88, isGold: true,
    },
    {
        id: 2,
        soulName: 'The Lovers 박님',
        text: '궁합 결과 보고 소름 돋았어요. 오행 충돌 지점이 우리가 계속 다퉜던 이유 맞아요.',
        date: '3시간 전', element: '수', resonance: 92,
    },
    {
        id: 3,
        soulName: 'The Hermit 최님',
        text: '혼자 조용히 읽다가 울컥했습니다. 진태양시 보정이라는 걸 처음 알았어요.',
        date: '어제', element: '금', resonance: 84, isGold: true,
    },
    {
        id: 4,
        soulName: 'The Emperor 김님',
        text: '팀 빌딩 결과가 너무 정확합니다. 대표님이 꼭 보셔야 할 것 같아서 공유했어요.',
        date: '2일 전', element: '목', resonance: 80,
    },
];

// ── 공명 지수 바 컴포넌트 ────────────────────────────────────────────────

const ResonanceBar = ({ index }: { index: number }) => {
    const color = index > 85 ? '#D4AF37' : index > 70 ? '#3498db' : '#6b7280';
    return (
        <div className="w-full max-w-sm mx-auto space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[8px] font-black tracking-[0.4em] uppercase"
                    style={{ color: 'rgba(212,175,55,0.5)' }}>
                    Collective Resonance Index
                </span>
                <motion.span
                    className="text-lg font-serif font-black"
                    style={{ color }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                >
                    {index}
                </motion.span>
            </div>
            <div className="h-1 w-full rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${index}%` }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                />
            </div>
            <p className="text-[9px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {index > 85 ? '✦ 오늘의 우주 공명이 최고조에 달했습니다' :
                    index > 70 ? '✦ 많은 여행자들이 운명의 흐름을 느끼고 있습니다' :
                        '✦ 더 많은 여행자의 기록을 기다립니다'}
            </p>
        </div>
    );
};

// ── 개별 엔트리 카드 ─────────────────────────────────────────────────────

const EntryCard = ({ entry, index }: { entry: GuestbookEntry; index: number }) => {
    const color = elementColor(entry.element);

    return (
        <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 22 }}
            className="relative overflow-hidden rounded-2xl p-6"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: `1px solid ${color}20`,
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* 왼쪽 오행 강조선 */}
            <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
                style={{ background: `linear-gradient(to bottom, transparent, ${color}80, transparent)` }} />

            {/* 인용 따옴표 장식 */}
            <Quote className="absolute top-4 right-5 opacity-[0.04] w-10 h-10"
                style={{ color }} />

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black tracking-[0.35em] uppercase"
                        style={{ color: `${color}90` }}>
                        {entry.soulName}
                    </span>
                    {entry.isGold && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-mystic-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                        <Flame className="w-2.5 h-2.5" style={{ color }} />
                        <span className="text-[8px] font-black" style={{ color }}>{entry.resonance}</span>
                    </div>
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{entry.date}</span>
                </div>
            </div>

            <p className="text-sm leading-relaxed font-light italic"
                style={{ color: 'rgba(255,255,255,0.75)' }}>
                &ldquo;{entry.text}&rdquo;
            </p>
        </motion.div>
    );
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

interface OracleGuestbookProps {
    soulCard?: string;    // 타로 카드명 (예: "The Magician")
    userName?: string;    // 사용자 이름 (성씨만 사용)
    element?: string;     // 사용자 지배 오행
}

const OracleGuestbook: React.FC<OracleGuestbookProps> = ({
    soulCard = 'The Oracle',
    userName = '익명',
    element,
}) => {
    const [entries, setEntries] = useState<GuestbookEntry[]>(() => {
        // LocalStorage에서 복원
        try {
            const saved = localStorage.getItem('fate_guestbook');
            return saved ? [...JSON.parse(saved), ...SEED] : SEED;
        } catch { return SEED; }
    });
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [focused, setFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resonanceIndex = calcGroupResonance(entries);
    const userColor = elementColor(element);
    const displayName = `${soulCard} ${userName.slice(0, 1)}님`;

    // 저장될 때마다 LocalStorage 동기화
    useEffect(() => {
        const personal = entries.filter(e => !SEED.find(s => s.id === e.id));
        try { localStorage.setItem('fate_guestbook', JSON.stringify(personal)); } catch { }
    }, [entries]);

    const handleSubmit = () => {
        if (!message.trim() || submitted) return;
        const newEntry: GuestbookEntry = {
            id: Date.now(),
            soulName: displayName,
            text: message.trim(),
            date: formatDate(Date.now()),
            element: element || 'default',
            resonance: calcResonance(message),
            isGold: true, // V48 사용자는 항상 골드
        };
        setEntries(prev => [newEntry, ...prev]);
        setMessage('');
        setSubmitted(true);
    };

    return (
        <section className="w-full mt-20 mb-10 space-y-12">
            {/* ── 헤더 ── */}
            <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                {/* 상단 장식 */}
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4))' }} />
                    <Sparkles className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.6)' }} />
                    <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.4))' }} />
                </div>

                <h3 className="text-3xl md:text-4xl font-serif font-black italic"
                    style={{
                        background: 'linear-gradient(135deg, #f5d87d 0%, #D4AF37 40%, #b8860b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                    The Golden Ledger
                </h3>
                <p className="text-[10px] tracking-[0.45em] uppercase"
                    style={{ color: 'rgba(212,175,55,0.4)' }}>
                    운명의 도서관에 당신의 흔적을 남기세요
                </p>

                {/* 공명 지수 */}
                <div className="pt-2">
                    <ResonanceBar index={resonanceIndex} />
                </div>
            </motion.div>

            {/* ── 입력 영역 ── */}
            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="relative rounded-[2rem] overflow-hidden"
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: `1px solid ${focused ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.12)'}`,
                            backdropFilter: 'blur(20px)',
                            boxShadow: focused ? '0 0 40px rgba(212,175,55,0.08)' : 'none',
                            transition: 'all 0.3s',
                        }}
                    >
                        {/* 상단 글로우 라인 */}
                        <div className="absolute top-0 inset-x-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,${focused ? '0.5' : '0.15'}), transparent)` }} />

                        <div className="p-7">
                            {/* 작성자 표시 */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ background: `${userColor}18`, border: `1px solid ${userColor}40` }}>
                                    <PenTool className="w-3.5 h-3.5" style={{ color: userColor }} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black tracking-widest"
                                        style={{ color: `${userColor}80` }}>
                                        {displayName}
                                    </span>
                                    <CheckCircle2 className="w-3 h-3 text-mystic-gold opacity-60" />
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Quote className="w-7 h-7 flex-shrink-0 mt-1 opacity-20" style={{ color: '#D4AF37' }} />
                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
                                    rows={3}
                                    maxLength={200}
                                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed font-light"
                                    style={{ color: 'rgba(255,255,255,0.8)' }}
                                    placeholder="마스터의 조언에 대한 감상을 금빛 기록으로 남겨보세요... (⌘+Enter로 전송)"
                                />
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                                    {message.length}/200
                                </span>
                                <motion.button
                                    onClick={handleSubmit}
                                    disabled={!message.trim()}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    style={{
                                        background: message.trim()
                                            ? 'linear-gradient(135deg, #b8860b, #D4AF37, #f5d87d)' : 'rgba(255,255,255,0.05)',
                                        color: message.trim() ? '#030305' : 'rgba(255,255,255,0.2)',
                                        boxShadow: message.trim() ? '0 0 20px rgba(212,175,55,0.35)' : 'none',
                                    }}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    기록 보관하기
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="submitted"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10 rounded-[2rem]"
                        style={{
                            background: 'rgba(212,175,55,0.05)',
                            border: '1px solid rgba(212,175,55,0.2)',
                        }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 6, -6, 0] }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl mb-4"
                        >
                            ✦
                        </motion.div>
                        <p className="font-serif font-black text-lg" style={{ color: '#D4AF37' }}>
                            당신의 기록이 운명의 도서관에 새겨졌습니다
                        </p>
                        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            다른 여행자들이 당신의 흔적을 통해 위로받을 것입니다
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 엔트리 목록 ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase"
                        style={{ color: 'rgba(212,175,55,0.35)' }}>
                        <TrendingUp className="inline w-3 h-3 mr-1" />
                        Seekers' Records
                    </span>
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                        {entries.length}명의 여행자 기록
                    </span>
                </div>

                <AnimatePresence initial={false}>
                    {entries.map((entry, idx) => (
                        <EntryCard key={entry.id} entry={entry} index={idx} />
                    ))}
                </AnimatePresence>
            </div>

            {/* ── 하단 장식 ── */}
            <div className="flex items-center justify-center gap-4 pt-4">
                <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.2))' }} />
                <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: 'rgba(212,175,55,0.2)' }}>
                    End of Records
                </span>
                <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.2))' }} />
            </div>
        </section>
    );
};

export default OracleGuestbook;
