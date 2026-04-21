import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import type { UserInput, AnalysisResult } from './types';
import { useAnalysis } from './hooks/useAnalysis';
import { PaymentProvider, usePayment } from './contexts/PaymentContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/landing/LandingPage';
import InputForm from './components/input/InputForm';
import LoadingScreen from './components/common/LoadingScreen';
import ResultDashboard from './components/result/ResultDashboard';
import PaymentModal from './components/payment/PaymentModal';
import AuthModal from './components/auth/AuthModal';
import MyResults from './components/auth/MyResults';
import Admin from './pages/Admin';
import { LangContext, translations } from './i18n';
import type { Lang } from './i18n';
import { crossValidateResult } from './services/gemini';
import type { CrossValidationResult } from './services/gemini';

type LocalScreen = 'landing' | 'input';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// ──────────────────────────────────────────────
// Notification helper (D-day alerts)
// ──────────────────────────────────────────────
function requestNotificationPermission(lang: Lang) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        const msg = lang === 'ko' ? 'D-day 알림이 설정되었습니다!' : 'D-day notifications enabled!';
        new Notification('AI 책사', { body: msg, icon: '/favicon.ico' });
      }
    });
  }
}

// ──────────────────────────────────────────────
// Admin analytics logger (no PII)
// ──────────────────────────────────────────────
function logAnalysis(input: UserInput) {
  try {
    const total = parseInt(localStorage.getItem('sajuai_total_analyses') ?? '0', 10) + 1;
    localStorage.setItem('sajuai_total_analyses', String(total));

    const rawLogs = localStorage.getItem('sajuai_analysis_logs');
    const logs = rawLogs ? JSON.parse(rawLogs) : [];
    const decade = `${Math.floor(input.birthYear / 10) * 10}s`;
    logs.push({
      time: new Date().toLocaleString('ko-KR'),
      mbti: input.mbti,
      gender: input.gender,
      birthDecade: decade,
    });
    // Keep last 100 logs
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem('sajuai_analysis_logs', JSON.stringify(logs));
  } catch {
    // localStorage may be disabled
  }
}

// ──────────────────────────────────────────────
// Auth button (top-right overlay)
// ──────────────────────────────────────────────
function AuthButton({
  onOpenAuth,
  onOpenMyResults,
}: {
  onOpenAuth: () => void;
  onOpenMyResults: () => void;
}) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) {
    return (
      <button
        className="no-print"
        onClick={onOpenAuth}
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 1000,
          padding: '7px 14px', fontSize: '13px', fontWeight: 600,
          background: '#ffffff', border: '1px solid #e7e5e4',
          borderRadius: '999px', color: '#3f6212', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        로그인
      </button>
    );
  }

  return (
    <div className="no-print" style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 1000 }}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          padding: '6px 12px', fontSize: '13px', fontWeight: 600,
          background: '#ffffff', border: '1px solid #e7e5e4',
          borderRadius: '999px', color: '#3f6212', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        <span style={{
          width: '22px', height: '22px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', color: '#000', fontWeight: 800,
        }}>
          {(user.email?.[0] ?? '?').toUpperCase()}
        </span>
        {user.email?.split('@')[0]}
      </button>

      {menuOpen && (
        <div
          style={{
            position: 'absolute', top: '40px', left: 0,
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: '12px', minWidth: '180px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => { setMenuOpen(false); onOpenMyResults(); }}
            style={{
              width: '100%', padding: '11px 16px', textAlign: 'left',
              background: 'none', border: 'none', color: 'var(--text)',
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            📁 내 분석 기록
          </button>
          <div style={{ height: '1px', background: 'var(--border)' }} />
          <button
            onClick={() => { setMenuOpen(false); signOut(); }}
            style={{
              width: '100%', padding: '11px 16px', textAlign: 'left',
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main app (inside providers)
// ──────────────────────────────────────────────
function AppInner() {
  const [screen, setScreen] = useState<LocalScreen>('landing');
  const [isPaymentReturn, setIsPaymentReturn] = useState(false);
  const [validation, setValidation] = useState<CrossValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('sajuai_lang') as Lang) ?? 'ko';
    } catch {
      return 'ko';
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [myResultsOpen, setMyResultsOpen] = useState(false);

  const { state, result, error, userInput, analyze, restore, retry, reset } = useAnalysis();
  const { markAsPaid, isModalOpen } = usePayment();

  const t = translations[lang];

  // Persist language choice
  useEffect(() => {
    try { localStorage.setItem('sajuai_lang', lang); } catch { /* storage disabled */ }
  }, [lang]);

  // Request notification permission after successful analysis
  useEffect(() => {
    if (state === 'success' && result && userInput) {
      requestNotificationPermission(lang);
    }
  }, [state, result, userInput, lang]);

  // Cross-validate when result is ready
  useEffect(() => {
    if (state === 'success' && result && userInput) {
      setIsValidating(true);
      crossValidateResult(userInput, result, lang)
        .then((v) => setValidation(v))
        .finally(() => setIsValidating(false));
    } else {
      setValidation(null);
    }
  }, [state, result, userInput, lang]);

  // Handle Toss payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');
    const paymentFail = params.get('payment');

    if (paymentFail === 'fail') {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (paymentKey && orderId && amount) {
      window.history.replaceState({}, '', window.location.pathname);
      setIsPaymentReturn(true);

      try {
        const savedResult = sessionStorage.getItem('sajuai_result');
        const savedInput = sessionStorage.getItem('sajuai_user_input');
        if (savedResult && savedInput) {
          const parsedResult: AnalysisResult = JSON.parse(savedResult);
          const parsedInput: UserInput = JSON.parse(savedInput);
          restore(parsedResult, parsedInput);
        }
      } catch {
        // sessionStorage parse failed
      }

      fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            markAsPaid();
            try {
              const payments = parseInt(localStorage.getItem('sajuai_total_payments') ?? '0', 10) + 1;
              localStorage.setItem('sajuai_total_payments', String(payments));
            } catch { /* storage disabled */ }
          }
        })
        .catch((err) => {
          // Only mark paid when Toss redirected here with valid params — payment was already
          // charged on Toss side; we grant access to avoid blocking a paying user due to
          // a transient server/network error.
          console.error('[Payment confirm error]', err);
          markAsPaid();
        })
        .finally(() => {
          setIsPaymentReturn(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  type View = 'landing' | 'input' | 'loading' | 'result' | 'error';
  const view: View =
    isPaymentReturn ? 'loading'
    : state === 'loading' ? 'loading'
    : state === 'success' && result ? 'result'
    : state === 'error' ? 'error'
    : screen;

  const handleStart = () => setScreen('input');
  const handleBack = () => setScreen('landing');
  const handleSubmit = (input: UserInput) => {
    logAnalysis(input);
    analyze(input, lang);
  };
  const handleReset = () => {
    reset();
    setValidation(null);
    setScreen('landing');
  };

  const handleRestoreFromHistory = (restoredInput: UserInput, restoredResult: AnalysisResult) => {
    restore(restoredResult, restoredInput);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <>
        {/* Auth button — always visible */}
        <AuthButton
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenMyResults={() => setMyResultsOpen(true)}
        />

        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div key="landing" {...pageTransition}>
              <LandingPage onStart={handleStart} />
            </motion.div>
          )}

          {view === 'input' && (
            <motion.div key="input" {...pageTransition}>
              <InputForm onSubmit={handleSubmit} onBack={handleBack} />
            </motion.div>
          )}

          {view === 'loading' && (
            <motion.div key="loading" {...pageTransition}>
              <LoadingScreen />
            </motion.div>
          )}

          {view === 'result' && result && userInput && (
            <motion.div key="result" {...pageTransition}>
              {/* Cross-validation badge */}
              {(isValidating || validation) && (
                <div className="no-print" style={{
                  position: 'fixed', top: '16px', right: '16px', zIndex: 1000,
                  background: isValidating ? 'rgba(0,0,0,0.7)' : 'rgba(20,20,20,0.95)',
                  border: `1px solid ${validation && !validation.validated ? 'rgba(239,68,68,0.4)' : 'rgba(212,175,55,0.4)'}`,
                  borderRadius: '20px', padding: '6px 14px',
                  fontSize: '12px',
                  color: isValidating
                    ? 'var(--text-muted)'
                    : validation && !validation.validated
                    ? '#f87171'
                    : 'var(--gold)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {isValidating ? (
                    <>{lang === 'ko' ? 'AI 교차 검증 중...' : 'AI cross-validating...'}</>
                  ) : validation ? (
                    <>{validation.message}</>
                  ) : null}
                </div>
              )}
              <ResultDashboard
                result={result}
                userInput={userInput}
                onReset={handleReset}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            </motion.div>
          )}

          {view === 'error' && (
            <motion.div key="error" {...pageTransition}>
              <div
                style={{
                  minHeight: '100vh',
                  background: 'var(--bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  gap: '24px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '48px' }}>⚠️</span>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                    {t.error.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      maxWidth: '400px',
                      lineHeight: 1.7,
                    }}
                  >
                    {error}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={retry}>
                    {t.error.retry}
                  </button>
                  <button className="btn-secondary" onClick={handleReset}>
                    {t.error.home}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isModalOpen && <PaymentModal />}
        {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        {myResultsOpen && (
          <MyResults
            onClose={() => setMyResultsOpen(false)}
            onRestore={handleRestoreFromHistory}
          />
        )}
      </>
    </LangContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Root with routing
// ──────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <PaymentProvider>
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="/*" element={<AppInner />} />
            </Routes>
          </PaymentProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
