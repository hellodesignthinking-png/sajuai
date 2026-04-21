import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../../i18n';
import LanguageToggle from '../common/LanguageToggle';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

interface LandingPageProps {
  onStart: () => void;
}

// Careet-style editorial landing — white bg, lime accent, minimal chrome.
export default function LandingPage({ onStart }: LandingPageProps) {
  const { t, lang } = useLang();
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
    }}>
      {/* ── Sticky top nav ─────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'saturate(180%) blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#84cc16',
              boxShadow: '0 0 0 3px #ecfccb',
            }} />
            <span style={{
              fontSize: '18px',
              fontWeight: 900,
              color: 'var(--text)',
              letterSpacing: '-0.5px',
            }}>
              {t.appName}
            </span>
            <span style={{
              fontSize: '10px',
              color: '#3f6212',
              letterSpacing: '2px',
              fontWeight: 700,
              background: '#ecfccb',
              padding: '3px 8px',
              borderRadius: '6px',
            }}>
              {t.tagline}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageToggle />
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '12px', color: 'var(--text-muted)',
                  maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  style={{
                    padding: '6px 14px',
                    background: 'transparent',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '999px',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
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
                  background: '#84cc16',
                  border: 'none',
                  borderRadius: '999px',
                  color: '#1a1a1a',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {lang === 'ko' ? '로그인' : 'Login'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '56px 20px 100px',
      }}>
        {/* ── HERO — editorial kicker + big headline ───── */}
        <section style={{ marginBottom: '64px' }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              marginBottom: '24px',
              background: '#ecfccb',
              borderRadius: '999px',
              fontSize: '11px',
              letterSpacing: '2px',
              fontWeight: 800,
              color: '#3f6212',
              textTransform: 'uppercase',
            }}
          >
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#84cc16',
            }} />
            {t.landing.badge}
          </motion.div>

          <motion.h1
            className="display-font"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{
              fontSize: 'clamp(42px, 9vw, 72px)',
              fontWeight: 400,
              lineHeight: 1.05,
              marginBottom: '20px',
              letterSpacing: '-2px',
              color: 'var(--text)',
            }}
          >
            {lang === 'ko' ? (
              <>
                {t.landing.heroTitle1}<br />
                {t.landing.heroTitle2}{' '}
                <span style={{ color: '#65a30d' }}>{t.landing.heroTitle3}</span>
              </>
            ) : (
              <>
                {t.landing.heroTitle1}<br />
                <span style={{ color: '#65a30d' }}>{t.landing.heroTitle3}</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{
              fontSize: 'clamp(16px, 2.4vw, 18px)',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              lineHeight: 1.75,
              marginBottom: '12px',
              fontWeight: 500,
            }}
          >
            {t.landing.subtitle1} {t.landing.subtitle2}{' '}
            <strong style={{ color: 'var(--text)' }}>{t.landing.subtitle3strong}</strong>
            {t.landing.subtitle3end}
          </motion.p>

          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            style={{
              margin: '20px 0 32px',
              paddingLeft: '16px',
              borderLeft: '3px solid #84cc16',
              fontSize: '14px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              letterSpacing: '0.2px',
            }}
          >
            " {t.landing.quote} "
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
          >
            <button
              onClick={onStart}
              style={{
                padding: '16px 36px',
                background: '#84cc16',
                border: 'none',
                borderRadius: '14px',
                color: '#1a1a1a',
                fontSize: '17px',
                fontWeight: 900,
                cursor: 'pointer',
                letterSpacing: '-0.2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#65a30d'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#84cc16'; e.currentTarget.style.color = '#1a1a1a'; }}
            >
              {t.landing.ctaStart} <span style={{ fontSize: '20px' }}>→</span>
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              ✓ {t.landing.ctaFree}
            </span>
          </motion.div>
        </section>

        {/* ── Feature tiles — careet-style card grid ───── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ marginBottom: '72px' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '20px',
          }}>
            <span style={{ width: '4px', height: '16px', background: '#84cc16', borderRadius: '2px' }} />
            <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#3f6212', fontWeight: 800, textTransform: 'uppercase' }}>
              Features
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}>
            {t.landing.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                style={{
                  padding: '22px 18px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'default',
                }}
                whileHover={{ y: -4, borderColor: '#84cc16' }}
              >
                <div style={{
                  width: '44px', height: '44px',
                  borderRadius: '12px',
                  background: '#ecfccb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '14px',
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--text)',
                  marginBottom: '6px',
                  letterSpacing: '-0.2px',
                }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── What you get — editorial callout block ───── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            background: '#ecfccb',
            borderRadius: '22px',
            padding: '32px 28px',
            marginBottom: '72px',
          }}
        >
          <p style={{
            fontSize: '11px', letterSpacing: '2.5px', color: '#3f6212',
            marginBottom: '18px', textTransform: 'uppercase', fontWeight: 800,
          }}>
            ◆ {t.landing.resultsLabel}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
          }}>
            {t.landing.resultItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '12px',
                border: '1px solid rgba(132,204,22,0.3)',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Bottom CTA block ────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          style={{
            padding: '40px 24px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '22px',
            textAlign: 'center',
            boxShadow: 'var(--shadow)',
          }}
        >
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '22px',
            lineHeight: 1.8,
          }}>
            {lang === 'ko'
              ? '사주팔자 + 서양 점성술 + 수비학을 통합하여\n당신만의 커리어 전략을 제시합니다'
              : 'Combining Four Pillars, Astrology & Numerology\nfor your personalized career strategy'}
          </p>
          <button
            onClick={onStart}
            style={{
              padding: '16px 44px',
              background: '#84cc16',
              border: 'none',
              borderRadius: '14px',
              color: '#1a1a1a',
              fontSize: '16px',
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: '-0.2px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#65a30d'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#84cc16'; e.currentTarget.style.color = '#1a1a1a'; }}
          >
            {t.landing.ctaBottom}
          </button>
        </motion.section>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
