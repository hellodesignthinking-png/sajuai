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

// V65 Careet-style light palette — lime primary + editorial supporting accents.
type Accent = 'lime' | 'gold' | 'slate' | 'blue' | 'rose' | 'amber' | 'violet' | 'teal';
const ACCENTS: Record<Accent, { main: string; soft: string; ink: string }> = {
  lime:   { main: '#84cc16', soft: '#ecfccb', ink: '#3f6212' },
  gold:   { main: '#b8860b', soft: '#fef3c7', ink: '#78350f' },
  slate:  { main: '#64748b', soft: '#f1f5f9', ink: '#334155' },
  blue:   { main: '#3b82f6', soft: '#dbeafe', ink: '#1e40af' },
  rose:   { main: '#f43f5e', soft: '#ffe4e6', ink: '#9f1239' },
  amber:  { main: '#f59e0b', soft: '#fef3c7', ink: '#92400e' },
  violet: { main: '#8b5cf6', soft: '#ede9fe', ink: '#5b21b6' },
  teal:   { main: '#14b8a6', soft: '#ccfbf1', ink: '#115e59' },
};

function SectionTitle({ children, icon, accent = 'lime', kicker }: {
  children: React.ReactNode;
  icon?: string;
  accent?: Accent;
  kicker?: string;
}) {
  const a = ACCENTS[accent];
  return (
    <div style={{ marginBottom: '20px' }}>
      {kicker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{
            display: 'inline-block',
            width: '4px', height: '16px',
            background: a.main, borderRadius: '2px',
          }} />
          <span style={{
            fontSize: '11px',
            letterSpacing: '2.5px',
            color: a.ink,
            fontWeight: 800,
            textTransform: 'uppercase',
          }}>
            {kicker}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon && (
          <span style={{
            fontSize: '22px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: a.soft,
            borderRadius: '12px',
            flexShrink: 0,
          }}>
            {icon}
          </span>
        )}
        <h2 style={{
          fontSize: 'clamp(22px, 4.5vw, 26px)',
          fontWeight: 900,
          color: 'var(--text)',
          flex: 1,
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
        }}>
          {children}
        </h2>
      </div>
    </div>
  );
}

// Editorial white card — soft shadow, thin border, rounded corners.
function ThemeCard({ accent = 'lime', children, style }: {
  accent?: Accent;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const a = ACCENTS[accent];
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: 'var(--shadow)',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Top accent strip */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: a.main,
      }} />
      {children}
    </div>
  );
}

function WisdomBox({ accent = 'lime', children }: { accent?: Accent; children: React.ReactNode }) {
  const a = ACCENTS[accent];
  return (
    <div style={{
      marginBottom: '16px',
      padding: '14px 18px',
      fontSize: 'var(--fs-base, 15px)',
      lineHeight: 1.7,
      color: 'var(--text-secondary)',
      background: a.soft,
      borderLeft: `3px solid ${a.main}`,
      borderRadius: '8px',
    }}>
      {children}
    </div>
  );
}

function SectionDivider() {
  return (
    <div style={{
      height: '1px',
      background: 'var(--border)',
      margin: '4px 0',
    }} />
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
    <div style={{ minHeight: '100vh', padding: '0 0 80px' }}>
      {/* Hero Banner — V65 careet-style editorial header */}
      <div style={{
        position: 'relative',
        padding: '56px 16px 40px',
        textAlign: 'left',
        marginBottom: '40px',
        maxWidth: '720px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <motion.div
          {...fadeUp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            marginBottom: '20px',
            background: '#ecfccb',
            border: '1px solid #84cc16',
            borderRadius: '999px',
            fontSize: '11px',
            letterSpacing: '2px',
            fontWeight: 800,
            color: '#3f6212',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#84cc16' }} />
          AI 오라클 분석 완료
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.08 }}
          style={{
            fontSize: 'clamp(30px, 7vw, 44px)',
            fontWeight: 900,
            marginBottom: '10px',
            letterSpacing: '-1.2px',
            lineHeight: 1.1,
            color: 'var(--text)',
          }}
        >
          <span style={{
            display: 'block',
            fontSize: '0.4em',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '1.5px',
            marginBottom: '10px',
          }}>
            {userInput.birthYear}년 · {calLabel} · {age}세
          </span>
          나의 커리어{' '}
          <span style={{ color: 'var(--lime-hover)' }}>전략 리포트</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.18 }}
          style={{
            fontSize: 'var(--fs-base)',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          사주 · 격국 · 대운 · 십성 종합 분석
        </motion.p>

        {(userInput.specialty || userInput.currentSituation) && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '14px 18px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              fontSize: 'var(--fs-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {userInput.specialty && (
              <div>
                <span style={{ color: 'var(--lime-hover)', fontWeight: 700 }}>💼 전문 분야</span>
                <span style={{ marginLeft: '10px' }}>{userInput.specialty}</span>
              </div>
            )}
            {userInput.currentSituation && (
              <div>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>📝 현재 상황</span>
                <span style={{ marginLeft: '10px' }}>{userInput.currentSituation}</span>
              </div>
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
        {/* ── FREE: 0-0. 내 사주 원국 ────────────────────── */}
        {result.saju_detail && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.03 }}>
            <SectionTitle icon="☯" accent="gold" kicker="FOUNDATION · 四柱原局">
              내 사주 원국
            </SectionTitle>
            <WisdomBox accent="gold">
              💡 이것이 바로 <strong style={{ color: 'var(--text)' }}>당신의 사주 팔자(여덟 글자)</strong>입니다.
              일간(日干)은 당신의 본질, 천간·지지·지장간의 관계로 도출되는 <strong style={{ color: 'var(--text)' }}>십신(十神)</strong>이
              당신이 세상과 맺는 역할(재물·명예·인연·창의)을 결정합니다.
              아래 모든 해석은 이 원국에서 나왔습니다.
            </WisdomBox>
            <SajuDetail data={result.saju_detail} />
          </motion.section>
        )}

        {result.saju_detail && <SectionDivider />}

        {/* ── FREE: 0-1. 사주 총평 ─────────────────────────── */}
        {result.saju_summary && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }}>
            <SectionTitle icon="📜" accent="violet" kicker="NARRATIVE · 오라클 해석">
              사주 총평 · 그래서 어떻게 해석되었나
            </SectionTitle>
            <WisdomBox accent="violet">
              🔮 위 원국 데이터를 AI 마스터 오라클이 읽고 해석한 종합 평가입니다. <strong style={{ color: 'var(--text)' }}>일간(Identity) × 격국(Career Type) × 대운(Season)</strong>을 상관 관계로 엮어 "당신이 어떤 사람인지"를 서술합니다.
            </WisdomBox>
            <ThemeCard accent="violet">
              <p style={{
                fontSize: 'var(--fs-lg)',
                lineHeight: 1.95,
                color: 'var(--text)',
                whiteSpace: 'pre-wrap',
                fontWeight: 500,
              }}>
                {result.saju_summary}
              </p>
            </ThemeCard>
          </motion.section>
        )}

        {result.saju_summary && <SectionDivider />}

        {/* ── FREE: 0-1b. 격국 (사주 구조의 본질) ─────────────── */}
        {result.gyeokguk && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.06 }}>
            <SectionTitle icon="🏛" accent="gold" kicker="STRUCTURE · 격국">
              격국 — 사주 구조의 본질
            </SectionTitle>
            <WisdomBox accent="gold">
              💡 격국은 당신의 <strong style={{ color: 'var(--text)' }}>커리어 유형(Career Type)</strong>을 결정합니다. 일간이 "나는 누구인가"라면, 격국은 "나는 어떻게 일하는 사람인가"예요.
            </WisdomBox>
            <ThemeCard accent="gold">
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '2px', color: ACCENTS.gold.ink, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
                  Structural Pattern
                </p>
                <h3 style={{ fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 900, letterSpacing: '-0.8px', color: ACCENTS.gold.ink, lineHeight: 1.1 }}>
                  {result.gyeokguk.name}
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase' }}>
                    판정 근거
                  </p>
                  <p style={{ fontSize: 'var(--fs-base)', lineHeight: 1.85, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {result.gyeokguk.reasoning}
                  </p>
                </div>
                <div style={{ height: '1px', background: 'var(--border)' }} />
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase' }}>
                    커리어 함의
                  </p>
                  <p style={{ fontSize: 'var(--fs-base)', lineHeight: 1.85, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {result.gyeokguk.implication}
                  </p>
                </div>
              </div>
            </ThemeCard>
          </motion.section>
        )}

        {result.gyeokguk && <SectionDivider />}

        {/* ── FREE: 0-2. 올해 운세 ─────────────────────────── */}
        {result.yearly_fortune && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.08 }}>
            <SectionTitle icon="🌟" accent="teal" kicker="YEARLY · 올해 운세">
              올해 운세
            </SectionTitle>
            <ThemeCard accent="teal">
              <p style={{ fontSize: 'var(--fs-lg)', lineHeight: 1.9, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                {result.yearly_fortune}
              </p>
            </ThemeCard>
          </motion.section>
        )}

        {result.yearly_fortune && <SectionDivider />}

        {/* ── FREE: 1. 책사의 한마디 ─────────────────────── */}
        {result.sharp_feedback && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <SectionTitle icon="🔮" accent="rose" kicker="SHARP · 책사의 직언">
              책사의 한마디
            </SectionTitle>
            <SharpFeedback feedback={result.sharp_feedback} />
          </motion.section>
        )}

        <SectionDivider />

        {/* ── FREE: 2. 현재 커리어 계절 ───────────────────── */}
        {result.current_season && result.season_details && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
            <SectionTitle icon="🌸" accent="lime" kicker="NOW · 현재 계절">
              현재 커리어 계절
            </SectionTitle>
            <SeasonCard season={result.current_season} details={result.season_details} />
          </motion.section>
        )}

        {/* ── FREE: 3. 전성기 #1 티저 ─────────────────────── */}
        {topYear && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <SectionTitle icon="🏆" accent="gold" kicker="PEAK · 전성기">
              나의 최고 전성기
            </SectionTitle>
            <ThemeCard accent="gold">
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                  width: '68px', height: '68px',
                  borderRadius: '18px',
                  background: ACCENTS.gold.soft,
                  border: `1px solid ${ACCENTS.gold.main}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '30px', flexShrink: 0,
                }}>
                  👑
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase' }}>
                    커리어 최정점 해
                  </p>
                  <p style={{ fontSize: 'clamp(30px, 6vw, 38px)', fontWeight: 900, color: ACCENTS.gold.ink, lineHeight: 1, letterSpacing: '-1px' }}>
                    {topYear.year}년
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.8 }}>
                {topYear.reason}
              </p>
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--bg)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: 'var(--fs-sm)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                🔒 <span>Top 2~5 전성기 + 상세 분석은 프리미엄에서 확인하세요</span>
              </div>
            </ThemeCard>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── FREE: 3b. 운명의 계절 · 전공/천직 ───────────────── */}
        {result.career_sync && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.23 }}>
            <SectionTitle icon="🍂" accent="lime" kicker="SEASON · 4계절 로드맵">
              운명의 계절 · 전공 & 천직
            </SectionTitle>
            <WisdomBox accent="lime">
              💡 인생의 4계절(봄 씨앗 · 여름 성장 · 가을 수확 · 겨울 내실)은 <strong style={{ color: 'var(--text)' }}>대운의 흐름</strong>을 의미합니다. 지금이 '확장할 때'인지 '수축할 때'인지에 따라 전략이 갈립니다.
            </WisdomBox>
            <ThemeCard accent="lime" style={{ display: 'grid', gap: '22px' }}>
              <div>
                <p style={{ fontSize: '10px', color: ACCENTS.lime.main, letterSpacing: '2.5px', marginBottom: '8px', fontWeight: 700, opacity: 0.75 }}>
                  CURRENT SEASON
                </p>
                <h3 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 900, color: ACCENTS.lime.main, marginBottom: '12px', lineHeight: 1.25 }}>
                  {result.career_sync.season_label}
                </h3>
                <p style={{ fontSize: 'var(--fs-base)', lineHeight: 1.85, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                  {result.career_sync.season_focus}
                </p>
              </div>

              {result.career_sync.recommended_majors?.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', color: ACCENTS.lime.main, marginBottom: '10px', letterSpacing: '1.5px', fontWeight: 700, opacity: 0.7 }}>
                    📚 추천 전공
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.career_sync.recommended_majors.map((m) => (
                      <span key={m} style={{
                        fontSize: 'var(--fs-sm)', color: ACCENTS.lime.main, fontWeight: 600,
                        padding: '8px 14px',
                        background: ACCENTS.lime.soft,
                        border: `1px solid ${ACCENTS.lime.main}50`,
                        borderRadius: '999px',
                      }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.career_sync.recommended_jobs?.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', color: ACCENTS.teal.main, marginBottom: '10px', letterSpacing: '1.5px', fontWeight: 700, opacity: 0.75 }}>
                    💼 추천 직업군
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.career_sync.recommended_jobs.map((j) => (
                      <span key={j} style={{
                        fontSize: 'var(--fs-sm)', color: ACCENTS.teal.main, fontWeight: 600,
                        padding: '8px 14px',
                        background: ACCENTS.teal.soft,
                        border: `1px solid ${ACCENTS.teal.main}50`,
                        borderRadius: '999px',
                      }}>{j}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                padding: '14px 16px',
                background: 'var(--bg)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '1.5px', fontWeight: 700 }}>
                  추천 근거
                </p>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {result.career_sync.reasoning}
                </p>
              </div>
            </ThemeCard>
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
              padding: '16px 20px',
              borderRadius: '14px',
              background: '#ecfccb',
              border: '1px dashed #84cc16',
              fontSize: 'var(--fs-sm)',
              lineHeight: 1.7,
              color: 'var(--text)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#3f6212' }}>
              <span style={{ fontSize: '14px' }}>🧪</span>
              테스트 모드 — 결제 없이 모든 프리미엄 섹션 공개 중
            </div>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0 }}>
              ⬆ 위 섹션까지는 <strong style={{ color: 'var(--text)' }}>무료(FREE)</strong> ·
              ⬇ 아래 💎 PREMIUM 뱃지가 붙은 섹션은 결제 출시 후 <strong style={{ color: '#3f6212' }}>유료 전환</strong>됩니다.
              카드 모듈 연결 후 <code style={{ fontSize: '11px', background: '#fff', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--border)' }}>TEST_MODE_SHOW_ALL = false</code>로 전환하면 자동 게이팅 됩니다.
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
            <SectionTitle icon="🔍" accent="lime" kicker="REASONING">왜 지금이 이 계절인가</SectionTitle>
            <PaywallOverlay>
              <SeasonReasoning data={result.season_reasoning} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 4. 전성기 Top 5 전체 ───────────────── */}
        {sortedYears.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <SectionTitle icon="🏆" accent="gold" kicker="TOP 5 · 전성기">전성기 Top 5 상세 분석</SectionTitle>
            <PaywallOverlay>
              <div className="card-gold">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  커리어 정점이 될 연도 Top 5 (점수 기준 시각화)
                </p>
                <GoldenYearsChart data={result.top5_golden_years || []} />
                <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                  {sortedYears.map((y, i) => {
                    const rankColor = i === 0 ? ACCENTS.gold.main : i === 1 ? ACCENTS.slate.main : i === 2 ? ACCENTS.amber.main : '#cbd5e1';
                    const rankBg = i === 0 ? ACCENTS.gold.soft : i === 1 ? ACCENTS.slate.soft : i === 2 ? ACCENTS.amber.soft : '#f1f5f9';
                    return (
                      <div key={y.year} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '14px',
                        padding: '12px 14px',
                        background: 'var(--bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                      }}>
                        <span style={{
                          width: '32px', height: '32px',
                          borderRadius: '10px',
                          background: rankBg,
                          border: `1px solid ${rankColor}`,
                          color: rankColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--fs-sm)',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                              {y.year}년
                            </span>
                            <span style={{
                              fontSize: '11px',
                              color: rankColor,
                              background: rankBg,
                              padding: '2px 10px',
                              borderRadius: '999px',
                              fontWeight: 700,
                            }}>
                              {y.score}점
                            </span>
                          </div>
                          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            {y.reason}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 5. 생애 주기 그래프 ────────────────── */}
        {(result.life_cycle_scores ?? []).length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.32 }}>
            <SectionTitle icon="📊" accent="teal" kicker="LIFECYCLE · 생애 주기">생애 주기 운 그래프</SectionTitle>
            <PaywallOverlay>
              <div className="card-gold">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  10년 단위 커리어 기회/위기 점수
                </p>
                <LifeCycleChart data={result.life_cycle_scores || []} currentAge={age} />
                <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                  {(result.life_cycle_scores ?? []).map((l) => (
                    <div key={l.age_range} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <span style={{
                        fontSize: 'var(--fs-sm)',
                        fontWeight: 800,
                        color: ACCENTS.teal.ink,
                        background: ACCENTS.teal.soft,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        minWidth: '52px',
                        textAlign: 'center',
                        marginTop: '2px',
                      }}>
                        {l.age_range}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <div className="score-bar" style={{ flex: 1 }}>
                            <div className="score-bar-fill" style={{ width: `${l.score}%` }} />
                          </div>
                          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 800, color: 'var(--text)', minWidth: '32px' }}>
                            {l.score}
                          </span>
                        </div>
                        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
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
            <SectionTitle icon="🔄" accent="blue" kicker="CYCLE · 12년 주기">커리어 12년 주기</SectionTitle>
            <PaywallOverlay>
              <SeasonCycle cycle={result.season_cycle} peakYear={peakYear} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 7. 계절 심층 가이드 ────────────────── */}
        {result.season_guidance && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.36 }}>
            <SectionTitle icon="📖" accent="lime" kicker="DEEP GUIDE">계절별 심층 가이드</SectionTitle>
            <PaywallOverlay>
              <SeasonGuidance guidance={result.season_guidance} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── PREMIUM: 8. 올해 분기별 전략 ────────────────── */}
        {result.yearly_strategy && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.38 }}>
            <SectionTitle icon="📅" accent="teal" kicker="QUARTERLY · 분기 전략">올해 분기별 전략</SectionTitle>
            <PaywallOverlay>
              <YearlyStrategy data={result.yearly_strategy} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 9. 성장 미션 3종 ───────────────────── */}
        {result.growth_missions?.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
            <SectionTitle icon="🚀" accent="rose" kicker="MISSIONS · 성장 액션">성장 미션 3종</SectionTitle>
            <PaywallOverlay>
              <GrowthMissions missions={result.growth_missions} />
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── PREMIUM: 10. 네트워킹 가이드 ────────────────── */}
        {result.networking_guide && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.42 }}>
            <SectionTitle icon="🤝" accent="violet" kicker="NETWORKING">지금 만나야 할 사람</SectionTitle>
            <PaywallOverlay>
              <NetworkingGuide guide={result.networking_guide} season={result.current_season} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: 11. MBTI 시너지 ─────────────────────── */}
        {result.mbti_integration && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.44 }}>
            <SectionTitle icon="🧠" accent="blue" kicker="MBTI × SAJU">MBTI 시너지 분석</SectionTitle>
            <PaywallOverlay>
              <MBTICard data={result.mbti_integration} />
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: P3. 커리어 오각형 스탯 ──────────────── */}
        {result.career_pentagon && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.45 }}>
            <SectionTitle icon="⬟" accent="violet" kicker="PENTAGON · 역량 레이더">커리어 오각형 스탯</SectionTitle>
            <PaywallOverlay>
              <ThemeCard accent="violet">
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  일간 · 십성 · 오행을 조합해 도출한 커리어 역량 오각형
                </p>
                <div style={{ width: '100%', height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="72%" data={[
                      { subject: '리더십', A: result.career_pentagon.leadership },
                      { subject: '실행력', A: result.career_pentagon.execution },
                      { subject: '분석력', A: result.career_pentagon.analysis },
                      { subject: '창의성', A: result.career_pentagon.creativity },
                      { subject: '공감력', A: result.career_pentagon.empathy },
                    ]}>
                      <PolarGrid stroke="#e7e5e4" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#44403c', fontSize: 13, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="stat" dataKey="A" stroke="#8b5cf6" strokeWidth={2.5} fill="#8b5cf6" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{
                  marginTop: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                }}>
                  {([
                    ['리더십', result.career_pentagon.leadership, ACCENTS.violet],
                    ['실행력', result.career_pentagon.execution, ACCENTS.teal],
                    ['분석력', result.career_pentagon.analysis, ACCENTS.blue],
                    ['창의성', result.career_pentagon.creativity, ACCENTS.rose],
                    ['공감력', result.career_pentagon.empathy, ACCENTS.lime],
                  ] as const).map(([label, val, a]) => (
                    <div key={label} style={{
                      padding: '12px 6px',
                      background: a.soft,
                      border: `1px solid ${a.main}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '10px', color: a.ink, marginBottom: '4px', letterSpacing: '0.5px', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: a.ink }}>{val}</div>
                    </div>
                  ))}
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
              </ThemeCard>
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: P4. 인간관계 코드 ─────────────────────── */}
        {result.relationship_code && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.46 }}>
            <SectionTitle icon="🧬" accent="violet" kicker="TEN GODS · 관계 DNA">인간관계 코드</SectionTitle>
            <WisdomBox accent="violet">
              💡 사주의 <strong style={{ color: 'var(--text)' }}>십성(비겁·식상·재성·관성·인성)</strong>은 당신이 조직·관계에서 자연스럽게 맡는 역할을 알려줍니다. 빛나는 파트너, 피해야 할 충돌, 정치력까지 진단합니다.
            </WisdomBox>
            <PaywallOverlay>
              <ThemeCard accent="violet" style={{ display: 'grid', gap: '12px' }}>
                {[
                  { label: '리더십 스타일',     value: result.relationship_code.leadership_style,    a: ACCENTS.violet, icon: '🎯' },
                  { label: '파트너십 스타일',   value: result.relationship_code.partnership_style,   a: ACCENTS.blue,   icon: '🤝' },
                  { label: '조직 내 처세',      value: result.relationship_code.political_navigation, a: ACCENTS.gold,  icon: '⚖️' },
                  { label: '십성 균형 진단',    value: result.relationship_code.ten_gods_balance,    a: ACCENTS.teal,   icon: '🔮' },
                  { label: '시너지 내는 사람',  value: result.relationship_code.synergy_people,      a: ACCENTS.lime,   icon: '✨' },
                  { label: '충돌하는 사람',     value: result.relationship_code.friction_people,     a: ACCENTS.rose,   icon: '⚠️' },
                ].map((r) => (
                  <div key={r.label} style={{
                    padding: '16px 18px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderLeft: `3px solid ${r.a.main}`,
                    borderRadius: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{r.icon}</span>
                      <p style={{ fontSize: '11px', letterSpacing: '1.5px', color: r.a.ink, fontWeight: 800, textTransform: 'uppercase' }}>
                        {r.label}
                      </p>
                    </div>
                    <p style={{ fontSize: 'var(--fs-base)', lineHeight: 1.85, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </ThemeCard>
            </PaywallOverlay>
          </motion.section>
        )}

        {/* ── PREMIUM: P5. 생존 & 성장 전략 ──────────────────── */}
        {result.survival_strategy && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.47 }}>
            <SectionTitle icon="⚔️" accent="rose" kicker="SURVIVAL · 액션 플랜">생존 & 성장 전략</SectionTitle>
            <WisdomBox accent="rose">
              💡 "성공한다"가 아니라 "지금 이 계절에서 <strong style={{ color: 'var(--text)' }}>무엇을 버리고 무엇을 취할지</strong>"에 대한 Action Plan입니다.
            </WisdomBox>
            <PaywallOverlay>
              <ThemeCard accent="rose" style={{ display: 'grid', gap: '18px' }}>
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
                    background: 'var(--lime-soft)',
                    border: '1px solid var(--border)',
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
              </ThemeCard>
            </PaywallOverlay>
          </motion.section>
        )}

        <SectionDivider />

        {/* ── FREE: 12. 덕 쌓기 챌린지 ────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.48 }}>
          <SectionTitle icon="🌿" accent="lime" kicker="KARMA · 덕 쌓기">덕 쌓기 챌린지</SectionTitle>
          <VirtueChallenge />
        </motion.section>

        {/* ── FREE: 13. 공유 카드 ──────────────────────────── */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.5 }}>
          <SectionTitle icon="✨" accent="blue" kicker="SHARE · 기운 나누기">좋은 기운 나누기</SectionTitle>
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
              background: 'var(--card)',
              border: '1px solid var(--border-strong)',
              borderRadius: '12px',
              fontSize: 'var(--fs-sm)',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow-sm)',
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
              background: ACCENTS.lime.soft, border: `1px solid ${ACCENTS.lime.main}`,
              borderRadius: '12px', fontSize: 'var(--fs-sm)', color: ACCENTS.lime.ink, fontWeight: 700,
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
                  background: 'var(--card)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '12px', fontSize: 'var(--fs-sm)', fontWeight: 700,
                  color: 'var(--text-secondary)', cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
                  opacity: saveState === 'saving' ? 0.7 : 1,
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {saveState === 'saving' ? '저장 중...' : user ? '💾 결과 저장하기 (1년 보관)' : '🔐 로그인 후 결과 저장하기'}
              </button>
              {saveState === 'error' && saveError && (
                <p style={{ fontSize: 'var(--fs-xs)', color: ACCENTS.rose.main, textAlign: 'center', marginTop: '6px' }}>
                  {saveError}
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* ── Oracle Chat Button — lime primary CTA ───────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.51 }} className="no-print">
          <button
            onClick={() => setChatOpen(true)}
            style={{
              width: '100%',
              padding: '16px 0',
              background: ACCENTS.lime.main,
              border: 'none',
              borderRadius: '12px',
              fontSize: 'var(--fs-base)',
              fontWeight: 800,
              color: '#1a1a1a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              letterSpacing: '-0.2px',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = ACCENTS.lime.ink; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = ACCENTS.lime.main; e.currentTarget.style.color = '#1a1a1a'; }}
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
