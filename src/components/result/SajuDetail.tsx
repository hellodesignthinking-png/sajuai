import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { SajuDetail as SajuDetailType } from '../../types';

interface Props {
  data: SajuDetailType;
}

// V64 element palette — vivid, modern, consistent with ResultDashboard accents.
const ELEMENT_COLORS: Record<string, { color: string; soft: string; label: string; icon: string }> = {
  wood:  { color: '#a3e635', soft: 'rgba(163,230,53,0.15)',  label: '목(木)', icon: '🌳' },
  fire:  { color: '#fb7185', soft: 'rgba(251,113,133,0.15)', label: '화(火)', icon: '🔥' },
  earth: { color: '#f59e0b', soft: 'rgba(245,158,11,0.15)',  label: '토(土)', icon: '🏔' },
  metal: { color: '#94a3b8', soft: 'rgba(148,163,184,0.15)', label: '금(金)', icon: '⚔️' },
  water: { color: '#22d3ee', soft: 'rgba(34,211,238,0.15)',  label: '수(水)', icon: '💧' },
};

const KO_ELEMENT_TO_KEY: Record<string, keyof typeof ELEMENT_COLORS> = {
  '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water',
};
function elColor(ko?: string): string {
  if (!ko) return '#8a8aa0';
  const k = KO_ELEMENT_TO_KEY[ko];
  return k ? ELEMENT_COLORS[k].color : '#8a8aa0';
}

const PILLAR_LABELS = ['년주(年柱)', '월주(月柱)', '일주(日柱)', '시주(時柱)'];
const PILLAR_KEYS = ['year', 'month', 'day', 'hour'] as const;
const PILLAR_ROLE: Record<typeof PILLAR_KEYS[number], string> = {
  year: '조상·뿌리',
  month: '부모·사회',
  day: '나(자아)·배우자',
  hour: '자녀·노년',
};

export default function SajuDetail({ data }: Props) {
  const elements = data.five_elements;

  // Normalize 5-element counts — they may come as raw counts (0-8) or percentages.
  const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
  const scale = total > 0 && total <= 10 ? (100 / Math.max(total, 4)) : 1;
  const pct = (v: number) => Math.round(Math.min(100, v * scale));

  const radarData = [
    { axis: '목(木)', value: pct(elements.wood),  color: ELEMENT_COLORS.wood.color },
    { axis: '화(火)', value: pct(elements.fire),  color: ELEMENT_COLORS.fire.color },
    { axis: '토(土)', value: pct(elements.earth), color: ELEMENT_COLORS.earth.color },
    { axis: '금(金)', value: pct(elements.metal), color: ELEMENT_COLORS.metal.color },
    { axis: '수(水)', value: pct(elements.water), color: ELEMENT_COLORS.water.color },
  ];

  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      {/* ── 일간 HERO 카드 — "당신은 누구인가" ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(167,139,250,0.10) 50%, rgba(34,211,238,0.08) 100%)',
        border: '1px solid rgba(212,175,55,0.32)',
        borderRadius: '22px',
        padding: '28px 24px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          top: '-60px', right: '-40px',
          width: '240px', height: '240px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '10px', letterSpacing: '3px', color: 'var(--gold)',
            fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', opacity: 0.8,
          }}>
            ◆ 일간 · Day Master · 나의 본질
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{
              width: '80px', height: '80px', flexShrink: 0,
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${elColor(data.day_master.element.replace(/\(.+\)/, ''))} 0%, ${elColor(data.day_master.element.replace(/\(.+\)/, ''))}99 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', fontWeight: 900, color: '#0a0a14',
              boxShadow: `0 8px 24px ${elColor(data.day_master.element.replace(/\(.+\)/, ''))}55`,
            }}>
              {data.four_pillars.day.heavenly}
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                <span style={{ color: 'var(--gold)' }}>{data.day_master.character}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6em', marginLeft: '10px', fontWeight: 600 }}>
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
      </div>

      {/* ── 사주 원국 4주 테이블 ── */}
      <div style={{
        background: 'var(--card-raised, linear-gradient(135deg, #1a1a2e 0%, #12121f 100%))',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '22px',
        padding: '24px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #a3e635, #22d3ee, #a78bfa, #fb7185, #D4AF37)',
          opacity: 0.55,
        }} />

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase' }}>
            四柱原局 · Four Pillars
          </p>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
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
                  <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>?</div>
                  <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }} />
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>미입력</p>
                </div>
              );
            }
            const stemColor = elColor(analysis?.stemElement);
            const branchColor = elColor(analysis?.branchElement);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', damping: 20 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '12px 4px',
                  borderRadius: '16px',
                  background: isDay ? 'rgba(212,175,55,0.08)' : 'transparent',
                  border: isDay ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
                }}
              >
                <span style={{
                  fontSize: '10px',
                  color: isDay ? 'var(--gold)' : 'var(--text-muted)',
                  letterSpacing: '1px',
                  fontWeight: isDay ? 800 : 600,
                  textAlign: 'center',
                }}>
                  {PILLAR_LABELS[i]}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', opacity: 0.7 }}>
                  {PILLAR_ROLE[key]}
                </span>

                {/* 천간 */}
                <div style={{
                  width: '58px', height: '58px', borderRadius: '14px',
                  background: isDay
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.15))'
                    : `linear-gradient(135deg, ${stemColor}22, ${stemColor}0a)`,
                  border: isDay ? '1px solid rgba(212,175,55,0.7)' : `1px solid ${stemColor}55`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: isDay ? '0 0 24px rgba(212,175,55,0.25)' : `0 2px 12px ${stemColor}22`,
                }}>
                  <div style={{ fontSize: '22px', color: isDay ? 'var(--gold)' : stemColor, fontWeight: 800, lineHeight: 1 }}>
                    {pillar.heavenly}
                  </div>
                  <div style={{ fontSize: '8px', color: isDay ? 'var(--gold)' : stemColor, marginTop: '3px', opacity: 0.9, fontWeight: 700 }}>
                    {analysis?.stemElement ?? ''}
                  </div>
                </div>

                {/* 천간 십신 */}
                <div style={{
                  fontSize: '9px',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  background: isDay ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                  border: isDay ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: isDay ? 'var(--gold)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}>
                  {(analysis?.stemTenGod ?? '—').replace(/\(.*\)/, '')}
                </div>

                {/* 지지 */}
                <div style={{
                  width: '58px', height: '58px', borderRadius: '14px',
                  background: `linear-gradient(135deg, ${branchColor}22, ${branchColor}0a)`,
                  border: `1px solid ${branchColor}55`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 2px 12px ${branchColor}22`,
                }}>
                  <div style={{ fontSize: '20px', color: branchColor, fontWeight: 800, lineHeight: 1 }}>
                    {pillar.earthly}
                  </div>
                  <div style={{ fontSize: '8px', color: branchColor, marginTop: '3px', opacity: 0.9, fontWeight: 700 }}>
                    {analysis?.branchElement ?? ''}
                  </div>
                </div>

                {/* 지지 십신 */}
                <div style={{
                  fontSize: '9px',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}>
                  {(analysis?.branchTenGod ?? '—').replace(/\(.*\)/, '')}
                </div>

                {/* 지장간 */}
                {analysis?.hiddenStems?.length ? (
                  <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '100%' }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '1px', opacity: 0.7 }}>
                      지장간
                    </span>
                    {analysis.hiddenStems.map((h, hi) => (
                      <div key={hi} style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: `${elColor(h.element)}14`,
                        border: `1px solid ${elColor(h.element)}33`,
                        color: elColor(h.element),
                        lineHeight: 1.3,
                        textAlign: 'center',
                        width: '100%',
                      }}>
                        <span style={{ fontWeight: 800 }}>{h.char}</span>
                        <span style={{ opacity: 0.8, marginLeft: '3px', fontSize: '8px' }}>
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
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #12121f 100%)',
        border: '1px solid rgba(167,139,250,0.22)',
        borderRadius: '22px',
        padding: '24px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', letterSpacing: '0.5px' }}>
            오행(五行) 분포
          </p>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            원국 기반 자연 분포
          </p>
        </div>

        <div style={{ width: '100%', height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <defs>
                <linearGradient id="fiveElGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.75} />
                  <stop offset="50%" stopColor="#22d3ee" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#a3e635" stopOpacity={0.65} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: '#e4e2d5', fontSize: 13, fontWeight: 700 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="5행"
                dataKey="value"
                stroke="#a78bfa"
                strokeWidth={2.5}
                fill="url(#fiveElGrad)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Element pills with counts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '8px' }}>
          {(Object.entries(ELEMENT_COLORS) as [keyof typeof ELEMENT_COLORS, typeof ELEMENT_COLORS[keyof typeof ELEMENT_COLORS]][]).map(([key, cfg]) => {
            const raw = elements[key as keyof typeof elements];
            return (
              <div key={key} style={{
                padding: '8px 4px',
                background: cfg.soft,
                border: `1px solid ${cfg.color}3a`,
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '15px', marginBottom: '2px' }}>{cfg.icon}</div>
                <div style={{ fontSize: '10px', color: cfg.color, fontWeight: 700, letterSpacing: '0.5px' }}>{cfg.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: cfg.color, marginTop: '2px' }}>{raw}</div>
              </div>
            );
          })}
        </div>

        {/* 용신/기신 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
          <div style={{
            padding: '14px 16px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(163,230,53,0.12), rgba(163,230,53,0.04))',
            border: '1px solid rgba(163,230,53,0.3)',
          }}>
            <p style={{ fontSize: '10px', color: '#a3e635', marginBottom: '6px', fontWeight: 800, letterSpacing: '1.5px' }}>✦ 용신(用神)</p>
            <p style={{ fontSize: 'var(--fs-lg)', color: '#a3e635', fontWeight: 900, letterSpacing: '-0.3px' }}>{data.favorable_element}</p>
          </div>
          <div style={{
            padding: '14px 16px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(251,113,133,0.12), rgba(251,113,133,0.04))',
            border: '1px solid rgba(251,113,133,0.3)',
          }}>
            <p style={{ fontSize: '10px', color: '#fb7185', marginBottom: '6px', fontWeight: 800, letterSpacing: '1.5px' }}>⚠ 기신(忌神)</p>
            <p style={{ fontSize: 'var(--fs-lg)', color: '#fb7185', fontWeight: 900, letterSpacing: '-0.3px' }}>{data.unfavorable_element}</p>
          </div>
        </div>
      </div>

      {/* ── 현재 대운 ── */}
      {data.current_luck_period && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.10) 0%, rgba(125,211,252,0.04) 100%)',
          border: '1px solid rgba(34,211,238,0.28)',
          borderRadius: '18px',
          padding: '20px 22px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '4px',
            background: 'linear-gradient(180deg, #22d3ee, #7dd3fc)',
          }} />
          <div style={{ paddingLeft: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--fs-base)', fontWeight: 900, color: '#22d3ee' }}>
                ◆ 현재 대운(大運)
              </span>
              <span style={{
                fontSize: '12px', padding: '4px 12px', borderRadius: '999px',
                background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)',
                color: '#22d3ee', fontWeight: 700,
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
        </div>
      )}

      {/* ── 성격 요약 ── */}
      {data.personality_summary && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '18px',
          padding: '20px 22px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', marginBottom: '10px', letterSpacing: '1.5px' }}>
            ◆ 사주 기질 요약
          </p>
          <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text)', lineHeight: 1.9 }}>
            {data.personality_summary}
          </p>
        </div>
      )}
    </div>
  );
}
