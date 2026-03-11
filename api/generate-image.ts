import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export const config = {
  maxDuration: 120, // 이미지 생성은 오래 걸릴 수 있음
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server API key not configured' });
    }

    const { prompt, faceImageBase64, faceMimeType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const genAI = new GoogleGenAI({ apiKey });

    const modelNames = [
      'gemini-3.1-flash-lite-preview',
      'gemini-2.5-flash',
    ];


    // 멀티모달 컨텐츠 구성
    let contents: any;
    if (faceImageBase64 && faceMimeType) {
      contents = [
        { text: prompt },
        { inlineData: { mimeType: faceMimeType, data: faceImageBase64 } },
      ];
    } else {
      contents = prompt;
    }

    for (const modelName of modelNames) {
      try {
        console.log(`[api/generate-image] 모델 ${modelName} 시도...`);

        const response = await genAI.models.generateContent({
          model: modelName,
          contents,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
              console.log(`[api/generate-image] ✅ 이미지 생성 성공 (${modelName})`);
              return res.status(200).json({
                imageBase64: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
              });
            }
          }
        }

        console.warn(`[api/generate-image] ${modelName} 응답에 이미지 없음`);
      } catch (modelErr: any) {
        console.warn(`[api/generate-image] ${modelName} 실패:`, modelErr.message || modelErr);
        continue;
      }
    }

    return res.status(500).json({ error: '모든 이미지 생성 모델 시도 실패' });
  } catch (err: any) {
    console.error('[api/generate-image] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
