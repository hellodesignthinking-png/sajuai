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

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
      }}
    >
      {icon && (
        <span
          style={{
            fontSize: '20px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(212,175,55,0.08)',
            borderRadius: '10px',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--text)',
          flex: 1,
          letterSpacing: '-0.2px',
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: '1px',
          flex: 1,
          background: 'linear-gradient(90deg, rgba(212,175,55,0.25), transparent)',
        }}
      />
    </div>
  );
}

function SectionDivider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '4px 0',
        color: 'rgba(212,175,55,0.2)',
        fontSize: '12px',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)' }} />
      <span>◆</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.15), transparent)' }} />
    </div>
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
          background: 'linear-gradient(180deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.03) 60%, transparent 100%)',
          borderBottom: '1px solid rgba(212,175,55,0.12)',
          padding: '36px 16px 28px',
          textAlign: 'center',
          marginBottom: '44px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          }}
        />
        <motion.p
          {...fadeUp}
          style={{ fontSize: '11px', letterSpacing: '4px', color: 'var(--gold)', marginBottom: '12px', fontWeight: 600 }}
        >
          ✦ AI 책사 분석 완료
        </motion.p>
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: 'clamp(22px, 5vw, 34px)', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.5px' }}
        >
          {userInput.birthYear}년생 ({calLabel}){' '}
          <span className="gold-text">{age}세의 커리어 전략</span>
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}
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
          gap: '36px',
        }}
      >
        {/* ── FREE: 0-1. 사주 총평 ─────────────────────────── */}
        {result.saju_summary && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }}>
            <SectionTitle icon="📜">사주 총평</SectionTitle>
            <div
              style={{
                background: 'linear-gradient(135deg, #0f0e0a 0%, #1a1400 100%)',
                border: '1px solid rgba(212,175,55,0.35)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
              }}
            >
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.9,
                  color: 'var(--text)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {result.saju_summary}
              </p>
            </div>
          </motion.section>
        )}

        {result.saju_summary && <SectionDivider />}

        {/* ── FREE: 0-2. 올해 운세 ─────────────────────────── */}
        {result.yearly_fortune && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.08 }}>
            <SectionTitle icon="🌟">올해 운세</SectionTitle>
            <div
              style={{
                background: 'linear-gradient(135deg, #0a0f10 0%, #001a14 100%)',
                border: '1px solid rgba(212,175,55,0.35)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
              }}
            >
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.9,
                  color: 'var(--text)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {result.yearly_fortune}
              </p>
            </div>
          </motion.section>
        )}

        {result.yearly_fortune && <SectionDivider />}

        {/* ── FREE: 1. 책사의 한마디 ─────────────────────── */}
        {result.sharp_feedback && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <SectionTitle icon="🔮">책사의 한마디</SectionTitle>
            <SharpFeedback feedback={result.sharp_feedback} />
          </motion.section>
        )}

        <SectionDivider />

        {/* ── FREE: 2. 현재 커리어 계절 ───────────────────── */}
        {result.current_season && result.season_details && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
            <SectionTitle icon="🌸">현재 커리어 계절</SectionTitle>
            <SeasonCard season={result.current_season} details={result.season_details} />
          </motion.section>
        )}

        {/* ── FREE: 3. 전성기 #1 티저 ─────────────────────── */}
        {topYear && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <SectionTitle icon="🏆">나의 최고 전성기</SectionTitle>
            <div
              style={{
                background: 'linear-gradient(135deg, #0f0e0a 0%, #1a1500 100%)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #b8882a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(212,175,55,0.3)',
                  }}
                >
                  👑
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.6)', marginBottom: '4px', letterSpacing: '1px' }}>
                    커리어 최정점 해
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>
                    {topYear.year}년
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }}>
                    {topYear.reason}
                  </p>
                </div>
              </div>
              <div
                style={{
                  marginTop: '18px',
                  padding: '12px 16px',
                  background: 'rgba(212,175,55,0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(212,175,55,0.12)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🔒 <span>Top 2~5 전성기 + 상세 분석은 프리미엄에서 확인하세요</span>
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
            <SectionTitle icon="☯">사주 팔자 상세 분석</SectionTitle>
            <PaywallOverlay>
              <SajuDetail data={result.saju_detail} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: P2. 커리어 계절의 근거 ─────────────── */}
        {result.season_reasoning && result.current_season && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.29 }}>
            <SectionTitle icon="🔍">왜 지금이 이 계절인가</SectionTitle>
            <PaywallOverlay>
              <SeasonReasoning data={result.season_reasoning} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 4. 전성기 Top 5 전체 ───────────────── */}
        {sortedYears.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <SectionTitle icon="🏆">전성기 Top 5 상세 분석</SectionTitle>
            <PaywallOverlay>
              <div className="card-gold">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  커리어 정점이 될 연도 Top 5 (점수 기준 시각화)
                </p>
                <GoldenYearsChart data={result.top5_golden_years || []} />
                <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                  {sortedYears.map((y, i) => (
                    <div key={y.year} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background:
                            i === 0 ? 'linear-gradient(135deg,#D4AF37,#b8882a)'
                            : i === 1 ? '#888'
                            : i === 2 ? '#a0522d'
                            : 'var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: i < 3 ? '#000' : 'var(--text-muted)',
                          flexShrink: 0,
                          marginTop: '2px',
                          boxShadow: i === 0 ? '0 2px 8px rgba(212,175,55,0.4)' : 'none',
                        }}
                      >
                        {i + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>
                            {y.year}년
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'rgba(212,175,55,0.7)',
                              background: 'rgba(212,175,55,0.08)',
                              padding: '1px 8px',
                              borderRadius: '10px',
                              border: '1px solid rgba(212,175,55,0.15)',
                            }}
                          >
                            {y.score}점
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
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
            <SectionTitle icon="📊">생애 주기 운 그래프</SectionTitle>
            <PaywallOverlay>
              <div className="card-gold">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  10년 단위 커리어 기회/위기 점수
                </p>
                <LifeCycleChart data={result.life_cycle_scores || []} currentAge={age} />
                <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                  {(result.life_cycle_scores ?? []).map((l) => (
                    <div key={l.age_range} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--gold)',
                          minWidth: '40px',
                          marginTop: '3px',
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
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
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
            <SectionTitle icon="🔄">커리어 12년 주기</SectionTitle>
            <PaywallOverlay>
              <SeasonCycle cycle={result.season_cycle} peakYear={peakYear} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 7. 계절 심층 가이드 ────────────────── */}
        {result.season_guidance && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.36 }}>
            <SectionTitle icon="📖">계절별 심층 가이드</SectionTitle>
            <PaywallOverlay>
              <SeasonGuidance guidance={result.season_guidance} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── PREMIUM: 8. 올해 분기별 전략 ────────────────── */}
        {result.yearly_strategy && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.38 }}>
            <SectionTitle icon="📅">올해 분기별 전략</SectionTitle>
            <PaywallOverlay>
              <YearlyStrategy data={result.yearly_strategy} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 9. 성장 미션 3종 ───────────────────── */}
        {result.growth_missions?.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
            <SectionTitle icon="🚀">성장 미션 3종</SectionTitle>
            <PaywallOverlay>
              <GrowthMissions missions={result.growth_missions} />
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── PREMIUM: 10. 네트워킹 가이드 ────────────────── */}
        {result.networking_guide && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.42 }}>
            <SectionTitle icon="🤝">지금 만나야 할 사람</SectionTitle>
            <PaywallOverlay>
              <NetworkingGuide guide={result.networking_guide} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 11. MBTI 시너지 ─────────────────────── */}
        {result.mbti_integration && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.44 }}>
            <SectionTitle icon="🧠">MBTI 시너지 분석</SectionTitle>
            <PaywallOverlay>
              <MBTICard data={result.mbti_integration} />
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── FREE: 12. 덕 쌓기 챌린지 ────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.48 }}>
          <SectionTitle icon="🌿">덕 쌓기 챌린지</SectionTitle>
          <VirtueChallenge />
        </motion.section>

        {/* ── FREE: 13. 공유 카드 ──────────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.5 }}>
          <SectionTitle icon="✨">좋은 기운 나누기</SectionTitle>
          <ShareSection result={result} userInput={userInput} peakYear={peakYear} />
        </motion.section>

        {/* ── Save Result Button ─────────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.50 }} style={{ paddingTop: '8px' }}>
          {saveState === 'saved' ? (
            <div style={{
              width: '100%', padding: '14px 0', textAlign: 'center',
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
                  width: '100%', padding: '14px 0',
                  background: user
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))'
                    : 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                  color: 'var(--gold)', cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
                  opacity: saveState === 'saving' ? 0.7 : 1,
                  transition: 'all 0.2s',
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
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.52 }}>
          <button className="btn-secondary" onClick={onReset} style={{ width: '100%' }}>
            ↩ 처음부터 다시 분석하기
          </button>
        </motion.div>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.7,
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
