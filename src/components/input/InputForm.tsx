import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserInput } from '../../types';
import { useLang } from '../../i18n';

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

const TOTAL_STEPS = 3;

export default function InputForm({ onSubmit, onBack }: InputFormProps) {
  const { t, lang } = useLang();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<Partial<UserInput>>({
    birthYear: 1990,
    birthMonth: 1,
    birthDay: 1,
    birthHour: -1,
    calendarType: 'solar',
    birthPlace: '',
    mbti: '모름',
    gender: 'male',
    specialty: '',
    currentSituation: '',
  });

  const set = (key: keyof UserInput, value: UserInput[keyof UserInput]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
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
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.3px',
    fontWeight: 500,
  };

  const rowStyle: React.CSSProperties = {
    marginBottom: '22px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 80px',
      }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '560px', marginBottom: '32px' }}>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{ marginBottom: '28px', padding: '8px 16px', fontSize: '13px' }}
        >
          ← {t.input.backBtn}
        </button>

        {/* Step indicator — numbered circles */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              marginBottom: '12px',
            }}
          >
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const isActive = step === i + 1;
              const isDone = step > i + 1;
              return (
                <div
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', flex: i < TOTAL_STEPS - 1 ? 1 : 0 }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isActive
                        ? 'linear-gradient(135deg, #C9A227, #D4AF37)'
                        : isDone
                        ? 'rgba(212,175,55,0.2)'
                        : 'rgba(255,255,255,0.05)',
                      border: isActive
                        ? 'none'
                        : isDone
                        ? '1px solid rgba(212,175,55,0.4)'
                        : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isActive ? '#080808' : isDone ? 'var(--gold)' : 'var(--text-muted)',
                      flexShrink: 0,
                      boxShadow: isActive ? '0 4px 16px rgba(212,175,55,0.3)' : 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  {i < TOTAL_STEPS - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        background: isDone
                          ? 'rgba(212,175,55,0.4)'
                          : 'var(--border)',
                        margin: '0 4px',
                        borderRadius: '1px',
                        transition: 'background 0.3s',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            {step} / {TOTAL_STEPS} 단계
          </p>
        </div>

        <h1
          style={{
            fontSize: 'clamp(22px, 5vw, 28px)',
            fontWeight: 800,
            lineHeight: 1.3,
            marginBottom: '6px',
          }}
        >
          {step === 1 ? (
            <span className="gold-text">{t.input.step1Title}</span>
          ) : step === 2 ? (
            <span className="gold-text">{t.input.step2Title}</span>
          ) : (
            <span className="gold-text">
              {lang === 'ko' ? '커리어 맥락' : 'Career Context'}
            </span>
          )}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {step === 1
            ? (lang === 'ko' ? '정확할수록 분석이 더 정밀해집니다' : 'More precise input = more accurate analysis')
            : step === 2
            ? (lang === 'ko' ? '출생지와 MBTI로 더 깊은 분석이 가능합니다' : 'Birthplace and MBTI enable deeper analysis')
            : (lang === 'ko'
                ? '전문 분야와 현재 상황을 알려주면 맞춤형 성장 전략이 나옵니다'
                : 'Share your field and situation for tailored growth guidance')}
        </p>
      </div>

      {/* Form card */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--card)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
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
                <label style={labelStyle as React.CSSProperties}>
                  <span>🗓</span> {t.input.calendarLabel} *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { value: 'solar', label: `☀️ ${t.input.solar}` },
                    { value: 'lunar', label: `🌙 ${t.input.lunar}` },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('calendarType', opt.value as 'solar' | 'lunar')}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: `1px solid ${form.calendarType === opt.value ? 'var(--gold)' : 'var(--border)'}`,
                        background: form.calendarType === opt.value
                          ? 'rgba(212,175,55,0.12)'
                          : 'rgba(255,255,255,0.02)',
                        color: form.calendarType === opt.value ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: form.calendarType === opt.value ? 700 : 400,
                        transition: 'all 0.2s',
                        fontFamily: 'Noto Sans KR, sans-serif',
                        boxShadow: form.calendarType === opt.value ? '0 0 12px rgba(212,175,55,0.12)' : 'none',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Year */}
              <div style={rowStyle}>
                <label style={labelStyle as React.CSSProperties}>
                  <span>📅</span> {t.input.yearLabel} *
                </label>
                <select
                  className="input-field"
                  value={form.birthYear}
                  onChange={(e) => set('birthYear', parseInt(e.target.value))}
                >
                  {genYears().map((y) => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>

              {/* Month & Day */}
              <div style={{ ...rowStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle as React.CSSProperties}>
                    <span>📆</span> {t.input.monthLabel} *
                  </label>
                  <select
                    className="input-field"
                    value={form.birthMonth}
                    onChange={(e) => set('birthMonth', parseInt(e.target.value))}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {lang === 'ko' ? `${m}월` : m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle as React.CSSProperties}>
                    <span>📆</span> {t.input.dayLabel} *
                  </label>
                  <select
                    className="input-field"
                    value={form.birthDay}
                    onChange={(e) => set('birthDay', parseInt(e.target.value))}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {lang === 'ko' ? `${d}일` : d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hour */}
              <div style={rowStyle}>
                <label style={labelStyle as React.CSSProperties}>
                  <span>🕐</span> {t.input.hourLabel}
                </label>
                <select
                  className="input-field"
                  value={form.birthHour}
                  onChange={(e) => set('birthHour', parseInt(e.target.value))}
                >
                  <option value={-1}>{t.input.hourUnknown}</option>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {lang === 'ko'
                        ? `${h}시 (${h < 12 ? '오전' : '오후'} ${h === 0 ? 12 : h > 12 ? h - 12 : h}시)`
                        : `${h}:00 (${h < 12 ? 'AM' : 'PM'} ${h === 0 ? 12 : h > 12 ? h - 12 : h})`}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                  {lang === 'ko' ? '출생 시각을 알면 사주 분석이 더욱 정확해집니다' : 'Knowing your birth hour improves analysis accuracy'}
                </p>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Birth Place */}
              <div style={rowStyle}>
                <label style={labelStyle as React.CSSProperties}>
                  <span>📍</span> {t.input.birthPlaceLabel}
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder={t.input.birthPlacePlaceholder}
                  value={form.birthPlace}
                  onChange={(e) => set('birthPlace', e.target.value)}
                />
              </div>

              {/* Gender */}
              <div style={rowStyle}>
                <label style={labelStyle as React.CSSProperties}>
                  <span>👤</span> {t.input.genderLabel} *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { value: 'male', label: `👨 ${t.input.male}` },
                    { value: 'female', label: `👩 ${t.input.female}` },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('gender', opt.value as 'male' | 'female')}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: `1px solid ${form.gender === opt.value ? 'var(--gold)' : 'var(--border)'}`,
                        background: form.gender === opt.value
                          ? 'rgba(212,175,55,0.12)'
                          : 'rgba(255,255,255,0.02)',
                        color: form.gender === opt.value ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: form.gender === opt.value ? 700 : 400,
                        transition: 'all 0.2s',
                        fontFamily: 'Noto Sans KR, sans-serif',
                        boxShadow: form.gender === opt.value ? '0 0 12px rgba(212,175,55,0.12)' : 'none',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MBTI */}
              <div style={rowStyle}>
                <label style={labelStyle as React.CSSProperties}>
                  <span>🧠</span> {t.input.mbtiLabel}
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '7px',
                    marginBottom: '8px',
                  }}
                >
                  {MBTI_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('mbti', type)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: `1px solid ${form.mbti === type ? 'var(--gold)' : 'var(--border)'}`,
                        background: form.mbti === type
                          ? 'rgba(212,175,55,0.12)'
                          : 'rgba(255,255,255,0.02)',
                        color: form.mbti === type ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: form.mbti === type ? 700 : 400,
                        transition: 'all 0.15s',
                        fontFamily: 'Noto Sans KR, sans-serif',
                        minHeight: '44px',
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
                    background: form.mbti === '모름'
                      ? 'rgba(212,175,55,0.12)'
                      : 'rgba(255,255,255,0.02)',
                    color: form.mbti === '모름' ? 'var(--gold)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s',
                    fontFamily: 'Noto Sans KR, sans-serif',
                  }}
                >
                  {t.input.mbtiUnknown}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Specialty */}
              <div style={rowStyle}>
                <label style={labelStyle as React.CSSProperties}>
                  <span>💼</span> {lang === 'ko' ? '전문 분야' : 'Specialty / Field'}
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder={lang === 'ko'
                    ? '예: UX 디자이너 5년차, 백엔드 개발, 콘텐츠 마케팅'
                    : 'e.g., UX designer 5yr, backend dev, content marketing'}
                  value={form.specialty ?? ''}
                  onChange={(e) => set('specialty', e.target.value)}
                  maxLength={80}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                  {lang === 'ko'
                    ? '전문 분야를 알려주면 그 분야에서의 성장 전략과 네트워킹 조언이 나옵니다'
                    : 'Sharing your field enables targeted growth and networking guidance'}
                </p>
              </div>

              {/* Current Situation */}
              <div style={rowStyle}>
                <label style={labelStyle as React.CSSProperties}>
                  <span>📝</span> {lang === 'ko' ? '현재 상황' : 'Current Situation'}
                </label>
                <textarea
                  className="input-field"
                  placeholder={lang === 'ko'
                    ? '예: 스타트업 이직 준비 중, 팀장 승진 후 번아웃, 프리랜서 전환 고민'
                    : 'e.g., preparing job change, post-promotion burnout, considering freelance'}
                  value={form.currentSituation ?? ''}
                  onChange={(e) => set('currentSituation', e.target.value)}
                  rows={3}
                  maxLength={200}
                  style={{ resize: 'vertical', minHeight: '80px', fontFamily: 'Noto Sans KR, sans-serif' }}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                  {lang === 'ko'
                    ? '지금 처한 상황을 구체적으로 쓸수록 맞춤 조언이 나옵니다 (선택)'
                    : 'The more specific, the more tailored the advice (optional)'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          {step > 1 && (
            <button
              className="btn-secondary"
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              style={{ flex: 1 }}
            >
              ← {t.input.backBtn}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={step === 1 && !isStep1Valid}
              style={{ flex: step > 1 ? 2 : 1, fontSize: '16px' }}
            >
              {t.input.nextBtn} →
            </button>
          ) : (
            <motion.button
              className="btn-primary"
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 2,
                fontSize: '17px',
                padding: '18px 24px',
                boxShadow: '0 6px 28px rgba(212,175,55,0.35)',
              }}
            >
              ✦ {t.input.analyzeBtn}
            </motion.button>
          )}
        </div>
      </div>

      {/* Privacy note */}
      <p
        style={{
          marginTop: '20px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        🔒 입력하신 정보는 AI 분석에만 사용되며 저장되지 않습니다.
      </p>
    </div>
  );
}
