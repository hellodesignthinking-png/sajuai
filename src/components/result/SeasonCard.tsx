import { motion } from 'framer-motion';
import type { SeasonDetails, CareerSeason } from '../../types';

interface Props {
  season: CareerSeason;
  details: SeasonDetails;
}

// V67 minimal: flat white card, mono typography. Season distinguished by
// icon + label, not background color. Single lime accent on the title bar.
const SEASON_CONFIG: Record<CareerSeason, { icon: string; label: string; desc: string }> = {
  spring: { icon: '🌱', label: '봄', desc: '씨앗을 뿌리는 시기 · 준비와 투자의 계절' },
  summer: { icon: '🔥', label: '여름', desc: '폭발적 성장의 시기 · 전진과 확장의 계절' },
  autumn: { icon: '🍂', label: '가을', desc: '수확과 결실의 시기 · 마무리와 정리의 계절' },
  winter: { icon: '❄️', label: '겨울', desc: '내실을 다지는 시기 · 인내와 준비의 계절' },
};

export default function SeasonCard({ season, details }: Props) {
  const c = SEASON_CONFIG[season];
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid #84cc16',
      borderRadius: '20px',
      padding: '28px 24px',
    }}>
      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px' }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: '52px',
            lineHeight: 1,
            width: '72px', height: '72px',
            borderRadius: '18px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {c.icon}
        </motion.div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '10px', letterSpacing: '2.5px',
            color: 'var(--text-muted)', marginBottom: '4px',
            fontWeight: 800, textTransform: 'uppercase',
          }}>
            Current Season · 현재 커리어 계절
          </p>
          <h3 className="display-font" style={{
            fontSize: 'clamp(34px, 7vw, 44px)',
            fontWeight: 400,
            color: 'var(--text)',
            lineHeight: 1,
            letterSpacing: '-1px',
          }}>
            {c.label}
          </h3>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '8px',
            lineHeight: 1.5,
          }}>
            {c.desc}
          </p>
        </div>
      </div>

      {/* Period badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--bg)',
        border: '1px solid var(--border-strong)',
        borderRadius: '999px',
        padding: '5px 14px',
        marginBottom: '18px',
      }}>
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', fontWeight: 700 }}>
          📅 {details.year_range}
        </span>
      </div>

      {/* Advice & Warning */}
      <div style={{ display: 'grid', gap: '10px' }}>
        <div style={{
          background: 'var(--bg)',
          borderRadius: '12px',
          padding: '16px 18px',
          border: '1px solid var(--border)',
          borderLeft: '3px solid #84cc16',
        }}>
          <p style={{
            fontSize: '11px',
            color: '#3f6212',
            marginBottom: '8px',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>
            이 시기의 전략
          </p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', lineHeight: 1.85 }}>
            {details.advice}
          </p>
        </div>
        <div style={{
          background: 'var(--bg)',
          borderRadius: '12px',
          padding: '16px 18px',
          border: '1px solid var(--border)',
        }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginBottom: '8px',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>
            경계할 것
          </p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', lineHeight: 1.85 }}>
            {details.warning}
          </p>
        </div>
      </div>
    </div>
  );
}
