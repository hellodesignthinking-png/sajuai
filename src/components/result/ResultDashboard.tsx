import { useEffect, useState } from 'react';
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
import SajuDetail from './SajuDetail';
import SeasonReasoning from './SeasonReasoning';
import VirtueChallenge from '../social/VirtueChallenge';
import ShareSection from '../social/ShareSection';
import PaywallOverlay from '../payment/PaywallOverlay';
import PricingCard from '../payment/PricingCard';
import { useAuth } from '../../contexts/AuthContext';
import { saveResult } from '../../services/storage';

interface Props {
  result: AnalysisResult;
  userInput: UserInput;
  onReset: () => void;
  onOpenAuth: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '18px',
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

export default function ResultDashboard({ result, userInput, onReset, onOpenAuth }: Props) {
  const { user } = useAuth();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const age = new Date().getFullYear() - userInput.birthYear;
  const sortedYears = [...(result.top5_golden_years ?? [])].sort((a, b) => b.score - a.score);
  const topYear = sortedYears[0];
  const peakYear = topYear?.year ?? new Date().getFullYear();
  const calLabel = userInput.calendarType === 'lunar' ? '음력' : '양력';

  const handleSave = async () => {
    if (!user) { onOpenAuth(); return; }
    setSaveState('saving');
    setSaveError(null);
    const { error } = await saveResult(userInput, result);
    if (error) { setSaveState('error'); setSaveError(error); }
    else setSaveState('saved');
  };

  // Save result to sessionStorage so it can be restored after Toss payment redirect
  useEffect(() => {
    try {
      sessionStorage.setItem('sajuai_result', JSON.stringify(result));
      sessionStorage.setItem('sajuai_user_input', JSON.stringify(userInput));
    } catch {
      // sessionStorage not available
    }
  }, [result, userInput]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 0 80px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(212,175,55,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '32px 16px 24px',
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
          padding: '0 16px',
          display: 'grid',
          gap: '32px',
        }}
      >
        {/* ── FREE: 1. 책사의 한마디 ─────────────────────── */}
        {result.sharp_feedback && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <SharpFeedback feedback={result.sharp_feedback} />
          </motion.section>
        )}

        <SectionDivider />

        {/* ── FREE: 2. 현재 커리어 계절 ───────────────────── */}
        {result.current_season && result.season_details && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
            <SectionTitle>🌸 현재 커리어 계절</SectionTitle>
            <SeasonCard season={result.current_season} details={result.season_details} />
          </motion.section>
        )}

        {/* ── FREE: 3. 전성기 #1 티저 ─────────────────────── */}
        {topYear && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <SectionTitle>🏆 나의 최고 전성기</SectionTitle>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold) 0%, #b8882a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}
                >
                  👑
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    커리어 최정점 해
                  </p>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>
                    {topYear.year}년
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {topYear.reason}
                  </p>
                </div>
              </div>
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  background: 'rgba(212,175,55,0.06)',
                  borderRadius: '10px',
                  border: '1px solid rgba(212,175,55,0.15)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                🔒 Top 2~5 전성기 + 상세 분석은 프리미엄에서 확인하세요
              </div>
            </div>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── PRICING CTA ─────────────────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }}>
          <PricingCard />
        </motion.section>

        {/* ── PREMIUM: P1. 사주 팔자 상세 분석 ───────────── */}
        {result.saju_detail && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.28 }}>
            <SectionTitle>☯ 사주 팔자 상세 분석</SectionTitle>
            <PaywallOverlay>
              <SajuDetail data={result.saju_detail} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: P2. 커리어 계절의 근거 ─────────────── */}
        {result.season_reasoning && result.current_season && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.29 }}>
            <SectionTitle>🔍 왜 지금이 이 계절인가</SectionTitle>
            <PaywallOverlay>
              <SeasonReasoning data={result.season_reasoning} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 4. 전성기 Top 5 전체 ───────────────── */}
        {sortedYears.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <SectionTitle>🏆 전성기 Top 5 상세 분석</SectionTitle>
            <PaywallOverlay>
              <div className="card">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  커리어 정점이 될 연도 Top 5 (점수 기준 시각화)
                </p>
                <GoldenYearsChart data={result.top5_golden_years || []} />
                <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
                  {sortedYears.map((y, i) => (
                    <div key={y.year} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background:
                            i === 0 ? '#D4AF37' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--border)',
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
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: i === 0 ? 'var(--gold)' : 'var(--text)',
                          }}
                        >
                          {y.year}년
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          {y.score}점
                        </span>
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                            lineHeight: 1.5,
                          }}
                        >
                          {y.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 5. 생애 주기 그래프 ────────────────── */}
        {(result.life_cycle_scores ?? []).length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.32 }}>
            <SectionTitle>📊 생애 주기 운 그래프</SectionTitle>
            <PaywallOverlay>
              <div className="card">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  10년 단위 커리어 기회/위기 점수
                </p>
                <LifeCycleChart data={result.life_cycle_scores || []} currentAge={age} />
                <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
                  {(result.life_cycle_scores ?? []).map((l) => (
                    <div key={l.age_range} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--gold)',
                          minWidth: '40px',
                          marginTop: '2px',
                        }}
                      >
                        {l.age_range}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div className="score-bar" style={{ flex: 1 }}>
                            <div className="score-bar-fill" style={{ width: `${l.score}%` }} />
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '30px' }}>
                            {l.score}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {l.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 6. 12년 계절 주기 ──────────────────── */}
        {result.season_cycle?.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.34 }}>
            <SectionTitle>🔄 커리어 12년 주기</SectionTitle>
            <PaywallOverlay>
              <SeasonCycle cycle={result.season_cycle} peakYear={peakYear} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 7. 계절 심층 가이드 ────────────────── */}
        {result.season_guidance && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.36 }}>
            <SectionTitle>📖 계절별 심층 가이드</SectionTitle>
            <PaywallOverlay>
              <SeasonGuidance guidance={result.season_guidance} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── PREMIUM: 8. 올해 분기별 전략 ────────────────── */}
        {result.yearly_strategy && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.38 }}>
            <SectionTitle>📅 올해 분기별 전략</SectionTitle>
            <PaywallOverlay>
              <YearlyStrategy data={result.yearly_strategy} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 9. 성장 미션 3종 ───────────────────── */}
        {result.growth_missions?.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
            <SectionTitle>🚀 성장 미션 3종</SectionTitle>
            <PaywallOverlay>
              <GrowthMissions missions={result.growth_missions} />
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── PREMIUM: 10. 네트워킹 가이드 ────────────────── */}
        {result.networking_guide && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.42 }}>
            <SectionTitle>🤝 지금 만나야 할 사람</SectionTitle>
            <PaywallOverlay>
              <NetworkingGuide guide={result.networking_guide} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 11. MBTI 시너지 ─────────────────────── */}
        {result.mbti_integration && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.44 }}>
            <SectionTitle>🧠 MBTI 시너지 분석</SectionTitle>
            <PaywallOverlay>
              <MBTICard data={result.mbti_integration} />
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── FREE: 12. 덕 쌓기 챌린지 ────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.48 }}>
          <SectionTitle>🌿 덕 쌓기 챌린지</SectionTitle>
          <VirtueChallenge />
        </motion.section>

        {/* ── FREE: 13. 공유 카드 ──────────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.5 }}>
          <SectionTitle>🔮 좋은 기운 나누기</SectionTitle>
          <ShareSection result={result} userInput={userInput} peakYear={peakYear} />
        </motion.section>

        {/* ── Save Result Button ─────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.50 }}
          style={{ paddingTop: '8px' }}
        >
          {saveState === 'saved' ? (
            <div style={{
              width: '100%', padding: '12px 0', textAlign: 'center',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '12px', fontSize: '14px', color: '#4ade80',
            }}>
              ✓ 결과가 저장되었습니다 (1년 보관)
            </div>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saveState === 'saving'}
                style={{
                  width: '100%', padding: '12px 0',
                  background: user
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))'
                    : 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                  color: 'var(--gold)', cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
                  opacity: saveState === 'saving' ? 0.7 : 1,
                }}
              >
                {saveState === 'saving' ? '저장 중...' : user ? '💾 결과 저장하기 (1년 보관)' : '🔐 로그인 후 결과 저장하기'}
              </button>
              {saveState === 'error' && saveError && (
                <p style={{ fontSize: '12px', color: '#f87171', textAlign: 'center', marginTop: '6px' }}>
                  {saveError}
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* ── Reset Button ──────────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.52 }}
          style={{ paddingTop: '8px' }}
        >
          <button className="btn-secondary" onClick={onReset} style={{ width: '100%' }}>
            ↩ 처음부터 다시 분석하기
          </button>
        </motion.div>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          본 분석은 AI가 사주·점성술·수비학을 기반으로 생성한 참고 자료입니다.
          <br />
          중요한 결정은 반드시 전문가와 상담하세요.
        </p>
      </div>
    </div>
  );
}
