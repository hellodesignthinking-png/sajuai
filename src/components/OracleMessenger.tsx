import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldAlert, Compass, MessageSquare } from 'lucide-react';

interface OracleMessage {
    role: 'oracle' | 'insight';
    content: string;
    sentiment: 'positive' | 'caution' | 'neutral';
    label?: string;
}

interface OracleMessengerProps {
    messages: OracleMessage[];
    onTyping?: () => void;
}

const sentimentConfig = {
    positive: {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/5',
        glow: 'shadow-emerald-500/10',
        avatarBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20',
        avatarBorder: 'border-emerald-500/40',
        labelColor: 'text-emerald-400',
        icon: Sparkles,
        emoji: '✨',
    },
    caution: {
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/5',
        glow: 'shadow-rose-500/10',
        avatarBg: 'bg-gradient-to-br from-rose-500/20 to-orange-600/20',
        avatarBorder: 'border-rose-500/40',
        labelColor: 'text-rose-400',
        icon: ShieldAlert,
        emoji: '⚠️',
    },
    neutral: {
        border: 'border-indigo-500/30',
        bg: 'bg-indigo-500/5',
        glow: 'shadow-indigo-500/10',
        avatarBg: 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20',
        avatarBorder: 'border-indigo-500/40',
        labelColor: 'text-indigo-400',
        icon: Compass,
        emoji: '🧘',
    },
};

const TypingIndicator = () => (
    <div className="flex items-center gap-1.5 px-4 py-3">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#D4AF37]/60"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
        ))}
    </div>
);

const OracleMessenger: React.FC<OracleMessengerProps> = ({ messages, onTyping }) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (visibleCount < messages.length) {
            setIsTyping(true);
            const timer = setTimeout(() => {
                setIsTyping(false);
                setVisibleCount((prev) => prev + 1);
                onTyping?.();
            }, 800 + Math.random() * 400);
            return () => clearTimeout(timer);
        }
    }, [visibleCount, messages.length]);

    return (
        <div className="space-y-4 max-w-3xl mx-auto">
            {/* Oracle Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-amber-600/20 border-2 border-[#D4AF37]/40 flex items-center justify-center shadow-lg shadow-[#D4AF37]/10">
                    <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-[#D4AF37] tracking-wide">마스터 오라클</h4>
                    <span className="text-[9px] font-bold text-[#D4AF37]/50 uppercase tracking-[0.2em]">Master Oracle • Online</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-widest">Live</span>
                </div>
            </div>

            {/* Messages */}
            <AnimatePresence mode="popLayout">
                {messages.slice(0, visibleCount).map((msg, idx) => {
                    const config = sentimentConfig[msg.sentiment];
                    const Icon = config.icon;
                    const isOracle = msg.role === 'oracle';

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className={`flex gap-3 ${isOracle ? '' : 'flex-row-reverse'}`}
                        >
                            {/* Avatar */}
                            {isOracle && (
                                <div className={`w-9 h-9 rounded-full ${config.avatarBg} border ${config.avatarBorder} flex items-center justify-center flex-shrink-0 mt-1`}>
                                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                                </div>
                            )}

                            {/* Bubble */}
                            <div className={`flex-1 ${isOracle ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
                                {msg.label && (
                                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ${config.labelColor}`}>
                                        {config.emoji} {msg.label}
                                    </div>
                                )}
                                <div className={`rounded-2xl ${isOracle ? 'rounded-tl-sm' : 'rounded-tr-sm'} ${config.bg} ${config.border} border p-5 shadow-lg ${config.glow} backdrop-blur-sm`}>
                                    <p className="text-sm text-slate-200 leading-relaxed font-light whitespace-pre-wrap break-keep">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && visibleCount < messages.length && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 items-center"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-amber-600/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-[#D4AF37]/60" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm">
                        <TypingIndicator />
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default OracleMessenger;
