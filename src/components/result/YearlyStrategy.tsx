import type { YearlyStrategy as YearlyStrategyType } from '../../types';

interface Props {
  data: YearlyStrategyType;
}

// V67 minimal — horizontal bar chart for quarters + neutral mission list.
export default function YearlyStrategy({ data }: Props) {
  const maxScore = Math.max(100, ...data.quarter_scores.map((q) => q.score));

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* ── Quarterly scores with bar visualization ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            분기별 전략
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            점수 0 — 100
          </p>
        </div>

        <div style={{ display: 'grid', gap: '18px' }}>
          {data.quarter_scores.map((q, i) => {
            const pct = Math.min(100, (q.score / maxScore) * 100);
            // Highlight top-scoring quarter with lime
            const isTop = q.score === Math.max(...data.quarter_scores.map((x) => x.score));
            return (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
                  <p className="display-font" style={{
                    fontSize: 'var(--fs-xl)',
                    fontWeight: 400,
                    color: 'var(--text)',
                    letterSpacing: '-0.5px',
                    minWidth: '58px',
                  }}>
                    {q.q.match(/Q\d/)?.[0]}
                  </p>
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                    {q.q.replace(/Q\d\s*/, '').replace(/[()]/g, '')}
                  </p>
                  <p className="display-font" style={{
                    fontSize: 'var(--fs-xl)',
                    fontWeight: 400,
                    color: isTop ? '#3f6212' : 'var(--text-muted)',
                    marginLeft: 'auto',
                    letterSpacing: '-0.5px',
                  }}>
                    {q.score}
                  </p>
                </div>
                <div style={{
                  height: '8px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: isTop ? '#84cc16' : '#1a1a1a',
                    borderRadius: '3px',
                    transition: 'width 1s ease-out',
                  }} />
                </div>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {q.strategy}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── D-Day callout ── */}
      {data.d_day?.date && (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid #84cc16',
          borderRadius: '20px',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
        }}>
          <div style={{
            width: '48px', height: '48px',
            borderRadius: '14px',
            background: '#ecfccb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}>
            📅
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#3f6212', marginBottom: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
              운명의 날 · D-Day
            </p>
            <p className="display-font" style={{ fontSize: 'var(--fs-2xl)', fontWeight: 400, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {data.d_day.date}
            </p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {data.d_day.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Missions (즉시 / 단기 / 장기) ── */}
      {data.missions?.length > 0 && (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px',
        }}>
          <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '18px', fontWeight: 800, textTransform: 'uppercase' }}>
            미션 목록
          </p>
          <div style={{ display: 'grid', gap: '10px' }}>
            {data.missions.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                padding: '16px 18px',
                background: 'var(--bg)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
              }}>
                <span style={{
                  flexShrink: 0,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 800,
                  background: 'var(--card)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  marginTop: '2px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  {m.type}
                </span>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', lineHeight: 1.75, flex: 1 }}>
                  {m.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
