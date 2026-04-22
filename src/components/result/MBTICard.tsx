import type { MBTIIntegration } from '../../types';

interface Props {
  data: MBTIIntegration;
}

export default function MBTICard({ data }: Props) {
  const isUnknown = data.type === '모름' || data.type === 'MBTI 모름';

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px' }}>🧠</span>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)' }}>
            MBTI 시너지
          </p>
          {!isUnknown && (
            <span
              style={{
                fontSize: '18px',
                fontWeight: 900,
                color: '#65a30d',
              }}
            >
              {data.type}
            </span>
          )}
        </div>
      </div>

      {isUnknown ? (
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          MBTI를 입력하면 더 정밀한 커리어 시너지 분석을 받을 수 있습니다.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {/* Career Synergy */}
          <div
            style={{
              background: '#f7fee7',
              border: '1px solid #d9f99d',
              borderRadius: '10px',
              padding: '14px 16px',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#65a30d',
                fontWeight: 600,
                marginBottom: '8px',
                letterSpacing: '0.5px',
              }}
            >
              ✨ 사주 × MBTI 시너지
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7 }}>
              {data.career_synergy}
            </p>
          </div>

          {/* Blind Spot */}
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 16px',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#737373',
                fontWeight: 600,
                marginBottom: '8px',
                letterSpacing: '0.5px',
              }}
            >
              🎯 맹점 (Blind Spot)
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7 }}>
              {data.blind_spot}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
