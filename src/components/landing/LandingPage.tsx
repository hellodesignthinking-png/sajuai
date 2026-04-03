import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../../i18n';
import LanguageToggle from '../common/LanguageToggle';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const { t, lang } = useLang();
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
          padding: '24px 16px 80px',
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
            marginBottom: '48px',
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
            {t.appName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                letterSpacing: '1px',
              }}
            >
              {t.tagline}
            </span>
            <LanguageToggle />
          </div>
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
              {t.landing.badge}
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
            {lang === 'ko' ? (
              <>
                <span className="gold-text">{t.landing.heroTitle1}</span>
                {t.landing.heroTitle2}
                <br />
                {t.landing.heroTitle3}
              </>
            ) : (
              <>
                {t.landing.heroTitle1}
                <br />
                <span className="gold-text">{t.landing.heroTitle3}</span>
              </>
            )}
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
            {t.landing.subtitle1}
            <br />
            {t.landing.subtitle2}
            <br />
            <strong style={{ color: 'var(--text)' }}>{t.landing.subtitle3strong}</strong>
            {t.landing.subtitle3end}
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
            " {t.landing.quote} "
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
            {t.landing.ctaStart}
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
            {t.landing.ctaFree}
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          {t.landing.features.map((f, i) => (
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
            padding: '24px 16px',
            marginBottom: '48px',
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
            {t.landing.resultsLabel}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
            }}
          >
            {t.landing.resultItems.map((item, i) => (
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
            {t.landing.ctaBottom}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
