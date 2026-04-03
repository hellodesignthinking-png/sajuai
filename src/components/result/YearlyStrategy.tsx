import type { YearlyStrategy as YearlyStrategyType } from '../../types';

interface Props {
  data: YearlyStrategyType;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#4ade80' : score >= 65 ? '#D4AF37' : '#f87171';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: `${color}18`,
        border: `1.5px solid ${color}40`,
        fontSize: '13px',
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}
    >
      {score}
    </span>
  );
}

export default function YearlyStrategy({ data }: Props) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Quarterly scores */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}
        >
          분기별 전략
        </p>
        <div style={{ display: 'grid', gap: '12px' }}>
          {data.quarter_scores.map((q, i) => (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}
            >
              <ScoreBadge score={q.score} />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--gold)',
                    marginBottom: '3px',
                  }}
                >
                  {q.q}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>
                  {q.strategy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* D-Day */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <span style={{ fontSize: '28px', flexShrink: 0 }}>📅</span>
        <div>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--gold)',
              marginBottom: '4px',
            }}
          >
            운명의 날
          </p>
          <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
            {data.d_day.date}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {data.d_day.description}
          </p>
        </div>
      </div>

      {/* Missions */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}
        >
          미션 목록
        </p>
        <div style={{ display: 'grid', gap: '10px' }}>
          {data.missions.map((m, i) => {
            const badgeColors: Record<string, string> = {
              즉시: '#ef4444',
              단기: '#f97316',
              장기: '#4ade80',
            };
            const color = badgeColors[m.type] || 'var(--gold)';
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.025)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: `${color}18`,
                    color,
                    border: `1px solid ${color}30`,
                    marginTop: '2px',
                  }}
                >
                  {m.type}
                </span>
                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, flex: 1 }}>
                  {m.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
