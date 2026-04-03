import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserInput } from '../../types';

interface InputFormProps {
  onSubmit: (input: UserInput) => void;
  onBack: () => void;
}

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function genYears() {
  const years = [];
  for (let y = new Date().getFullYear() - 15; y >= 1950; y--) years.push(y);
  return years;
}

export default function InputForm({ onSubmit, onBack }: InputFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Partial<UserInput>>({
    birthYear: 1990,
    birthMonth: 1,
    birthDay: 1,
    birthHour: -1,
    calendarType: 'solar',
    birthPlace: '',
    mbti: '모름',
    gender: 'male',
  });

  const set = (key: keyof UserInput, value: UserInput[keyof UserInput]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
  };

  const handleSubmit = () => {
    if (!form.birthYear || !form.birthMonth || !form.birthDay) return;
    onSubmit(form as UserInput);
  };

  const isStep1Valid = form.birthYear && form.birthMonth && form.birthDay;

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '8px',
    display: 'block',
    letterSpacing: '0.5px',
  };

  const rowStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '12px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px 80px',
      }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '560px', marginBottom: '40px' }}>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{ marginBottom: '32px', padding: '8px 16px', fontSize: '13px' }}
        >
          ← 돌아가기
        </button>

        {/* Progress */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            {['생년월일시 입력', '추가 정보 입력'].map((label, i) => (
              <span
                key={i}
                style={{
                  fontSize: '12px',
                  color: step === i + 1 ? 'var(--gold)' : 'var(--text-muted)',
                  fontWeight: step === i + 1 ? 700 : 400,
                }}
              >
                {i + 1}. {label}
              </span>
            ))}
          </div>
          <div className="score-bar">
            <motion.div
              className="score-bar-fill"
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <h1
          style={{
            fontSize: 'clamp(22px, 5vw, 30px)',
            fontWeight: 800,
            lineHeight: 1.3,
            marginBottom: '8px',
          }}
        >
          {step === 1 ? (
            <>
              <span className="gold-text">생년월일시</span>를 입력해주세요
            </>
          ) : (
            <>
              <span className="gold-text">추가 정보</span>를 입력해주세요
            </>
          )}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {step === 1
            ? '정확할수록 분석이 더 정밀해집니다'
            : '출생지와 MBTI를 입력하면 더 깊은 분석이 가능합니다'}
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '32px',
        }}
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Calendar Type */}
              <div style={rowStyle}>
                <label style={labelStyle}>양력 / 음력 *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { value: 'solar', label: '☀️ 양력' },
                    { value: 'lunar', label: '🌙 음력' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('calendarType', opt.value as 'solar' | 'lunar')}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: `1px solid ${form.calendarType === opt.value ? 'var(--gold)' : 'var(--border)'}`,
                        background: form.calendarType === opt.value ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                        color: form.calendarType === opt.value ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: form.calendarType === opt.value ? 700 : 400,
                        transition: 'all 0.2s',
                        fontFamily: 'Noto Sans KR, sans-serif',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Year */}
              <div style={rowStyle}>
                <label style={labelStyle}>출생 연도 *</label>
                <select
                  className="input-field"
                  value={form.birthYear}
                  onChange={(e) => set('birthYear', parseInt(e.target.value))}
                >
                  {genYears().map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>
              </div>

              {/* Month & Day */}
              <div style={{ ...rowStyle, ...gridStyle, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={labelStyle}>월 *</label>
                  <select
                    className="input-field"
                    value={form.birthMonth}
                    onChange={(e) => set('birthMonth', parseInt(e.target.value))}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}월
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>일 *</label>
                  <select
                    className="input-field"
                    value={form.birthDay}
                    onChange={(e) => set('birthDay', parseInt(e.target.value))}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}일
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hour */}
              <div style={rowStyle}>
                <label style={labelStyle}>출생 시각 (모르면 "모름" 선택)</label>
                <select
                  className="input-field"
                  value={form.birthHour}
                  onChange={(e) => set('birthHour', parseInt(e.target.value))}
                >
                  <option value={-1}>🕐 모름</option>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}시 ({h < 12 ? '오전' : '오후'} {h === 0 ? 12 : h > 12 ? h - 12 : h}시)
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  출생 시각을 알면 사주 분석이 더욱 정확해집니다
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Birth Place */}
              <div style={rowStyle}>
                <label style={labelStyle}>출생지</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="예: 서울, 부산, 대구..."
                  value={form.birthPlace}
                  onChange={(e) => set('birthPlace', e.target.value)}
                />
              </div>

              {/* Gender */}
              <div style={rowStyle}>
                <label style={labelStyle}>성별 *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { value: 'male', label: '👨 남성' },
                    { value: 'female', label: '👩 여성' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('gender', opt.value as 'male' | 'female')}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: `1px solid ${form.gender === opt.value ? 'var(--gold)' : 'var(--border)'}`,
                        background:
                          form.gender === opt.value
                            ? 'rgba(212,175,55,0.1)'
                            : 'rgba(255,255,255,0.02)',
                        color: form.gender === opt.value ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: form.gender === opt.value ? 700 : 400,
                        transition: 'all 0.2s',
                        fontFamily: 'Noto Sans KR, sans-serif',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MBTI */}
              <div style={rowStyle}>
                <label style={labelStyle}>MBTI</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  {MBTI_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('mbti', type)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: `1px solid ${form.mbti === type ? 'var(--gold)' : 'var(--border)'}`,
                        background:
                          form.mbti === type
                            ? 'rgba(212,175,55,0.12)'
                            : 'rgba(255,255,255,0.02)',
                        color: form.mbti === type ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: form.mbti === type ? 700 : 400,
                        transition: 'all 0.15s',
                        fontFamily: 'Noto Sans KR, sans-serif',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => set('mbti', '모름')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${form.mbti === '모름' ? 'var(--gold)' : 'var(--border)'}`,
                    background:
                      form.mbti === '모름'
                        ? 'rgba(212,175,55,0.12)'
                        : 'rgba(255,255,255,0.02)',
                    color: form.mbti === '모름' ? 'var(--gold)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s',
                    fontFamily: 'Noto Sans KR, sans-serif',
                  }}
                >
                  잘 모르겠어요
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          {step === 2 && (
            <button
              className="btn-secondary"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
            >
              ← 이전
            </button>
          )}
          {step === 1 ? (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!isStep1Valid}
              style={{ flex: 1 }}
            >
              다음 →
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              style={{ flex: 2 }}
            >
              ⚔️ 분석 시작하기
            </button>
          )}
        </div>
      </div>

      {/* Privacy note */}
      <p
        style={{
          marginTop: '24px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        입력하신 정보는 AI 분석에만 사용되며 저장되지 않습니다.
      </p>
    </div>
  );
}
