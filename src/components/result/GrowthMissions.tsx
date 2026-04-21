import { motion } from 'framer-motion';
import type { GrowthMission } from '../../types';

interface Props {
  missions: GrowthMission[];
}

const MISSION_CONFIG: Record<'crisis' | 'person' | 'skill', {
  icon: string;
  color: string;
  bg: string;
  label: string;
}> = {
  crisis: {
    icon: '⚡',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.07)',
    label: '극복할 위기',
  },
  person: {
    icon: '🤝',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.07)',
    label: '만나야 할 사람',
  },
  skill: {
    icon: '🎯',
    color: '#16a34a',
    bg: 'rgba(74,222,128,0.07)',
    label: '배워야 할 것',
  },
};

export default function GrowthMissions({ missions }: Props) {
  if (!missions?.length) return null;

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {missions.map((mission, i) => {
        const config = MISSION_CONFIG[mission.type] ?? {
          icon: '🎯',
          color: '#65a30d',
          bg: '#f7fee7',
          label: mission.label,
        };

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: config.bg,
              border: `1px solid ${config.color}25`,
              borderRadius: '14px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background icon */}
            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '56px',
                opacity: 0.07,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {config.icon}
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '22px' }}>{config.icon}</span>
              <div>
                <p style={{ fontSize: '10px', color: config.color, letterSpacing: '2px', fontWeight: 700 }}>
                  미션 {i + 1}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: config.color }}>
                  {mission.label || config.label}
                </p>
              </div>
            </div>

            {/* Content */}
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text)',
                lineHeight: 1.7,
                marginBottom: '14px',
              }}
            >
              {mission.content}
            </p>

            {/* Action */}
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                borderLeft: `3px solid ${config.color}`,
              }}
            >
              <p style={{ fontSize: '11px', color: config.color, fontWeight: 700, marginBottom: '3px', letterSpacing: '1px' }}>
                ▶ 지금 당장 할 것
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                {mission.action}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
