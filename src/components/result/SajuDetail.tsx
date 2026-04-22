import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { SajuDetail as SajuDetailType } from '../../types';

interface Props {
  data: SajuDetailType;
}

// V67 monochrome element system — elements show only via label/icon, not color.
// Keeps the design minimal; element data is still legible via the Korean name.
const NEUTRAL_CFG = { color: '#1a1a1a', soft: '#fafaf9', ink: '#262626' };
const ELEMENT_COLORS: Record<string, { color: string; soft: string; ink: string; label: string; icon: string }> = {
  wood:  { ...NEUTRAL_CFG, label: '목(木)', icon: '🌳' },
  fire:  { ...NEUTRAL_CFG, label: '화(火)', icon: '🔥' },
  earth: { ...NEUTRAL_CFG, label: '토(土)', icon: '🏔' },
  metal: { ...NEUTRAL_CFG, label: '금(金)', icon: '⚔️' },
  water: { ...NEUTRAL_CFG, label: '수(水)', icon: '💧' },
};

const KO_ELEMENT_TO_KEY: Record<string, keyof typeof ELEMENT_COLORS> = {
  '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water',
};
// V67 neutral: all elements resolve to the same dark-on-light style.
// Kept as a function to preserve the call sites that still reference it.
function elColor(_ko?: string): { color: string; soft: string; ink: string } {
  return NEUTRAL_CFG;
}

const PILLAR_LABELS = ['년주(年柱)', '월주(月柱)', '일주(日柱)', '시주(時柱)'];
const PILLAR_KEYS = ['year', 'month', 'day', 'hour'] as const;
const PILLAR_ROLE: Record<typeof PILLAR_KEYS[number], string> = {
  year: '조상·뿌리',
  month: '부모·사회',
  day: '나·배우자',
  hour: '자녀·노년',
};

const CARD = {
  background: '#ffffff',
  border: '1px solid #e7e5e4',
  borderRadius: '20px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
};

export default function SajuDetail({ data }: Props) {
  const elements = data.five_elements;
  const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
  const scale = total > 0 && total <= 10 ? (100 / Math.max(total, 4)) : 1;
  const pct = (v: number) => Math.round(Math.min(100, v * scale));

  const radarData = [
    { axis: '목', value: pct(elements.wood) },
    { axis: '화', value: pct(elements.fire) },
    { axis: '토', value: pct(elements.earth) },
    { axis: '금', value: pct(elements.metal) },
    { axis: '수', value: pct(elements.water) },
  ];

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* ── 일간 HERO 카드 — flat, typography-first ── */}
      <div style={{
        ...CARD,
        borderRadius: '24px',
        padding: '32px 28px',
      }}>
        <p style={{
          fontSize: '11px', letterSpacing: '2.5px', color: '#737373',
          fontWeight: 800, marginBottom: '18px', textTransform: 'uppercase',
        }}>
          Day Master · 일간 · 나의 본질
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="display-font" style={{
            width: '96px', height: '96px', flexShrink: 0,
            borderRadius: '20px',
            background: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '52px', fontWeight: 400, color: '#fff',
            letterSpacing: '-2px',
          }}>
            {data.four_pillars.day.heavenly}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 className="display-font" style={{
              fontSize: 'clamp(26px, 5.5vw, 34px)', fontWeight: 400,
              marginBottom: '8px', letterSpacing: '-0.8px', lineHeight: 1.1,
              color: 'var(--text)',
            }}>
              {data.day_master.character}
            </h3>
            <p style={{
              fontSize: '13px', color: '#737373', marginBottom: '10px',
              letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase',
            }}>
              {data.day_master.element}
            </p>
            {data.day_master.description && (
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                {data.day_master.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 사주 원국 4주 ── */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '2.5px', color: 'var(--text)', fontWeight: 800, textTransform: 'uppercase' }}>
            四柱原局 · Four Pillars
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            천간 · 지지 · 지장간
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}>
          {PILLAR_KEYS.map((key, i) => {
            const pillar = data.four_pillars[key];
            const analysis = data.pillar_analysis?.[key] ?? null;
            const isDay = key === 'day';
            const missing = !pillar || (key === 'hour' && pillar.heavenly === '?');
            if (missing) {
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>{PILLAR_LABELS[i]}</span>
                  <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'var(--bg)', border: '1px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>?</div>
                  <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'var(--bg)', border: '1px dashed var(--border-strong)' }} />
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>미입력</p>
                </div>
              );
            }
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', damping: 20 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '14px 4px',
                  borderRadius: '16px',
                  background: isDay ? 'var(--bg)' : 'transparent',
                  border: isDay ? '1px solid var(--border-strong)' : '1px solid transparent',
                }}
              >
                <span style={{
                  fontSize: '10px',
                  color: isDay ? 'var(--text)' : 'var(--text-muted)',
                  letterSpacing: '1px',
                  fontWeight: isDay ? 800 : 600,
                  textAlign: 'center',
                }}>
                  {PILLAR_LABELS[i]}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  {PILLAR_ROLE[key]}
                </span>

                {/* 천간 — solid black for day master, white card for others */}
                <div className="display-font" style={{
                  width: '60px', height: '60px', borderRadius: '14px',
                  background: isDay ? '#1a1a1a' : 'var(--card)',
                  border: isDay ? 'none' : '1px solid var(--border-strong)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '26px', color: isDay ? '#fff' : 'var(--text)', fontWeight: 400, lineHeight: 1, letterSpacing: '-1px' }}>
                    {pillar.heavenly}
                  </div>
                  <div style={{ fontSize: '8px', color: isDay ? '#fff' : 'var(--text-muted)', marginTop: '3px', fontWeight: 700 }}>
                    {analysis?.stemElement ?? ''}
                  </div>
                </div>

                {/* 천간 십신 */}
                <div style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: isDay ? '#1a1a1a' : 'var(--bg)',
                  color: isDay ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>
                  {(analysis?.stemTenGod ?? '—').replace(/\(.*\)/, '')}
                </div>

                {/* 지지 */}
                <div className="display-font" style={{
                  width: '60px', height: '60px', borderRadius: '14px',
                  background: 'var(--card)',
                  border: '1px solid var(--border-strong)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '24px', color: 'var(--text)', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.8px' }}>
                    {pillar.earthly}
                  </div>
                  <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 700 }}>
                    {analysis?.branchElement ?? ''}
                  </div>
                </div>

                {/* 지지 십신 */}
                <div style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: 'var(--bg)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {(analysis?.branchTenGod ?? '—').replace(/\(.*\)/, '')}
                </div>

                {/* 지장간 */}
                {analysis?.hiddenStems?.length ? (
                  <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '100%' }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '1px' }}>지장간</span>
                    {analysis.hiddenStems.map((h, hi) => (
                      <div key={hi} style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.3,
                        textAlign: 'center',
                        width: '100%',
                        fontWeight: 600,
                      }}>
                        <span style={{ fontWeight: 800, color: 'var(--text)' }}>{h.char}</span>
                        <span style={{ marginLeft: '3px', fontSize: '8px' }}>
                          {h.tenGod.replace(/\(.*\)/, '')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── 오행 레이더 차트 ── */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', letterSpacing: '0.5px' }}>
            오행(五行) 분포
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            원국 자연 분포
          </p>
        </div>

        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <PolarGrid stroke="#e7e5e4" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: '#1a1a1a', fontSize: 14, fontWeight: 700 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="5행" dataKey="value" stroke="#1a1a1a" strokeWidth={2} fill="#1a1a1a" fillOpacity={0.08} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Element pills with counts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '8px' }}>
          {(Object.entries(ELEMENT_COLORS) as [keyof typeof ELEMENT_COLORS, typeof ELEMENT_COLORS[keyof typeof ELEMENT_COLORS]][]).map(([key, cfg]) => {
            const raw = elements[key as keyof typeof elements];
            return (
              <div key={key} style={{
                padding: '12px 4px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>{cfg.icon}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>{cfg.label}</div>
                <div className="display-font" style={{ fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginTop: '4px', letterSpacing: '-0.5px' }}>{raw}</div>
              </div>
            );
          })}
        </div>

        {/* 용신/기신 — minimal: 용신 gets lime accent (active), 기신 stays neutral */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
          <div style={{
            padding: '14px 16px', borderRadius: '14px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderLeft: '3px solid #84cc16',
          }}>
            <p style={{ fontSize: '10px', color: '#3f6212', marginBottom: '4px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              용신 · Favorable
            </p>
            <p className="display-font" style={{ fontSize: 'var(--fs-xl)', color: 'var(--text)', fontWeight: 400, letterSpacing: '-0.5px' }}>{data.favorable_element}</p>
          </div>
          <div style={{
            padding: '14px 16px', borderRadius: '14px',
            background: 'var(--bg)', border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              기신 · Unfavorable
            </p>
            <p className="display-font" style={{ fontSize: 'var(--fs-xl)', color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '-0.5px' }}>{data.unfavorable_element}</p>
          </div>
        </div>
      </div>

      {/* ── 현재 대운 — lime accent = "active/now" ── */}
      {data.current_luck_period && (
        <div style={{
          ...CARD,
          borderLeft: '3px solid #84cc16',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '999px', background: '#ecfccb', color: '#3f6212', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Now · 현재 대운
            </span>
            <span style={{
              fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--text)', fontWeight: 700,
            }}>
              {data.current_luck_period.period}
            </span>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 800, color: 'var(--text)' }}>
              {data.current_luck_period.element}
            </span>
          </div>
          <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-secondary)', lineHeight: 1.85 }}>
            {data.current_luck_period.influence}
          </p>
        </div>
      )}

      {/* ── 성격 요약 ── */}
      {data.personality_summary && (
        <div style={CARD}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            사주 기질 요약
          </p>
          <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text)', lineHeight: 1.9 }}>
            {data.personality_summary}
          </p>
        </div>
      )}
    </div>
  );
}
