import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from 'recharts';
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
import OracleChat from './OracleChat';
import VirtueChallenge from '../social/VirtueChallenge';
import ShareSection from '../social/ShareSection';
import PaywallOverlay from '../payment/PaywallOverlay';
import PricingCard from '../payment/PricingCard';
import { useAuth } from '../../contexts/AuthContext';
import { usePayment } from '../../contexts/PaymentContext';
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
  const { isTestMode, isPaid } = usePayment();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

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
        {(userInput.specialty || userInput.currentSituation) && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{
              marginTop: '18px',
              display: 'inline-flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '10px 16px',
              background: 'rgba(212,175,55,0.06)',
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              textAlign: 'left',
              maxWidth: '92%',
            }}
          >
            {userInput.specialty && (
              <div><span style={{ color: 'var(--gold)' }}>💼 전문 분야:</span> {userInput.specialty}</div>
            )}
            {userInput.currentSituation && (
              <div><span style={{ color: 'var(--gold)' }}>📝 현재 상황:</span> {userInput.currentSituation}</div>
            )}
          </motion.div>
        )}
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
        {/* ── FREE: 0-0. 내 사주 원국 (Foundation — 가장 먼저 노출) ── */}
        {result.saju_detail && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.03 }}>
            <SectionTitle icon="☯">내 사주 원국 · 四柱原局</SectionTitle>
            <div style={{
              marginBottom: '12px',
              padding: '12px 16px',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '12px',
            }}>
              💡 이것이 바로 <strong style={{ color: 'var(--text)' }}>당신의 사주 팔자(여덟 글자)</strong>입니다.
              일간(日干)은 당신의 본질, 천간·지지·지장간의 관계로 도출되는 <strong style={{ color: 'var(--text)' }}>십신(十神)</strong>이
              당신이 세상과 맺는 역할(재물·명예·인연·창의)을 결정합니다.
              아래 모든 해석은 이 원국에서 나왔습니다.
            </div>
            <SajuDetail data={result.saju_detail} />
          </motion.section>
        )}

        {result.saju_detail && <SectionDivider />}

        {/* ── FREE: 0-1. 사주 총평 ─────────────────────────── */}
        {result.saju_summary && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }}>
            <SectionTitle icon="📜">사주 총평 · 그래서 어떻게 해석되었나</SectionTitle>
            <div style={{
              marginBottom: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '12px',
            }}>
              🔮 위 원국 데이터를 AI 마스터 오라클이 읽고 해석한 종합 평가입니다. <strong style={{ color: 'var(--text)' }}>일간(Identity) × 격국(Career Type) × 대운(Season)</strong>을 상관 관계로 엮어 "당신이 어떤 사람인지"를 서술합니다.
            </div>
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

        {/* ── FREE: 0-1b. 격국 (사주 구조의 본질) ─────────────── */}
        {result.gyeokguk && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.06 }}>
            <SectionTitle icon="🏛">격국 — 사주 구조의 본질</SectionTitle>
            <div style={{
              marginBottom: '12px',
              padding: '12px 16px',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '12px',
            }}>
              💡 격국은 당신의 <strong style={{ color: 'var(--text)' }}>커리어 유형(Career Type)</strong>을 결정합니다. 일간이 "나는 누구인가"라면, 격국은 "나는 어떻게 일하는 사람인가"예요. 아래 격국명이 곧 당신의 일하는 스타일 · 성공 패턴의 뿌리입니다.
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #110e08 0%, #1d1608 100%)',
                border: '1px solid rgba(212,175,55,0.35)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'rgba(212,175,55,0.7)', marginBottom: '6px' }}>
                  THIS CHART'S STRUCTURAL NAME
                </p>
                <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--gold)', letterSpacing: '-0.3px' }}>
                  {result.gyeokguk.name}
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.55)', marginBottom: '6px', letterSpacing: '1px' }}>
                    판정 근거
                  </p>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {result.gyeokguk.reasoning}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.55)', marginBottom: '6px', letterSpacing: '1px' }}>
                    커리어 함의
                  </p>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {result.gyeokguk.implication}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {result.gyeokguk && <SectionDivider />}

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

        {/* ── FREE: 3b. 운명의 계절 · 전공/천직 ───────────────── */}
        {result.career_sync && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.23 }}>
            <SectionTitle icon="🍂">운명의 계절 · 전공 & 천직</SectionTitle>
            <div style={{
              marginBottom: '12px',
              padding: '12px 16px',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '12px',
            }}>
              💡 인생의 4계절(봄 씨앗 · 여름 성장 · 가을 수확 · 겨울 내실)은 대운의 흐름을 의미합니다. 지금 당신이 <strong style={{ color: 'var(--text)' }}>어느 계절에 있느냐</strong>에 따라 '확장할 때'인지 '수축할 때'인지가 갈려요. 아래 추천 전공·직업군은 당신의 오행과 십성에서 유도된 결과입니다.
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #0a1012 0%, #091618 100%)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
                display: 'grid',
                gap: '18px',
              }}
            >
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', letterSpacing: '2px', marginBottom: '6px' }}>
                  CURRENT SEASON
                </p>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)', marginBottom: '10px' }}>
                  {result.career_sync.season_label}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                  {result.career_sync.season_focus}
                </p>
              </div>

              {result.career_sync.recommended_majors?.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.55)', marginBottom: '8px', letterSpacing: '1px' }}>
                    추천 전공
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.career_sync.recommended_majors.map((m) => (
                      <span key={m} style={{
                        fontSize: '13px', color: 'var(--gold)',
                        padding: '6px 12px',
                        background: 'rgba(212,175,55,0.08)',
                        border: '1px solid rgba(212,175,55,0.25)',
                        borderRadius: '20px',
                      }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.career_sync.recommended_jobs?.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.55)', marginBottom: '8px', letterSpacing: '1px' }}>
                    추천 직업군
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.career_sync.recommended_jobs.map((j) => (
                      <span key={j} style={{
                        fontSize: '13px', color: 'var(--text)',
                        padding: '6px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                      }}>{j}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.55)', marginBottom: '6px', letterSpacing: '1px' }}>
                  추천 근거
                </p>
                <p style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                  {result.career_sync.reasoning}
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {result.career_sync && <SectionDivider />}

        {/* ── TEST-MODE BOUNDARY BANNER ────────────────────── */}
        {isTestMode && !isPaid && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="no-print"
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(184,136,42,0.06))',
              border: '1px dashed rgba(212,175,55,0.45)',
              fontSize: '13px',
              lineHeight: 1.7,
              color: 'var(--text)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--gold)' }}>
              <span style={{ fontSize: '14px' }}>🧪</span>
              테스트 모드 — 결제 없이 모든 프리미엄 섹션 공개 중
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              ⬆ 위 섹션까지는 <strong style={{ color: 'var(--text)' }}>무료(FREE)</strong> ·
              ⬇ 아래 💎 PREMIUM 뱃지가 붙은 섹션은 결제 출시 후 <strong style={{ color: 'var(--gold)' }}>유료 전환</strong>됩니다.
              카드 모듈 연결 후 <code style={{ fontSize: '11px', background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: '4px' }}>TEST_MODE_SHOW_ALL = false</code>로 전환하면 자동 게이팅 됩니다.
            </p>
          </motion.div>
        )}

        {/* ── PRICING CTA ─────────────────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }} className="no-print">
          <PricingCard />
        </motion.section>

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

        {/* ── PREMIUM: P3. 커리어 오각형 스탯 ──────────────── */}
        {result.career_pentagon && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.45 }}>
            <SectionTitle icon="⬟">커리어 오각형 스탯</SectionTitle>
            <PaywallOverlay>
              <div className="card-gold">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  일간·십성·오행을 조합해 도출한 커리어 역량 오각형
                </p>
                <div style={{ width: '100%', height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                      { subject: '리더십', A: result.career_pentagon.leadership },
                      { subject: '실행력', A: result.career_pentagon.execution },
                      { subject: '분석력', A: result.career_pentagon.analysis },
                      { subject: '창의성', A: result.career_pentagon.creativity },
                      { subject: '공감력', A: result.career_pentagon.empathy },
                    ]}>
                      <PolarGrid stroke="rgba(212,175,55,0.15)" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="stat"
                        dataKey="A"
                        stroke="#D4AF37"
                        strokeWidth={2}
                        fill="#D4AF37"
                        fillOpacity={0.35}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{
                  marginTop: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                }}>
                  <div>리더십<br/><strong style={{ color: 'var(--gold)' }}>{result.career_pentagon.leadership}</strong></div>
                  <div>실행력<br/><strong style={{ color: 'var(--gold)' }}>{result.career_pentagon.execution}</strong></div>
                  <div>분석력<br/><strong style={{ color: 'var(--gold)' }}>{result.career_pentagon.analysis}</strong></div>
                  <div>창의성<br/><strong style={{ color: 'var(--gold)' }}>{result.career_pentagon.creativity}</strong></div>
                  <div>공감력<br/><strong style={{ color: 'var(--gold)' }}>{result.career_pentagon.empathy}</strong></div>
                </div>
                {result.career_pentagon.notes && (
                  <p style={{
                    marginTop: '14px',
                    fontSize: '13px',
                    color: 'var(--text)',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {result.career_pentagon.notes}
                  </p>
                )}
              </div>
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: P4. 인간관계 코드 ─────────────────────── */}
        {result.relationship_code && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.46 }}>
            <SectionTitle icon="🧬">인간관계 코드</SectionTitle>
            <div style={{
              marginBottom: '12px',
              padding: '12px 16px',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '12px',
            }}>
              💡 사주의 <strong style={{ color: 'var(--text)' }}>십성(비겁 · 식상 · 재성 · 관성 · 인성)</strong>은 당신이 조직과 관계 속에서 자연스럽게 맡는 역할을 알려줍니다. 이 섹션은 당신이 빛나는 파트너 유형, 피해야 할 충돌 유형, 조직 내 정치력을 진단합니다.
            </div>
            <PaywallOverlay>
              <div className="card-gold" style={{ display: 'grid', gap: '16px' }}>
                {[
                  { label: '리더십 스타일', value: result.relationship_code.leadership_style, color: '#D4AF37' },
                  { label: '파트너십 스타일', value: result.relationship_code.partnership_style, color: '#b8882a' },
                  { label: '조직 내 처세', value: result.relationship_code.political_navigation, color: '#a0522d' },
                  { label: '십성 균형 진단', value: result.relationship_code.ten_gods_balance, color: '#D4AF37' },
                  { label: '시너지 내는 사람', value: result.relationship_code.synergy_people, color: '#4ade80' },
                  { label: '충돌하는 사람', value: result.relationship_code.friction_people, color: '#f87171' },
                ].map((r) => (
                  <div key={r.label} style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(212,175,55,0.12)',
                    borderLeft: `3px solid ${r.color}`,
                    borderRadius: '10px',
                  }}>
                    <p style={{
                      fontSize: '11px',
                      letterSpacing: '1px',
                      color: r.color,
                      marginBottom: '6px',
                      fontWeight: 700,
                    }}>
                      {r.label}
                    </p>
                    <p style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: P5. 생존 & 성장 전략 ──────────────────── */}
        {result.survival_strategy && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.47 }}>
            <SectionTitle icon="⚔️">생존 & 성장 전략</SectionTitle>
            <div style={{
              marginBottom: '12px',
              padding: '12px 16px',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '12px',
            }}>
              💡 "성공한다"가 아니라 "지금 이 계절에서 <strong style={{ color: 'var(--text)' }}>무엇을 버리고 무엇을 취할지</strong>"에 대한 Action Plan입니다. 용신(유리한 오행)과 연결된 습관은 취하고, 기신(불리한 오행)을 증폭하는 습관은 버리세요.
            </div>
            <PaywallOverlay>
              <div className="card-gold" style={{ display: 'grid', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{
                    padding: '14px',
                    background: 'rgba(239,68,68,0.05)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px',
                  }}>
                    <p style={{ fontSize: '11px', color: '#f87171', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>
                      🗑 버려야 할 습관
                    </p>
                    <ul style={{ paddingLeft: '18px', margin: 0, display: 'grid', gap: '6px' }}>
                      {(result.survival_strategy.habits_to_abandon ?? []).map((h, i) => (
                        <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text)' }}>{h}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{
                    padding: '14px',
                    background: 'rgba(74,222,128,0.05)',
                    border: '1px solid rgba(74,222,128,0.2)',
                    borderRadius: '10px',
                  }}>
                    <p style={{ fontSize: '11px', color: '#4ade80', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>
                      ⚡ 취해야 할 에너지
                    </p>
                    <ul style={{ paddingLeft: '18px', margin: 0, display: 'grid', gap: '6px' }}>
                      {(result.survival_strategy.energy_to_embrace ?? []).map((e, i) => (
                        <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text)' }}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {[
                  { label: '지금 당장 (이번 주)', value: result.survival_strategy.immediate_action },
                  { label: '90일 생존·성장 플랜', value: result.survival_strategy.ninety_day_plan },
                  { label: '1년 후 비전', value: result.survival_strategy.one_year_vision },
                ].map((r) => (
                  <div key={r.label} style={{
                    padding: '14px 16px',
                    background: 'rgba(212,175,55,0.04)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: '10px',
                  }}>
                    <p style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700, marginBottom: '6px', letterSpacing: '1px' }}>
                      {r.label}
                    </p>
                    <p style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
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

        {/* ── PDF Export (print to save as PDF) ────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.49 }} className="no-print">
          <button
            onClick={() => {
              document.title = `운명 보고서 — ${userInput.birthYear}년생`;
              setTimeout(() => window.print(), 50);
            }}
            style={{
              width: '100%',
              padding: '14px 0',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📄 운명 보고서 PDF로 저장
          </button>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
            브라우저 인쇄 창에서 "PDF로 저장"을 선택하세요
          </p>
        </motion.div>

        {/* ── Save Result Button ─────────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.50 }} className="no-print" style={{ paddingTop: '8px' }}>
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

        {/* ── Oracle Chat Button ─────────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.51 }} className="no-print">
          <button
            onClick={() => setChatOpen(true)}
            style={{
              width: '100%',
              padding: '14px 0',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(184,136,42,0.14))',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--gold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(212,175,55,0.15)',
              transition: 'all 0.2s',
            }}
          >
            🔮 마스터 오라클과 실시간 상담하기
          </button>
        </motion.div>

        {/* ── Reset Button ──────────────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.52 }} className="no-print">
          <button className="btn-secondary" onClick={onReset} style={{ width: '100%' }}>
            ↩ 처음부터 다시 분석하기
          </button>
        </motion.div>

        <OracleChat
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          result={result}
          userInput={userInput}
        />

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
