import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStart: () => void;
}

const FEATURES = [
  { icon: '🔯', title: '사주팔자 분석', desc: '천간지지로 타고난 운의 구조를 계산' },
  { icon: '♈', title: '서양 점성술', desc: '행성 위치와 하우스로 타이밍을 분석' },
  { icon: '🔢', title: '수비학', desc: '생년월일 수비학으로 인생 주기를 계산' },
];

const QUOTES = [
  '때를 아는 자가 천하를 얻는다',
  '知彼知己 百戰不殆',
  '지피지기 백전불태',
];

export default function LandingPage({ onStart }: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Subtle particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* Radial gradient overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212,175,55,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '860px',
          margin: '0 auto',
          padding: '40px 24px 80px',
        }}
      >
        {/* Nav */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '80px',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '2px',
            }}
          >
            AI 책사
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              letterSpacing: '1px',
            }}
          >
            CAREER STRATEGIST
          </span>
        </motion.div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: '32px' }}
          >
            <span className="tag" style={{ fontSize: '12px', letterSpacing: '2px' }}>
              ⚔️ 제갈량 AI 책사
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: 'clamp(36px, 8vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '24px',
              letterSpacing: '-1px',
            }}
          >
            <span className="gold-text">당신의 때</span>를
            <br />
            알아라
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              color: 'var(--text-muted)',
              maxWidth: '480px',
              margin: '0 auto 16px',
              lineHeight: 1.8,
            }}
          >
            지금이 봄인가, 겨울인가.
            <br />
            AI 책사가 사주·점성술·수비학으로
            <br />
            <strong style={{ color: 'var(--text)' }}>당신의 커리어 전략</strong>을 계산합니다.
          </motion.p>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              fontSize: '13px',
              color: 'var(--gold)',
              letterSpacing: '2px',
              marginBottom: '48px',
              fontFamily: 'Noto Serif KR, serif',
            }}
          >
            " {QUOTES[0]} "
          </motion.p>

          {/* CTA */}
          <motion.button
            className="btn-primary"
            onClick={onStart}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{ fontSize: '17px', padding: '16px 48px' }}
          >
            ⚔️ 지금 내 때 분석하기
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              marginTop: '16px',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            무료 · 약 30초 소요
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '80px',
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '8px',
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* What you get */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border-gold)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '60px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '3px',
              color: 'var(--gold)',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}
          >
            분석 결과
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              { icon: '🏆', text: '커리어 전성기 Top 5' },
              { icon: '📊', text: '생애 주기 운 그래프' },
              { icon: '🌸', text: '현재 커리어 계절' },
              { icon: '📅', text: '올해 분기별 전략' },
              { icon: '🧠', text: 'MBTI 시너지 분석' },
              { icon: '⚡', text: '책사의 날카로운 한마디' },
            ].map((item, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{ textAlign: 'center' }}
        >
          <button
            className="btn-primary"
            onClick={onStart}
            style={{ fontSize: '16px' }}
          >
            무료로 시작하기 →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
