import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { SajuDetail as SajuDetailType } from '../../types';

interface Props {
  data: SajuDetailType;
}

// V65 Careet-style element palette (light mode)
const ELEMENT_COLORS: Record<string, { color: string; soft: string; ink: string; label: string; icon: string }> = {
  wood:  { color: '#65a30d', soft: '#ecfccb', ink: '#365314', label: '목(木)', icon: '🌳' },
  fire:  { color: '#e11d48', soft: '#ffe4e6', ink: '#881337', label: '화(火)', icon: '🔥' },
  earth: { color: '#d97706', soft: '#fef3c7', ink: '#78350f', label: '토(土)', icon: '🏔' },
  metal: { color: '#475569', soft: '#f1f5f9', ink: '#1e293b', label: '금(金)', icon: '⚔️' },
  water: { color: '#0891b2', soft: '#cffafe', ink: '#164e63', label: '수(水)', icon: '💧' },
};

const KO_ELEMENT_TO_KEY: Record<string, keyof typeof ELEMENT_COLORS> = {
  '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water',
};
function elColor(ko?: string): { color: string; soft: string; ink: string } {
  if (!ko) return { color: '#78716c', soft: '#f5f5f4', ink: '#292524' };
  const k = KO_ELEMENT_TO_KEY[ko];
  return k ? ELEMENT_COLORS[k] : { color: '#78716c', soft: '#f5f5f4', ink: '#292524' };
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

  const dayMasterEl = data.day_master.element.replace(/\(.+\)/, '');
  const dmColor = elColor(dayMasterEl);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* ── 일간 HERO 카드 ── */}
      <div style={{
        ...CARD,
        borderRadius: '24px',
        padding: '28px 24px',
        background: `linear-gradient(135deg, ${dmColor.soft} 0%, #ffffff 100%)`,
        border: `1px solid ${dmColor.color}40`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <p style={{
          fontSize: '11px', letterSpacing: '2.5px', color: dmColor.ink,
          fontWeight: 800, marginBottom: '14px', textTransform: 'uppercase',
        }}>
          ◆ 일간 · Day Master · 나의 본질
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <div style={{
            width: '88px', height: '88px', flexShrink: 0,
            borderRadius: '22px',
            background: dmColor.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '42px', fontWeight: 900, color: '#fff',
            boxShadow: `0 8px 24px ${dmColor.color}40`,
          }}>
            {data.four_pillars.day.heavenly}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{
              fontSize: 'clamp(24px, 5vw, 30px)', fontWeight: 900,
              marginBottom: '6px', letterSpacing: '-0.8px', lineHeight: 1.1,
              color: 'var(--text)',
            }}>
              {data.day_master.character}
              <span style={{
                fontSize: '0.55em', marginLeft: '10px', fontWeight: 700, color: dmColor.ink,
              }}>
                {data.day_master.element}
              </span>
            </h3>
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
            const stem = elColor(analysis?.stemElement);
            const branch = elColor(analysis?.branchElement);
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
                  background: isDay ? '#fef3c7' : 'transparent',
                  border: isDay ? '1px solid #b8860b' : '1px solid transparent',
                }}
              >
                <span style={{
                  fontSize: '10px',
                  color: isDay ? '#78350f' : 'var(--text-muted)',
                  letterSpacing: '1px',
                  fontWeight: isDay ? 800 : 600,
                  textAlign: 'center',
                }}>
                  {PILLAR_LABELS[i]}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  {PILLAR_ROLE[key]}
                </span>

                {/* 천간 */}
                <div style={{
                  width: '58px', height: '58px', borderRadius: '14px',
                  background: isDay ? '#b8860b' : stem.color,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: isDay ? '0 4px 12px rgba(184,134,11,0.35)' : `0 2px 8px ${stem.color}33`,
                }}>
                  <div style={{ fontSize: '22px', color: '#fff', fontWeight: 800, lineHeight: 1 }}>
                    {pillar.heavenly}
                  </div>
                  <div style={{ fontSize: '8px', color: '#fff', marginTop: '3px', opacity: 0.95, fontWeight: 700 }}>
                    {analysis?.stemElement ?? ''}
                  </div>
                </div>

                {/* 천간 십신 */}
                <div style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: isDay ? '#fef3c7' : stem.soft,
                  color: isDay ? '#78350f' : stem.ink,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>
                  {(analysis?.stemTenGod ?? '—').replace(/\(.*\)/, '')}
                </div>

                {/* 지지 */}
                <div style={{
                  width: '58px', height: '58px', borderRadius: '14px',
                  background: branch.soft,
                  border: `1.5px solid ${branch.color}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '20px', color: branch.ink, fontWeight: 800, lineHeight: 1 }}>
                    {pillar.earthly}
                  </div>
                  <div style={{ fontSize: '8px', color: branch.ink, marginTop: '3px', opacity: 0.85, fontWeight: 700 }}>
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
                    {analysis.hiddenStems.map((h, hi) => {
                      const hc = elColor(h.element);
                      return (
                        <div key={hi} style={{
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: hc.soft,
                          color: hc.ink,
                          lineHeight: 1.3,
                          textAlign: 'center',
                          width: '100%',
                          fontWeight: 600,
                        }}>
                          <span style={{ fontWeight: 800 }}>{h.char}</span>
                          <span style={{ marginLeft: '3px', fontSize: '8px' }}>
                            {h.tenGod.replace(/\(.*\)/, '')}
                          </span>
                        </div>
                      );
                    })}
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
                tick={{ fill: '#44403c', fontSize: 14, fontWeight: 700 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="5행" dataKey="value" stroke="#65a30d" strokeWidth={2.5} fill="#84cc16" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Element pills with counts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '8px' }}>
          {(Object.entries(ELEMENT_COLORS) as [keyof typeof ELEMENT_COLORS, typeof ELEMENT_COLORS[keyof typeof ELEMENT_COLORS]][]).map(([key, cfg]) => {
            const raw = elements[key as keyof typeof elements];
            return (
              <div key={key} style={{
                padding: '10px 4px',
                background: cfg.soft,
                border: `1px solid ${cfg.color}40`,
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>{cfg.icon}</div>
                <div style={{ fontSize: '10px', color: cfg.ink, fontWeight: 700, letterSpacing: '0.5px' }}>{cfg.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: cfg.color, marginTop: '2px' }}>{raw}</div>
              </div>
            );
          })}
        </div>

        {/* 용신/기신 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
          <div style={{
            padding: '14px 16px', borderRadius: '14px',
            background: '#ecfccb', border: '1px solid #84cc16',
          }}>
            <p style={{ fontSize: '10px', color: '#3f6212', marginBottom: '4px', fontWeight: 800, letterSpacing: '1.5px' }}>✦ 용신(用神)</p>
            <p style={{ fontSize: 'var(--fs-lg)', color: '#3f6212', fontWeight: 900, letterSpacing: '-0.3px' }}>{data.favorable_element}</p>
          </div>
          <div style={{
            padding: '14px 16px', borderRadius: '14px',
            background: '#ffe4e6', border: '1px solid #f43f5e',
          }}>
            <p style={{ fontSize: '10px', color: '#9f1239', marginBottom: '4px', fontWeight: 800, letterSpacing: '1.5px' }}>⚠ 기신(忌神)</p>
            <p style={{ fontSize: 'var(--fs-lg)', color: '#9f1239', fontWeight: 900, letterSpacing: '-0.3px' }}>{data.unfavorable_element}</p>
          </div>
        </div>
      </div>

      {/* ── 현재 대운 ── */}
      {data.current_luck_period && (
        <div style={{
          ...CARD,
          background: '#cffafe',
          border: '1px solid #0891b2',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--fs-base)', fontWeight: 900, color: '#164e63' }}>
              ◆ 현재 대운(大運)
            </span>
            <span style={{
              fontSize: '11px', padding: '4px 12px', borderRadius: '999px',
              background: '#fff', border: '1px solid #0891b2',
              color: '#164e63', fontWeight: 800,
            }}>
              {data.current_luck_period.period}
            </span>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 800, color: '#0e7490' }}>
              {data.current_luck_period.element}
            </span>
          </div>
          <p style={{ fontSize: 'var(--fs-base)', color: '#0c4a6e', lineHeight: 1.85 }}>
            {data.current_luck_period.influence}
          </p>
        </div>
      )}

      {/* ── 성격 요약 ── */}
      {data.personality_summary && (
        <div style={{
          ...CARD,
          background: '#fef3c7',
          border: '1px solid #b8860b',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#78350f', marginBottom: '10px', letterSpacing: '1.5px' }}>
            ◆ 사주 기질 요약
          </p>
          <p style={{ fontSize: 'var(--fs-base)', color: '#451a03', lineHeight: 1.9 }}>
            {data.personality_summary}
          </p>
        </div>
      )}
    </div>
  );
}
