import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
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

    const { prompt, faceImageBase64, faceMimeType, palmImageBase64, palmMimeType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    // 멀티모달 파트 구성
    const parts: any[] = [{ text: prompt }];

    if (faceImageBase64 && faceMimeType) {
      parts.push({ text: "### 사용자 관상(얼굴) 사진 ###" });
      parts.push({ inlineData: { mimeType: faceMimeType, data: faceImageBase64 } });
    }
    if (palmImageBase64 && palmMimeType) {
      parts.push({ text: "### 사용자 손금(손바닥) 사진 ###" });
      parts.push({ inlineData: { mimeType: palmMimeType, data: palmImageBase64 } });
    }

    const geminiResult = await model.generateContent({
      contents: [{ role: 'user', parts }],
    });


    let rawText = geminiResult.response.text();

    // JSON 펜스 정리
    if (rawText.includes('```json')) {
      rawText = rawText.split('```json')[1].split('```')[0];
    } else if (rawText.includes('```')) {
      rawText = rawText.split('```')[1].split('```')[0];
    }
    rawText = rawText.trim();

    const parsed = JSON.parse(rawText);
    return res.status(200).json({ result: parsed });
  } catch (err: any) {
    console.error('[api/analyze] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
