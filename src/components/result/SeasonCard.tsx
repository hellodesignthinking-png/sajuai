import { motion } from 'framer-motion';
import type { SeasonDetails, CareerSeason } from '../../types';

interface Props {
  season: CareerSeason;
  details: SeasonDetails;
}

const SEASON_CONFIG: Record<CareerSeason, {
  icon: string;
  label: string;
  color: string;
  gradientBg: string;
  borderColor: string;
  desc: string;
}> = {
  spring: {
    icon: '🌱',
    label: '봄',
    color: '#4ade80',
    gradientBg: 'linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(34,197,94,0.04) 60%, transparent 100%)',
    borderColor: 'rgba(74,222,128,0.3)',
    desc: '씨앗을 뿌리는 시기 · 준비와 투자의 계절',
  },
  summer: {
    icon: '🔥',
    label: '여름',
    color: '#f97316',
    gradientBg: 'linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(239,68,68,0.04) 60%, transparent 100%)',
    borderColor: 'rgba(249,115,22,0.35)',
    desc: '폭발적 성장의 시기 · 전진과 확장의 계절',
  },
  autumn: {
    icon: '🍂',
    label: '가을',
    color: '#84cc16',
    gradientBg: 'linear-gradient(135deg, #ecfccb 0%, #f7fee7 60%, transparent 100%)',
    borderColor: '#84cc16',
    desc: '수확과 결실의 시기 · 마무리와 정리의 계절',
  },
  winter: {
    icon: '❄️',
    label: '겨울',
    color: '#60a5fa',
    gradientBg: 'linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(59,130,246,0.04) 60%, transparent 100%)',
    borderColor: 'rgba(96,165,250,0.3)',
    desc: '내실을 다지는 시기 · 인내와 준비의 계절',
  },
};

export default function SeasonCard({ season, details }: Props) {
  const config = SEASON_CONFIG[season];

  return (
    <div
      style={{
        background: config.gradientBg,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '18px',
        padding: '28px 24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 4px 32px ${config.borderColor}`,
      }}
    >
      {/* Decorative corner glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${config.color}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: '56px',
            lineHeight: 1,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
          }}
        >
          {config.icon}
        </motion.div>
        <div>
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '4px',
              color: config.color,
              marginBottom: '6px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            현재 커리어 계절
          </p>
          <h3
            style={{
              fontSize: '36px',
              fontWeight: 900,
              color: config.color,
              lineHeight: 1,
              letterSpacing: '-1px',
              textShadow: `0 0 20px ${config.color}40`,
            }}
          >
            {config.label}
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '6px',
              lineHeight: 1.5,
            }}
          >
            {config.desc}
          </p>
        </div>
      </div>

      {/* Period badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: `${config.color}12`,
          border: `1px solid ${config.color}35`,
          borderRadius: '20px',
          padding: '6px 16px',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '14px', color: config.color, fontWeight: 700 }}>
          📅 {details.year_range}
        </span>
      </div>

      {/* Advice & Warning */}
      <div style={{ display: 'grid', gap: '10px' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(4px)',
            borderRadius: '12px',
            padding: '16px 18px',
            borderLeft: `3px solid ${config.color}`,
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: config.color,
              marginBottom: '7px',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            💡 이 시기의 전략
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8 }}>
            {details.advice}
          </p>
        </div>
        <div
          style={{
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(4px)',
            borderRadius: '12px',
            padding: '16px 18px',
            borderLeft: '3px solid rgba(239,68,68,0.6)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: '#f87171',
              marginBottom: '7px',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            ⚠️ 경계할 것
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8 }}>
            {details.warning}
          </p>
        </div>
      </div>
    </div>
  );
}
