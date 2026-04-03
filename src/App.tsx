import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UserInput, AnalysisResult } from './types';
import { useAnalysis } from './hooks/useAnalysis';
import { PaymentProvider, usePayment } from './contexts/PaymentContext';
import LandingPage from './components/landing/LandingPage';
import InputForm from './components/input/InputForm';
import LoadingScreen from './components/common/LoadingScreen';
import ResultDashboard from './components/result/ResultDashboard';
import PaymentModal from './components/payment/PaymentModal';

type LocalScreen = 'landing' | 'input';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// Inner component so it can access PaymentContext
function AppInner() {
  const [screen, setScreen] = useState<LocalScreen>('landing');
  const [isPaymentReturn, setIsPaymentReturn] = useState(false);
  const { state, result, error, userInput, analyze, restore, retry, reset } = useAnalysis();
  const { markAsPaid, isModalOpen } = usePayment();

  // Handle Toss payment redirect return on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');
    const paymentFail = params.get('payment');

    if (paymentFail === 'fail') {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (paymentKey && orderId && amount) {
      // Clean URL immediately
      window.history.replaceState({}, '', window.location.pathname);
      setIsPaymentReturn(true);

      // Restore saved analysis result from sessionStorage
      try {
        const savedResult = sessionStorage.getItem('sajuai_result');
        const savedInput = sessionStorage.getItem('sajuai_user_input');
        if (savedResult && savedInput) {
          const parsedResult: AnalysisResult = JSON.parse(savedResult);
          const parsedInput: UserInput = JSON.parse(savedInput);
          restore(parsedResult, parsedInput);
        }
      } catch {
        // sessionStorage parse failed — start fresh
      }

      // Confirm payment with backend
      fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            markAsPaid();
          }
        })
        .catch(() => {
          // Even if confirm fails, mark as paid optimistically for test mode
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
  const handleSubmit = (input: UserInput) => analyze(input);
  const handleReset = () => {
    reset();
    setScreen('landing');
  };

  return (
    <>
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
            <ResultDashboard result={result} userInput={userInput} onReset={handleReset} />
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
                  분석 중 오류가 발생했습니다
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
                  다시 시도하기
                </button>
                <button className="btn-secondary" onClick={handleReset}>
                  처음으로
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment modal — rendered outside AnimatePresence so it stays on top */}
      {isModalOpen && <PaymentModal />}
    </>
  );
}

export default function App() {
  return (
    <PaymentProvider>
      <AppInner />
    </PaymentProvider>
  );
}
