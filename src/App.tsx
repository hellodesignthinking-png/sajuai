import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UserInput } from './types';
import { useAnalysis } from './hooks/useAnalysis';
import LandingPage from './components/landing/LandingPage';
import InputForm from './components/input/InputForm';
import LoadingScreen from './components/common/LoadingScreen';
import ResultDashboard from './components/result/ResultDashboard';

type LocalScreen = 'landing' | 'input';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export default function App() {
  const [screen, setScreen] = useState<LocalScreen>('landing');
  const { state, result, error, userInput, analyze, retry, reset } = useAnalysis();

  // Derive the active view: analysis state takes precedence over local screen
  type View = 'landing' | 'input' | 'loading' | 'result' | 'error';
  const view: View =
    state === 'loading' ? 'loading'
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
  );
}
