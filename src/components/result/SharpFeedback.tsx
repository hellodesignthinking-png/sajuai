import { motion } from 'framer-motion';

interface Props {
  feedback: string;
}

// V67 minimal — flat white card, left lime accent bar, oversized quote mark.
export default function SharpFeedback({ feedback }: Props) {
  return (
    <div style={{
      position: 'relative',
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid #84cc16',
      borderRadius: '20px',
      padding: '32px 28px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: '22px' }}
        >
          ⚔️
        </motion.div>
        <p style={{
          fontSize: '11px',
          letterSpacing: '2.5px',
          color: 'var(--text-muted)',
          fontWeight: 800,
          textTransform: 'uppercase',
        }}>
          Sharp Insight · 핵심 인사이트
        </p>
      </div>

      {/* Oversized quote mark — typography-first accent */}
      <div className="display-font" style={{
        fontSize: '96px',
        color: '#e7e5e4',
        lineHeight: 0.8,
        marginBottom: '-20px',
        marginLeft: '-6px',
      }}>
        "
      </div>

      {/* Feedback text */}
      <p style={{
        fontSize: 'clamp(16px, 2.5vw, 18px)',
        lineHeight: 1.9,
        color: 'var(--text)',
        fontWeight: 500,
        position: 'relative',
        zIndex: 1,
      }}>
        {feedback}
      </p>

      <div style={{
        height: '1px',
        background: 'var(--border)',
        margin: '24px 0 14px',
      }} />

      <p style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        textAlign: 'right',
        letterSpacing: '1.5px',
        fontWeight: 700,
        textTransform: 'uppercase',
      }}>
        — 너튜유니온 SAJU
      </p>
    </div>
  );
}
