import { motion } from 'framer-motion';
import type { SeasonCycleItem, CareerSeason } from '../../types';

interface Props {
  cycle: SeasonCycleItem[];
  peakYear: number; // Top1 golden year
}

const SEASON_META: Record<CareerSeason, { icon: string; label: string; color: string; bg: string }> = {
  spring: { icon: '🌱', label: '봄', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  summer: { icon: '🔥', label: '여름', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  autumn: { icon: '🍂', label: '가을', color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' },
  winter: { icon: '❄️', label: '겨울', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
};

const SEASON_DESC: Record<CareerSeason, string> = {
  spring: '뿌리 내리기 · 생존',
  summer: '양적 성장 · 치열한 경쟁',
  autumn: '수확 · 질적 성장',
  winter: '수렴 · 숙고',
};

export default function SeasonCycle({ cycle, peakYear }: Props) {
  if (!cycle?.length) return null;

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '4px' }}>
          커리어 12년 주기
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Top 전성기 <strong style={{ color: 'var(--gold)' }}>{peakYear}년</strong>을 가을(황금기)로 역산한 12년 사이클
        </p>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '4px' }}>
        {cycle.map((item, i) => {
          const meta = SEASON_META[item.season];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                flex: '0 0 auto',
                minWidth: '120px',
                maxWidth: '160px',
                padding: '14px 12px',
                background: item.is_current ? meta.bg : 'transparent',
                border: item.is_current
                  ? `1px solid ${meta.color}40`
                  : '1px solid transparent',
                borderRadius: '12px',
                marginRight: i < cycle.length - 1 ? '4px' : '0',
                position: 'relative',
              }}
            >
              {/* Current indicator */}
              {item.is_current && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: meta.color,
                    color: '#000',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '0 0 6px 6px',
                    letterSpacing: '1px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  현재
                </div>
              )}

              {/* Arrow connector */}
              {i < cycle.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    right: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--border)',
                    fontSize: '16px',
                    zIndex: 1,
                  }}
                >
                  →
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: item.is_current ? '8px' : '0' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>
                  {meta.icon}
                </span>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: item.is_current ? 700 : 500,
                    color: item.is_current ? meta.color : 'var(--text-muted)',
                    marginBottom: '2px',
                  }}
                >
                  {meta.label}
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    color: item.is_current ? 'var(--text)' : 'var(--text-muted)',
                    marginBottom: '4px',
                    opacity: item.is_current ? 1 : 0.6,
                  }}
                >
                  {item.start_year}–{item.end_year}
                </p>
                <p
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    opacity: item.is_current ? 1 : 0.5,
                  }}
                >
                  {SEASON_DESC[item.season]}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
