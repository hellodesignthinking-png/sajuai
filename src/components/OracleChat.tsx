import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Sparkles, Loader2, User } from 'lucide-react';

interface OracleChatProps {
    analysisResult: any;
    userName: string;
    onTyping?: () => void;
    onMessagesChange?: (messages: { role: 'user' | 'model'; text: string }[]) => void;
}

export const OracleChat: React.FC<OracleChatProps> = ({ analysisResult, userName, onTyping, onMessagesChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Personalized welcome message
            const dayMaster = analysisResult.saju.dayMaster || '';
            const tarotName = analysisResult.hybrid.cartoonInfo?.characterName?.split('(')[0]?.trim() || '운명의';

            setMessages([{
                role: 'model',
                text: `반갑습니다, ${userName}님. 당신의 ${dayMaster} 기운과 ${tarotName} 카드를 보았습니다. 운명에 대해 더 깊이 궁금한 점이 있으신가요?`
            }]);
        }
    }, [isOpen, analysisResult, userName, messages.length]);

    const handleSendMessage = async () => {
        if (!input.trim() || isTyping) return;

        const userMsgText = input.trim();
        const userMsg: { role: 'user' | 'model', text: string } = { role: 'user', text: userMsgText };
        setMessages(prev => {
            const next = [...prev, userMsg];
            onMessagesChange?.(next);
            return next;
        });
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/oracle-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: messages,
                    current_message: userMsgText,
                    context: analysisResult
                }),
            });
            const data = await response.json();
            setMessages(prev => {
                const next = [...prev, { role: 'model' as const, text: data.reply }];
                onMessagesChange?.(next);
                return next;
            });
            onTyping?.(); // Play typing SFX
        } catch (err) {
            console.error("Oracle Chat Error:", err);
            setMessages(prev => [...prev, { role: 'model', text: '우주의 메시지를 불러오는 데 실패했습니다. 다시 시도해 주세요.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] no-print">
            {/* 플로팅 수정구 버튼 */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center relative group"
            >
                <div className="absolute inset-0 rounded-full animate-pulse bg-white/10" />
                <MessageSquare className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
            </motion.button>

            {/* 채팅창 UI */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        className="fixed bottom-28 right-8 w-[350px] md:w-96 h-[500px] bg-[#0f111a]/95 backdrop-blur-2xl border border-indigo-500/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* 헤더 */}
                        <div className="p-6 bg-indigo-500/10 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-black tracking-widest text-indigo-200">ORACLE LIVE</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* 메시지 영역 */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${m.role === 'user' ? 'bg-indigo-500/20 border-indigo-400/30' : 'bg-[#D4AF37]/20 border-[#D4AF37]/30'
                                            }`}>
                                            {m.role === 'user' ? <User className="w-4 h-4 text-indigo-400" /> : <Sparkles className="w-3 h-3 text-[#D4AF37]" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20'
                                            : 'bg-white/5 text-indigo-100 border border-white/5 rounded-tl-none'
                                            }`}>
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 items-center bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                        <span className="text-xs text-indigo-300/60 font-medium">오라클이 당신의 운명을 살피는 중...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 입력창 */}
                        <div className="p-4 bg-black/40 border-t border-white/5">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="마스터에게 질문하세요..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isTyping || !input.trim()}
                                    className="p-3 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                                >
                                    <Send size={18} className="text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OracleChat;
