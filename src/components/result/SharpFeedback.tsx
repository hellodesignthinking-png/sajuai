import { motion } from 'framer-motion';

interface Props {
  feedback: string;
}

export default function SharpFeedback({ feedback }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0f0f0f, #161208)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '16px',
        padding: '32px',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ecfccb 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: '28px' }}
        >
          ⚔️
        </motion.div>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#65a30d', fontWeight: 600 }}>
            책사의 한마디
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            제갈량의 날카로운 조언
          </p>
        </div>
      </div>

      {/* Quote mark */}
      <div
        style={{
          fontSize: '60px',
          color: '#d9f99d',
          lineHeight: 1,
          marginBottom: '-10px',
          fontFamily: 'Georgia, serif',
        }}
      >
        "
      </div>

      {/* Feedback text */}
      <p
        style={{
          fontSize: 'clamp(15px, 2.5vw, 17px)',
          lineHeight: 1.9,
          color: 'var(--text)',
          fontStyle: 'italic',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {feedback}
      </p>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #84cc16, transparent)',
          margin: '20px 0 16px',
        }}
      />

      {/* Signature */}
      <p
        style={{
          fontSize: '13px',
          color: '#65a30d',
          textAlign: 'right',
          fontFamily: 'Noto Serif KR, serif',
        }}
      >
        — 제갈량 (AI 책사)
      </p>
    </div>
  );
}
