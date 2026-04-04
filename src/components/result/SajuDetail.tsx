import type { SajuDetail as SajuDetailType } from '../../types';

interface Props {
  data: SajuDetailType;
}

const ELEMENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  wood:  { bg: '#22c55e', text: '#fff', label: '목(木)' },
  fire:  { bg: '#ef4444', text: '#fff', label: '화(火)' },
  earth: { bg: '#ca8a04', text: '#fff', label: '토(土)' },
  metal: { bg: '#94a3b8', text: '#0f172a', label: '금(金)' },
  water: { bg: '#3b82f6', text: '#fff', label: '수(水)' },
};

const PILLAR_LABELS = ['년주', '월주', '일주', '시주'];
const PILLAR_KEYS = ['year', 'month', 'day', 'hour'] as const;

export default function SajuDetail({ data }: Props) {
  const elements = data.five_elements;
  const elementEntries = Object.entries(elements) as [keyof typeof elements, number][];

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* ── 사주 원국 4주 테이블 ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1200 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          padding: '20px',
        }}
      >
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '16px' }}>
          사주 원국 四柱原局
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}
        >
          {PILLAR_KEYS.map((key, i) => {
            const pillar = data.four_pillars[key];
            const isDay = key === 'day';
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: isDay ? 'var(--gold)' : 'rgba(212,175,55,0.6)',
                    letterSpacing: '1px',
                    fontWeight: isDay ? 700 : 400,
                  }}
                >
                  {PILLAR_LABELS[i]}
                </span>
                {/* 천간 */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    background: isDay
                      ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))'
                      : 'rgba(255,255,255,0.04)',
                    border: isDay
                      ? '1px solid rgba(212,175,55,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    color: isDay ? 'var(--gold)' : 'var(--text)',
                    fontWeight: 700,
                  }}
                >
                  {pillar.heavenly}
                </div>
                {/* 지지 */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'rgba(212,175,55,0.7)',
                  }}
                >
                  {pillar.earthly}
                </div>
                <p
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.35)',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    maxWidth: '60px',
                  }}
                >
                  {pillar.meaning.length > 18 ? pillar.meaning.slice(0, 18) + '…' : pillar.meaning}
                </p>
              </div>
            );
          })}
        </div>

        {/* 천간/지지 범례 */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '14px',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '20px', height: '20px', borderRadius: '5px',
                background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)',
              }}
            >上</div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>천간(天干)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '20px', height: '20px', borderRadius: '5px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(212,175,55,0.7)',
              }}
            >下</div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>지지(地支)</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>일간</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{data.day_master.element}</span>
          </div>
        </div>
      </div>

      {/* ── 일간 설명 ── */}
      <div
        className="card"
        style={{ padding: '18px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
              border: '1px solid rgba(212,175,55,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            ☯
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>
                일간(日干) — {data.day_master.element}
              </span>
              <span
                style={{
                  fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.06)', borderRadius: '4px',
                  padding: '1px 6px',
                }}
              >
                {data.day_master.character}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {data.day_master.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── 오행 분포 ── */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px' }}>
          오행(五行) 분포
        </p>
        <div style={{ display: 'grid', gap: '10px' }}>
          {elementEntries.map(([key, value]) => {
            const cfg = ELEMENT_COLORS[key];
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '12px', fontWeight: 700, minWidth: '40px',
                    color: cfg.bg,
                  }}
                >
                  {cfg.label}
                </span>
                <div
                  style={{
                    flex: 1, height: '8px', borderRadius: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${value}%`,
                      background: cfg.bg,
                      borderRadius: '4px',
                      transition: 'width 0.8s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
                  {value}%
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
          <div
            style={{
              padding: '10px 12px', borderRadius: '10px',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'rgba(34,197,94,0.7)', marginBottom: '4px' }}>✦ 용신(用神)</p>
            <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{data.favorable_element}</p>
          </div>
          <div
            style={{
              padding: '10px 12px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'rgba(239,68,68,0.7)', marginBottom: '4px' }}>✦ 기신(忌神)</p>
            <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{data.unfavorable_element}</p>
          </div>
        </div>
      </div>

      {/* ── 성격 요약 ── */}
      <div
        className="card"
        style={{
          padding: '18px 20px',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.04), transparent)',
          border: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
          사주 기질 요약
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          {data.personality_summary}
        </p>
      </div>

      {/* ── 현재 대운 ── */}
      <div
        className="card"
        style={{ padding: '18px 20px', border: '1px solid rgba(212,175,55,0.2)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>
            현재 대운(大運)
          </span>
          <span
            style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
              color: 'rgba(212,175,55,0.8)',
            }}
          >
            {data.current_luck_period.period}
          </span>
          <span
            style={{
              fontSize: '12px', fontWeight: 700,
              color: 'var(--text)', marginLeft: '4px',
            }}
          >
            {data.current_luck_period.element}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          {data.current_luck_period.influence}
        </p>
      </div>
    </div>
  );
}
