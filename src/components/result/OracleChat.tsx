import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import type { AnalysisResult, UserInput } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  result: AnalysisResult;
  userInput: UserInput;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

function buildFateContext(result: AnalysisResult, input: UserInput): string {
  const detail = result.saju_detail;
  const pillars = detail?.four_pillars;
  const age = new Date().getFullYear() - input.birthYear;
  const seasonKo: Record<string, string> = {
    spring: '봄(씨앗)', summer: '여름(성장)', autumn: '가을(수확)', winter: '겨울(내실)',
  };
  const lines: string[] = [];
  lines.push('[페르소나]');
  lines.push('너는 명리학 마스터 오라클이다. 장엄하면서도 실용적이며, 사용자의 사주 데이터에 근거한 답만 한다.');
  lines.push('범용 문구 금지. 반드시 아래 원국 데이터를 인용해 답하라.');
  lines.push('답변은 3-5문장으로 간결하게.');
  lines.push('');
  lines.push('[사용자]');
  lines.push(`- 생년월일: ${input.birthYear}-${input.birthMonth}-${input.birthDay} (${age}세)`);
  lines.push(`- 성별: ${input.gender === 'male' ? '남성' : '여성'}, MBTI: ${input.mbti}`);
  if (input.specialty) lines.push(`- 전문 분야: ${input.specialty}`);
  if (input.currentSituation) lines.push(`- 현재 상황: ${input.currentSituation}`);
  lines.push('');
  lines.push('[사주 원국]');
  if (pillars) {
    lines.push(`- 년주: ${pillars.year.heavenly}${pillars.year.earthly}`);
    lines.push(`- 월주: ${pillars.month.heavenly}${pillars.month.earthly}`);
    lines.push(`- 일주(일간): ${pillars.day.heavenly}${pillars.day.earthly}`);
    lines.push(`- 시주: ${pillars.hour.heavenly}${pillars.hour.earthly}`);
  }
  if (detail) {
    lines.push(`- 일간: ${detail.day_master.character} [${detail.day_master.element}]`);
    lines.push(`- 용신: ${detail.favorable_element} | 기신: ${detail.unfavorable_element}`);
    const fe = detail.five_elements;
    lines.push(`- 오행: 목${fe.wood} 화${fe.fire} 토${fe.earth} 금${fe.metal} 수${fe.water}`);
    if (detail.current_luck_period) {
      lines.push(`- 현재 대운: ${detail.current_luck_period.period} (${detail.current_luck_period.element})`);
    }
  }
  lines.push(`- 커리어 계절: ${seasonKo[result.current_season] ?? result.current_season}`);
  if (result.gyeokguk) lines.push(`- 격국: ${result.gyeokguk.name}`);
  if (result.career_sync?.recommended_jobs?.length) {
    lines.push(`- 추천 직업군: ${result.career_sync.recommended_jobs.join(', ')}`);
  }
  lines.push('');
  lines.push('위 데이터를 근거로 사용자의 질문에 답하라.');
  return lines.join('\n');
}

export default function OracleChat({ open, onClose, result, userInput }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fateContext = buildFateContext(result, userInput);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'model',
        content: `${userInput.birthYear}년생 ${result.saju_detail?.day_master.character ?? '일간'} 님, 안녕하십니까. 당신의 원국을 숙지했습니다. 커리어·관계·결정 — 무엇이든 물으시면 사주를 근거로 답하겠습니다.`,
      }]);
    }
  }, [open, messages.length, userInput.birthYear, result.saju_detail?.day_master.character]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 150);
  }, [open]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setError(null);
    setInput('');
    const next = [...messages, { role: 'user' as const, content: msg }];
    setMessages(next);
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages.filter((m) => m.role === 'user' || m.role === 'model').map((m) => ({
            role: m.role,
            content: m.content,
          })),
          fateContext,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `서버 오류 (${res.status})`);
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'model', content: data.response ?? '(응답 없음)' }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '상담 중 오류가 발생했습니다.';
      setError(message);
      setMessages((prev) => prev.slice(0, -1));
      setInput(msg);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            height: '82vh',
            maxHeight: '720px',
            background: '#fff',
            borderRadius: '24px 24px 0 0',
            border: '1px solid #d9f99d',
            borderBottom: 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid #d9f99d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '3px', color: '#65a30d', fontWeight: 700 }}>
                MASTER ORACLE
              </p>
              <h2 style={{ fontSize: '17px', fontWeight: 800, marginTop: '4px' }}>
                마스터 오라클 실시간 상담
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#f5f5f4',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '86%',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user'
                    ? '#ecfccb'
                    : '#fafaf9',
                  border: `1px solid ${m.role === 'user' ? '#84cc16' : 'rgba(255,255,255,0.08)'}`,
                  fontSize: '14px',
                  lineHeight: 1.65,
                  color: 'var(--text)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '14px 14px 14px 4px',
                  background: '#fafaf9',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                }}
              >
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                오라클이 답하는 중...
              </div>
            )}
            {error && (
              <div style={{
                alignSelf: 'center',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#e11d48',
                background: '#ffe4e6',
                border: '1px solid var(--border)',
                borderRadius: '10px',
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px 16px 18px',
              borderTop: '1px solid #ecfccb',
              flexShrink: 0,
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="지금 고민되는 결정이나 질문을 입력하세요 (⌘+Enter)"
              rows={2}
              maxLength={500}
              style={{
                flex: 1,
                resize: 'none',
                padding: '10px 12px',
                fontSize: '14px',
                lineHeight: 1.5,
                background: '#fafaf9',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                color: 'var(--text)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: input.trim() && !sending
                  ? '#1a1a1a'
                  : '#f5f5f4',
                color: input.trim() && !sending ? '#000' : 'var(--text-muted)',
                border: 'none',
                cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Send size={14} />
              전송
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
