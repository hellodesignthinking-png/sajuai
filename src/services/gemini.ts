// Thin client for the server-side saju analysis API.
//
// Previously this file called Gemini directly from the browser using
// VITE_GEMINI_API_KEY. That exposed the key to every visitor and bypassed
// the V63 prompt logic that lives server-side in api/saju.ts.
//
// Now everything goes through /api/saju (POST). In production Vercel serves
// it as a serverless function; in dev, vite.config.ts proxies /api/* to
// dev-api-server.js on port 3001.
import type { UserInput, AnalysisResult } from '../types';

export interface CrossValidationResult {
  confidence: number;
  validated: boolean;
  message: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `서버 오류 (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      // non-JSON error body — keep default
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function analyzeCareer(
  input: UserInput,
  lang: 'ko' | 'en' = 'ko'
): Promise<AnalysisResult> {
  const data = await postJson<AnalysisResult>('/api/saju', {
    action: 'analyze',
    input,
    lang,
  });
  return data;
}

export async function crossValidateResult(
  input: UserInput,
  mainResult: AnalysisResult,
  lang: 'ko' | 'en' = 'ko'
): Promise<CrossValidationResult> {
  try {
    return await postJson<CrossValidationResult>('/api/saju', {
      action: 'validate',
      input,
      mainResult,
      lang,
    });
  } catch {
    return {
      confidence: 0,
      validated: false,
      message: lang === 'ko'
        ? 'AI 교차 검증을 수행할 수 없습니다.'
        : 'AI cross-validation unavailable.',
    };
  }
}
