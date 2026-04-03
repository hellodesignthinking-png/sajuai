import { useState, useCallback } from 'react';
import type { UserInput, AnalysisResult } from '../types';
import { analyzeCareer } from '../services/gemini';

export type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);

  const analyze = useCallback(async (input: UserInput) => {
    setState('loading');
    setError(null);
    setUserInput(input);

    try {
      const data = await analyzeCareer(input);
      setResult(data);
      setState('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      setError(message);
      setState('error');
    }
  }, []);

  const restore = useCallback((savedResult: AnalysisResult, savedInput: UserInput) => {
    setResult(savedResult);
    setUserInput(savedInput);
    setState('success');
  }, []);

  const retry = useCallback(() => {
    if (userInput) {
      analyze(userInput);
    }
  }, [userInput, analyze]);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
    setUserInput(null);
  }, []);

  return { state, result, error, userInput, analyze, restore, retry, reset };
}
