import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult, UserInput } from '../../types';
import GoldenYearsChart from '../charts/GoldenYearsChart';
import LifeCycleChart from '../charts/LifeCycleChart';
import SeasonCard from './SeasonCard';
import SharpFeedback from './SharpFeedback';
import MBTICard from './MBTICard';
import YearlyStrategy from './YearlyStrategy';
import SeasonCycle from './SeasonCycle';
import SeasonGuidance from './SeasonGuidance';
import NetworkingGuide from './NetworkingGuide';
import GrowthMissions from './GrowthMissions';

interface Props {
  result: AnalysisResult;
  userInput: UserInput;
  onReset: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '17px',
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {children}
    </h2>
  );
}

function SectionDivider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '8px 0',
      }}
    />
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ResultDashboard({ result, userInput, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const age = new Date().getFullYear() - userInput.birthYear;
  const peakYear = result.top5_golden_years?.length
    ? [...result.top5_golden_years].sort((a, b) => b.score - a.score)[0].year
    : new Date().getFullYear();

  const calLabel = userInput.calendarType === 'lunar' ? '음력' : '양력';

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 0 80px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(212,175,55,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '40px 24px 32px',
          textAlign: 'center',
          marginBottom: '40px',
        }}
      >
        <motion.p
          {...fadeUp}
          style={{ fontSize: '11px', letterSpacing: '4px', color: 'var(--gold)', marginBottom: '12px' }}
        >
          AI 책사 분석 완료
        </motion.p>
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, marginBottom: '8px' }}
        >
          {userInput.birthYear}년생 ({calLabel}){' '}
          <span className="gold-text">{age}세의 커리어 전략</span>
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: '14px', color: 'var(--text-muted)' }}
        >
          사주 · 점성술 · 수비학 종합 분석
        </motion.p>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gap: '36px',
        }}
      >
        {/* ── 1. 책사의 한마디 ─────────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <SharpFeedback feedback={result.sharp_feedback} />
        </motion.section>

        <SectionDivider />

        {/* ── 2. 현재 커리어 계절 ───────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
          <SectionTitle>🌸 현재 커리어 계절</SectionTitle>
          <SeasonCard season={result.current_season} details={result.season_details} />
        </motion.section>

        {/* ── 3. 12년 계절 주기 (Phase 2) ──────────────── */}
        {result.season_cycle?.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <SectionTitle>🔄 커리어 12년 주기</SectionTitle>
            <SeasonCycle cycle={result.season_cycle} peakYear={peakYear} />
          </motion.section>
        )}

        {/* ── 4. 계절 심층 가이드 (Phase 2) ────────────── */}
        {result.season_guidance && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }}>
            <SectionTitle>📖 계절별 심층 가이드</SectionTitle>
            <SeasonGuidance guidance={result.season_guidance} season={result.current_season} />
          </motion.section>
        )}

        <SectionDivider />

        {/* ── 5. 전성기 Top 5 ───────────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
          <SectionTitle>🏆 전성기 Top 5</SectionTitle>
          <div className="card">
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              커리어 정점이 될 연도 Top 5 (점수 기준 시각화)
            </p>
            <GoldenYearsChart data={result.top5_golden_years} />
            <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
              {[...result.top5_golden_years]
                .sort((a, b) => b.score - a.score)
                .map((y, i) => (
                  <div key={y.year} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: i === 0 ? '#D4AF37' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: i < 3 ? '#000' : 'var(--text-muted)',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>
                        {y.year}년
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {y.score}점
                      </span>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.5 }}>
                        {y.reason}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.section>

        {/* ── 6. 생애 주기 그래프 ──────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.35 }}>
          <SectionTitle>📊 생애 주기 운 그래프</SectionTitle>
          <div className="card">
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              10년 단위 커리어 기회/위기 점수
            </p>
            <LifeCycleChart data={result.life_cycle_scores} currentAge={age} />
            <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
              {result.life_cycle_scores.map((l) => (
                <div key={l.age_range} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', minWidth: '40px', marginTop: '2px' }}>
                    {l.age_range}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div className="score-bar" style={{ flex: 1 }}>
                        <div className="score-bar-fill" style={{ width: `${l.score}%` }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '30px' }}>{l.score}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{l.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <SectionDivider />

        {/* ── 7. 올해 분기별 전략 ──────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
          <SectionTitle>📅 올해 분기별 전략</SectionTitle>
          <YearlyStrategy data={result.yearly_strategy} />
        </motion.section>

        {/* ── 8. 성장 미션 3종 (Phase 2) ───────────────── */}
        {result.growth_missions?.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.42 }}>
            <SectionTitle>🚀 성장 미션 3종</SectionTitle>
            <GrowthMissions missions={result.growth_missions} />
          </motion.section>
        )}

        <SectionDivider />

        {/* ── 9. 네트워킹 가이드 (Phase 2) ─────────────── */}
        {result.networking_guide && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.45 }}>
            <SectionTitle>🤝 지금 만나야 할 사람</SectionTitle>
            <NetworkingGuide guide={result.networking_guide} season={result.current_season} />
          </motion.section>
        )}

        {/* ── 10. MBTI 시너지 ───────────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.48 }}>
          <SectionTitle>🧠 MBTI 시너지 분석</SectionTitle>
          <MBTICard data={result.mbti_integration} />
        </motion.section>

        {/* ── Action Buttons ────────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}
        >
          <button
            className="btn-primary"
            onClick={handleShare}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {copied ? '✓ 링크가 복사되었습니다!' : '🔗 결과 공유하기'}
          </button>
          <button className="btn-secondary" onClick={onReset} style={{ width: '100%' }}>
            ↩ 처음부터 다시 분석하기
          </button>
        </motion.div>

        {/* Disclaimer */}
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          본 분석은 AI가 사주·점성술·수비학을 기반으로 생성한 참고 자료입니다.
          <br />
          중요한 결정은 반드시 전문가와 상담하세요.
        </p>
      </div>
    </div>
  );
}
