import type { SeasonGuidance as SeasonGuidanceType, CareerSeason } from '../../types';

interface Props {
  guidance: SeasonGuidanceType;
  season: CareerSeason;
}

const SEASON_COLOR: Record<CareerSeason, string> = {
  spring: '#4ade80',
  summer: '#f97316',
  autumn: '#D4AF37',
  winter: '#60a5fa',
};

const SEASON_ICON: Record<CareerSeason, string> = {
  spring: '🌱',
  summer: '🔥',
  autumn: '🍂',
  winter: '❄️',
};

export default function SeasonGuidance({ guidance, season }: Props) {
  const color = SEASON_COLOR[season];
  const icon = SEASON_ICON[season];

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {/* Core message */}
      <div
        style={{
          background: `${color}08`,
          border: `1px solid ${color}25`,
          borderRadius: '14px',
          padding: '20px 22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '22px' }}>{icon}</span>
          <div>
            <p style={{ fontSize: '11px', color, letterSpacing: '2px', fontWeight: 600 }}>
              현재 계절 심층 가이드
            </p>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
              {guidance.season_title}
            </p>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, fontStyle: 'italic' }}>
          "{guidance.core_message}"
        </p>
      </div>

      {/* Actions + Warnings side by side on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {/* Actions */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px',
          }}
        >
          <p style={{ fontSize: '12px', color, fontWeight: 700, marginBottom: '12px', letterSpacing: '1px' }}>
            ✅ 지금 해야 할 것
          </p>
          <div style={{ display: 'grid', gap: '10px' }}>
            {guidance.actions.map((action, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: `${color}20`,
                    border: `1px solid ${color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    color,
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px',
          }}
        >
          <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, marginBottom: '12px', letterSpacing: '1px' }}>
            ⚠️ 피해야 할 것
          </p>
          <div style={{ display: 'grid', gap: '10px' }}>
            {guidance.warnings.map((warning, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: '14px',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  ✗
                </span>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{warning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transition warning */}
      {guidance.transition_warning && (
        <div
          style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '20px', flexShrink: 0 }}>🔔</span>
          <div>
            <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px' }}>
              계절 전환 경고
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
              {guidance.transition_warning}
            </p>
          </div>
        </div>
      )}

      {/* Content direction */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px 18px',
          display: 'grid',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>📢</span>
          <div>
            <p style={{ fontSize: '12px', color, fontWeight: 600, marginBottom: '4px' }}>
              지금 만들어야 할 콘텐츠 방향
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
              {guidance.content_direction}
            </p>
          </div>
        </div>
        <div
          style={{
            height: '1px',
            background: 'var(--border)',
          }}
        />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>🚫</span>
          <div>
            <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>
              피해야 할 콘텐츠 방향
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
              {guidance.avoid_content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
