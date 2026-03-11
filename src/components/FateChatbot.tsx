import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FateAnalysisResult } from '../types';
import { chatWithFateMaster, ChatMessage } from '../services/fateService';

interface Props {
  fateResult: FateAnalysisResult;
}

export const FateChatbot: React.FC<Props> = ({ fateResult }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const characterInfo = fateResult.hybrid.cartoonInfo;

  useEffect(() => {
    // 초기 환영 메시지
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        content: characterInfo 
          ? `안녕! 나는 **${characterInfo.characterName}**! 네 운명을 엿보고 왔는데 꽤 흥미롭더라구. 사주, 관상, 손금 분석 결과에 대해 더 궁금한 게 있다면 뭐든 물어봐!`
          : '안녕하세요. 당신의 운명을 함께 분석한 마스터입니다. 방금 보신 사주, 관상, 손금 리포트 중 더 깊이 알고 싶은 부분이 있다면 편하게 말씀해 주세요.'
      }]);
    }
  }, [characterInfo, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMsg } as ChatMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await chatWithFateMaster(userMsg, newHistory.slice(1), fateResult); // 초기 메시지 제외 전송
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: '미안, 잠시 기운이 엉켜서 대답하기 어려워. 다시 한번 말해줄래?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[600px] flex flex-col glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-black/40 border-b border-white/10 backdrop-blur-md relative z-10 shrink-0">
        <div className="relative">
          {characterInfo?.cartoonImageUrl ? (
            <img src={characterInfo.cartoonImageUrl} alt="Bot" className="w-12 h-12 rounded-full object-cover border border-mystic-accent/50" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#12081f] animate-pulse" />
        </div>
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            {characterInfo?.characterName || '운명 마스터'}
            <Sparkles className="w-4 h-4 text-mystic-gold" />
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">실시간 대화 가능</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#0a0514] to-[#12081f] relative">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {msg.role === 'model' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-mystic-accent/20 flex items-center justify-center border border-mystic-accent/30 self-end mb-1">
                  <Bot className="w-4 h-4 text-mystic-accent" />
                </div>
              )}
              <div 
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-white/10 text-slate-200 border border-white/5 rounded-bl-sm prose prose-invert prose-p:my-1 prose-sm max-w-none'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[80%]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-mystic-accent/20 flex items-center justify-center border border-mystic-accent/30 self-end mb-1">
                <Bot className="w-4 h-4 text-mystic-accent" />
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/5 rounded-bl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-mystic-accent animate-spin" />
                <span className="text-xs text-slate-400">운명의 실타래를 푸는 중...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/60 border-t border-white/10 shrink-0">
        <label className="relative flex items-center w-full">
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mystic-accent focus:bg-white/10 transition-all"
            placeholder={isLoading ? "답변을 기다리는 중..." : "운명에 대해 무엇이든 물어보세요..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-mystic-accent text-white flex items-center justify-center hover:bg-mystic-accent/80 disabled:opacity-50 disabled:hover:bg-mystic-accent transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </label>
      </div>
    </div>
  );
};
