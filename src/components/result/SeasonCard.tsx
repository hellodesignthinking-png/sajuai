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
  bgColor: string;
  desc: string;
}> = {
  spring: {
    icon: '🌱',
    label: '봄',
    color: '#4ade80',
    bgColor: 'rgba(74, 222, 128, 0.08)',
    desc: '씨앗을 뿌리는 시기 · 준비와 투자의 계절',
  },
  summer: {
    icon: '🔥',
    label: '여름',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.08)',
    desc: '폭발적 성장의 시기 · 전진과 확장의 계절',
  },
  autumn: {
    icon: '🍂',
    label: '가을',
    color: '#D4AF37',
    bgColor: 'rgba(212, 175, 55, 0.08)',
    desc: '수확과 결실의 시기 · 마무리와 정리의 계절',
  },
  winter: {
    icon: '❄️',
    label: '겨울',
    color: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.08)',
    desc: '내실을 다지는 시기 · 인내와 준비의 계절',
  },
};

export default function SeasonCard({ season, details }: Props) {
  const config = SEASON_CONFIG[season];

  return (
    <div
      style={{
        background: config.bgColor,
        border: `1px solid ${config.color}33`,
        borderRadius: '16px',
        padding: '28px',
      }}
    >
      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ fontSize: '52px', lineHeight: 1 }}
        >
          {config.icon}
        </motion.div>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: config.color, marginBottom: '4px' }}>
            현재 커리어 계절
          </p>
          <h3
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: config.color,
              lineHeight: 1,
            }}
          >
            {config.label}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {config.desc}
          </p>
        </div>
      </div>

      {/* Period */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`,
          borderRadius: '20px',
          padding: '5px 14px',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '13px', color: config.color, fontWeight: 600 }}>
          📅 {details.year_range}
        </span>
      </div>

      {/* Advice & Warning */}
      <div style={{ display: 'grid', gap: '12px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '14px 16px',
            borderLeft: `3px solid ${config.color}`,
          }}
        >
          <p style={{ fontSize: '12px', color: config.color, marginBottom: '6px', fontWeight: 600 }}>
            💡 이 시기의 전략
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7 }}>
            {details.advice}
          </p>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '14px 16px',
            borderLeft: '3px solid rgba(239, 68, 68, 0.6)',
          }}
        >
          <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '6px', fontWeight: 600 }}>
            ⚠️ 경계할 것
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7 }}>
            {details.warning}
          </p>
        </div>
      </div>
    </div>
  );
}
