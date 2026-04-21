import { motion } from 'framer-motion';
import type { SajuDetail as SajuDetailType } from '../../types';

interface Props {
  data: SajuDetailType;
}

const ELEMENT_COLORS: Record<string, { bg: string; glow: string; label: string }> = {
  wood:  { bg: '#22c55e', glow: 'rgba(34,197,94,0.3)',  label: '목(木)' },
  fire:  { bg: '#ef4444', glow: 'rgba(239,68,68,0.3)',   label: '화(火)' },
  earth: { bg: '#ca8a04', glow: 'rgba(202,138,4,0.3)',   label: '토(土)' },
  metal: { bg: '#94a3b8', glow: 'rgba(148,163,184,0.3)', label: '금(金)' },
  water: { bg: '#3b82f6', glow: 'rgba(59,130,246,0.3)',  label: '수(水)' },
};

// Korean element name → ELEMENT_COLORS key
const KO_ELEMENT_TO_KEY: Record<string, keyof typeof ELEMENT_COLORS> = {
  '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water',
};
function elColor(ko?: string): string {
  if (!ko) return 'rgba(255,255,255,0.5)';
  const k = KO_ELEMENT_TO_KEY[ko];
  return k ? ELEMENT_COLORS[k].bg : 'rgba(255,255,255,0.5)';
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
  const elementEntries = Object.entries(elements) as [keyof typeof elements, number][];

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {/* ── 사주 원국 4주 테이블 ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d0c08 0%, #1a1500 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '16px',
          padding: '24px 20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        <p style={{ fontSize: '11px', letterSpacing: '4px', color: 'var(--gold)', marginBottom: '20px', fontWeight: 600 }}>
          ◆ 사주 원국 四柱原局
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
          }}
        >
          {PILLAR_KEYS.map((key, i) => {
            const pillar = data.four_pillars[key];
            const analysis = data.pillar_analysis?.[key] ?? null;
            const isDay = key === 'day';
            const missing = !pillar || (key === 'hour' && pillar.heavenly === '?');
            if (missing) {
              return (
                <div
                  key={key}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                >
                  <span style={{ fontSize: '10px', color: 'rgba(212,175,55,0.35)', letterSpacing: '1px' }}>
                    {PILLAR_LABELS[i]}
                  </span>
                  <div style={{ width: '58px', height: '58px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>?</div>
                  <div style={{ width: '58px', height: '58px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>?</div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>미입력</p>
                </div>
              );
            }
            const stemColor = elColor(analysis?.stemElement);
            const branchColor = elColor(analysis?.branchElement);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ fontSize: '10px', color: isDay ? 'var(--gold)' : 'rgba(212,175,55,0.5)', letterSpacing: '1px', fontWeight: isDay ? 700 : 400, textAlign: 'center' }}>
                  {PILLAR_LABELS[i]}
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                  {PILLAR_ROLE[key]}
                </span>

                {/* 천간 */}
                <div style={{
                  width: '62px', height: '62px', borderRadius: '12px',
                  background: isDay
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.32), rgba(212,175,55,0.12))'
                    : 'rgba(255,255,255,0.04)',
                  border: isDay ? '1px solid rgba(212,175,55,0.6)' : `1px solid ${stemColor}40`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: isDay ? '0 0 20px rgba(212,175,55,0.25)' : 'none',
                }}>
                  <div style={{ fontSize: '22px', color: isDay ? 'var(--gold)' : stemColor, fontWeight: 700, lineHeight: 1 }}>
                    {pillar.heavenly}
                  </div>
                  <div style={{ fontSize: '8px', color: isDay ? 'var(--gold)' : stemColor, marginTop: '3px', opacity: 0.85 }}>
                    {analysis?.stemElement ?? ''}
                  </div>
                </div>

                {/* 천간 십신 */}
                <div style={{
                  fontSize: '9px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: isDay ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  border: isDay ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: isDay ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {analysis?.stemTenGod ?? '—'}
                </div>

                {/* 지지 */}
                <div style={{
                  width: '62px', height: '62px', borderRadius: '12px',
                  background: `${branchColor}14`,
                  border: `1px solid ${branchColor}38`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '20px', color: branchColor, fontWeight: 700, lineHeight: 1 }}>
                    {pillar.earthly}
                  </div>
                  <div style={{ fontSize: '8px', color: branchColor, marginTop: '3px', opacity: 0.85 }}>
                    {analysis?.branchElement ?? ''}
                  </div>
                </div>

                {/* 지지 십신 (본기 기준) */}
                <div style={{
                  fontSize: '9px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.55)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}>
                  {analysis?.branchTenGod ?? '—'}
                </div>

                {/* 지장간 */}
                {analysis?.hiddenStems?.length ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    marginTop: '2px',
                    maxWidth: '72px',
                  }}>
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
                      지장간
                    </span>
                    {analysis.hiddenStems.map((h, hi) => (
                      <div key={hi} style={{ fontSize: '9px', color: elColor(h.element), lineHeight: 1.4, textAlign: 'center' }}>
                        <span style={{ fontWeight: 700 }}>{h.char}</span>
                        <span style={{ opacity: 0.7, marginLeft: '3px' }}>{h.tenGod.replace(/\(.*\)/, '')}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        {/* 범례 */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '22px', height: '22px', borderRadius: '6px',
                background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)',
                fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)',
              }}
            >上</div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>천간(天干)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '22px', height: '22px', borderRadius: '6px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(212,175,55,0.7)',
              }}
            >下</div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>지지(地支)</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '22px', height: '22px', borderRadius: '6px',
                background: 'rgba(212,175,55,0.25)', border: '1px solid rgba(212,175,55,0.5)',
                fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)', fontWeight: 700,
              }}
            >日</div>
            <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>일간: {data.day_master.element}</span>
          </div>
        </div>
      </div>

      {/* ── 일간 설명 ── */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div
            style={{
              width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))',
              border: '1px solid rgba(212,175,55,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 2px 12px rgba(212,175,55,0.15)',
            }}
          >
            ☯
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gold)' }}>
                일간(日干) — {data.day_master.element}
              </span>
              <span
                style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.06)', borderRadius: '6px',
                  padding: '2px 8px', border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {data.day_master.character}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              {data.day_master.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── 오행 분포 ── */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '20px',
        }}
      >
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px', letterSpacing: '0.5px' }}>
          오행(五行) 분포
        </p>
        <div style={{ display: 'grid', gap: '12px' }}>
          {elementEntries.map(([key, value], i) => {
            const cfg = ELEMENT_COLORS[key];
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: '12px', fontWeight: 700, minWidth: '44px',
                    color: cfg.bg,
                  }}
                >
                  {cfg.label}
                </span>
                <div
                  style={{
                    flex: 1, height: '10px', borderRadius: '5px',
                    background: 'rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: cfg.bg,
                      borderRadius: '5px',
                      boxShadow: value > 0 ? `0 0 8px ${cfg.glow}` : 'none',
                    }}
                  />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', minWidth: '36px', textAlign: 'right' }}>
                  {value}%
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '18px' }}>
          <div
            style={{
              padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'rgba(34,197,94,0.8)', marginBottom: '5px', fontWeight: 600, letterSpacing: '0.5px' }}>✦ 용신(用神)</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{data.favorable_element}</p>
          </div>
          <div
            style={{
              padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'rgba(239,68,68,0.8)', marginBottom: '5px', fontWeight: 600, letterSpacing: '0.5px' }}>✦ 기신(忌神)</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{data.unfavorable_element}</p>
          </div>
        </div>
      </div>

      {/* ── 성격 요약 ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.01))',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: '14px',
          padding: '20px',
        }}
      >
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', marginBottom: '10px', letterSpacing: '0.5px' }}>
          사주 기질 요약
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.9 }}>
          {data.personality_summary}
        </p>
      </div>

      {/* ── 현재 대운 ── */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: '14px',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: '3px',
            background: 'linear-gradient(180deg, var(--gold), rgba(212,175,55,0.2))',
            borderRadius: '3px 0 0 3px',
          }}
        />
        <div style={{ paddingLeft: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gold)' }}>
              현재 대운(大運)
            </span>
            <span
              style={{
                fontSize: '12px', padding: '3px 10px', borderRadius: '20px',
                background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                color: 'rgba(212,175,55,0.9)', fontWeight: 600,
              }}
            >
              {data.current_luck_period.period}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {data.current_luck_period.element}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            {data.current_luck_period.influence}
          </p>
        </div>
      </div>
    </div>
  );
}
