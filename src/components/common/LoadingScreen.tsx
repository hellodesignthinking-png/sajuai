import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  '사주팔자를 계산하는 중...',
  '천간지지를 분석하는 중...',
  '서양 점성술을 대조하는 중...',
  '수비학 에너지를 계산하는 중...',
  '운의 흐름을 종합하는 중...',
  '커리어 전략을 수립하는 중...',
  '핵심 인사이트를 준비하는 중...',
];

export default function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '48px',
        padding: '24px',
      }}
    >
      {/* Animated mandala */}
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        {/* Outer ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid #d9f99d',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
        {/* Mid ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: '50%',
            border: '1px solid #84cc16',
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 40,
            borderRadius: '50%',
            border: '2px solid #65a30d',
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center symbol */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚔️
        </motion.div>
        {/* Orbiting dots */}
        {[0, 90, 180, 270].map((deg) => (
          <motion.div
            key={deg}
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#84cc16',
              top: '50%',
              left: '50%',
              marginTop: -3,
              marginLeft: -3,
            }}
            animate={{ rotate: [deg, deg + 360] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
            transformTemplate={({ rotate }) =>
              `rotate(${rotate}) translateX(80px)`
            }
          />
        ))}
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontSize: '13px',
            letterSpacing: '4px',
            color: '#65a30d',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: 500,
          }}
        >
          SAJU 분석 중
        </p>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '8px',
          }}
        >
          당신의 때를 계산하고 있습니다
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          AI가 사주, 점성술, 수비학을 종합 분석합니다
        </p>
      </div>

      {/* Step indicator */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px 24px',
          minWidth: '300px',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ color: '#65a30d', marginRight: '8px' }}>◆</span>
            {STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>
        {/* Progress dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '16px',
          }}
        >
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              style={{
                width: i === stepIndex ? 20 : 6,
                height: 6,
                borderRadius: '3px',
                background: i === stepIndex ? '#65a30d' : 'var(--border)',
              }}
              animate={{ width: i === stepIndex ? 20 : 6 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
