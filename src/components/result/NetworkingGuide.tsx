import type { NetworkingGuide as NetworkingGuideType, CareerSeason } from '../../types';

interface Props {
  guide: NetworkingGuideType;
  season: CareerSeason;
}

const SEASON_COLOR: Record<CareerSeason, string> = {
  spring: '#737373',
  summer: '#404040',
  autumn: '#1a1a1a',
  winter: '#737373',
};

const SEASON_NETWORKING: Record<CareerSeason, string> = {
  spring: '🌱 봄 — 멘토를 찾아라',
  summer: '🔥 여름 — 경쟁자이자 동료',
  autumn: '🍂 가을 — 전략가 파트너 + 여름 사람',
  winter: '❄️ 겨울 — 지금은 자기 자신',
};

export default function NetworkingGuide({ guide, season }: Props) {
  const color = SEASON_COLOR[season];

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {/* Header */}
      <div
        style={{
          background: `${color}08`,
          border: `1px solid ${color}25`,
          borderRadius: '12px',
          padding: '16px 20px',
        }}
      >
        <p style={{ fontSize: '11px', color, letterSpacing: '2px', fontWeight: 600, marginBottom: '6px' }}>
          {SEASON_NETWORKING[season]}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7 }}>
          {guide.current_season_tip}
        </p>
      </div>

      {/* People to meet */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {guide.people_to_meet.map((person, i) => (
          <div
            key={i}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color }}>{person.type}</p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.6 }}>
              {person.reason}
            </p>
            <div
              style={{
                background: 'var(--bg)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                gap: '6px',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: '13px', color, flexShrink: 0 }}>→</span>
              <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{person.how}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Avoid */}
      {guide.avoid && (
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '18px', flexShrink: 0 }}>🙅</span>
          <div>
            <p style={{ fontSize: '12px', color: '#737373', fontWeight: 700, marginBottom: '4px' }}>
              지금 피해야 할 사람
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{guide.avoid}</p>
          </div>
        </div>
      )}
    </div>
  );
}
