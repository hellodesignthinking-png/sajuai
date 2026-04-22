import { motion } from 'framer-motion';
import type { SeasonCycleItem, CareerSeason } from '../../types';

interface Props {
  cycle: SeasonCycleItem[];
  peakYear: number; // Top1 golden year
}

const SEASON_META: Record<CareerSeason, { icon: string; label: string }> = {
  spring: { icon: '🌱', label: '봄' },
  summer: { icon: '🔥', label: '여름' },
  autumn: { icon: '🍂', label: '가을' },
  winter: { icon: '❄️', label: '겨울' },
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
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '24px',
    }}>
      <div style={{ marginBottom: '22px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase' }}>
          커리어 12년 주기
        </p>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Top 전성기 <strong style={{ color: 'var(--text)' }}>{peakYear}년</strong>을 가을(황금기)로 역산한 12년 사이클
        </p>
      </div>

      {/* Horizontal timeline — minimal neutral with lime current marker */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {cycle.map((item, i) => {
          const meta = SEASON_META[item.season];
          const active = item.is_current;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                flex: '1 1 0',
                minWidth: '110px',
                padding: '16px 12px',
                background: active ? '#ecfccb' : 'var(--bg)',
                border: `1px solid ${active ? '#84cc16' : 'var(--border)'}`,
                borderRadius: '14px',
                position: 'relative',
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#84cc16',
                  color: '#1a1a1a',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  letterSpacing: '1.5px',
                  whiteSpace: 'nowrap',
                }}>
                  NOW
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: active ? '6px' : '0' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px', filter: active ? 'none' : 'grayscale(0.4)', opacity: active ? 1 : 0.7 }}>
                  {meta.icon}
                </span>
                <p className="display-font" style={{
                  fontSize: '18px',
                  fontWeight: 400,
                  color: 'var(--text)',
                  marginBottom: '4px',
                  letterSpacing: '-0.5px',
                }}>
                  {meta.label}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                  fontWeight: 600,
                }}>
                  {item.start_year}–{item.end_year}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                }}>
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
