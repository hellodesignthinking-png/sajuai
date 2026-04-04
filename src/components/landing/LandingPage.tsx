import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../../i18n';
import LanguageToggle from '../common/LanguageToggle';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const { t, lang } = useLang();
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle background
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

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.35 + 0.05,
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
          opacity: 0.7,
        }}
      />

      {/* Deep radial gradient — top center glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom gradient fade */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(0deg, var(--bg) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '900px',
          margin: '0 auto',
          padding: '20px 16px 100px',
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
            marginBottom: '40px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(212,175,55,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--gold)',
                letterSpacing: '1px',
                fontFamily: 'Noto Serif KR, serif',
              }}
            >
              {t.appName}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(212,175,55,0.5)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                paddingLeft: '10px',
                borderLeft: '1px solid rgba(212,175,55,0.2)',
              }}
            >
              AI 책사
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageToggle />
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  style={{
                    padding: '6px 14px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {lang === 'ko' ? '로그아웃' : 'Sign out'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  padding: '8px 18px',
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '20px',
                  color: 'var(--gold)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {lang === 'ko' ? '로그인' : 'Login'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '72px', padding: '20px 0 0' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: '28px' }}
          >
            <span className="tag" style={{ fontSize: '11px', letterSpacing: '3px' }}>
              ✦ {t.landing.badge}
            </span>
          </motion.div>

          {/* Decorative top line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              margin: '0 auto 28px',
            }}
          />

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: 'clamp(40px, 9vw, 76px)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '28px',
              letterSpacing: '-2px',
            }}
          >
            {lang === 'ko' ? (
              <>
                <span className="shimmer-gold">{t.landing.heroTitle1}</span>
                <br />
                <span style={{ color: 'var(--text)', fontWeight: 800 }}>
                  {t.landing.heroTitle2}
                </span>
                <br />
                <span style={{ color: 'var(--text)', fontWeight: 800 }}>
                  {t.landing.heroTitle3}
                </span>
              </>
            ) : (
              <>
                <span style={{ color: 'var(--text)' }}>{t.landing.heroTitle1}</span>
                <br />
                <span className="shimmer-gold">{t.landing.heroTitle3}</span>
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
              maxWidth: '500px',
              margin: '0 auto 20px',
              lineHeight: 1.9,
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
              letterSpacing: '2.5px',
              marginBottom: '48px',
              fontFamily: 'Noto Serif KR, Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            " {t.landing.quote} "
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}
          >
            <motion.button
              className="btn-primary"
              onClick={onStart}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontSize: '18px',
                padding: '18px 56px',
                borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(212,175,55,0.35)',
                letterSpacing: '0.5px',
              }}
            >
              {t.landing.ctaStart} →
            </motion.button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              {t.landing.ctaFree}
            </p>
          </motion.div>
        </div>

        {/* Ornament divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="ornament-divider"
          style={{ marginBottom: '48px' }}
        >
          ◆
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
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
              transition={{ delay: 0.8 + i * 0.08 }}
              whileHover={{ y: -3, borderColor: 'rgba(212,175,55,0.35)' }}
              style={{ textAlign: 'center', padding: '20px 16px' }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '6px',
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* What you get */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.02) 100%)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '20px',
            padding: '28px 24px',
            marginBottom: '48px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '4px',
              color: 'var(--gold)',
              marginBottom: '20px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            ◆ {t.landing.resultsLabel}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
            }}
          >
            {t.landing.resultItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>{item.text}</span>
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
          <div
            style={{
              padding: '32px 24px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))',
              borderRadius: '20px',
              border: '1px solid rgba(212,175,55,0.15)',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '20px',
                lineHeight: 1.8,
              }}
            >
              {lang === 'ko'
                ? '사주팔자 + 서양 점성술 + 수비학을 통합하여\n당신만의 커리어 전략을 제시합니다'
                : 'Combining Four Pillars, Astrology & Numerology\nfor your personalized career strategy'}
            </p>
            <button
              className="btn-primary"
              onClick={onStart}
              style={{ fontSize: '17px', padding: '16px 48px' }}
            >
              {t.landing.ctaBottom}
            </button>
          </div>
        </motion.div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
