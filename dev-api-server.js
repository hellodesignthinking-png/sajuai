// Local dev server that mirrors the Vercel serverless handlers in /api/*.
// Vite's dev server proxies /api/* to http://localhost:3001 (see vite.config.ts).
// Run together in two terminals (or via `npm run dev:full`):
//   terminal A: node dev-api-server.js
//   terminal B: npm run dev
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Reuse the actual serverless handlers by wrapping them.
// We call default exports with {method, body, setHeader, status, json, end} shape.
function adaptHandler(handlerModulePath) {
  return async (req, res) => {
    try {
      const mod = await import(handlerModulePath);
      const handler = mod.default;
      // Vercel req/res shape is mostly a subset of Express — passing through works.
      await handler(req, res);
    } catch (err) {
      console.error(`[dev-api] Handler ${handlerModulePath} failed:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'dev handler failed' });
      }
    }
  };
}

app.post('/api/saju', adaptHandler('./api/saju.ts'));
app.post('/api/chat', adaptHandler('./api/chat.ts'));

// Legacy analyze endpoint (kept for FateChatbot if re-activated).
// Serves a minimal Gemini pass-through — only used by dev.
import { GoogleGenerativeAI } from '@google/generative-ai';
app.post('/api/analyze', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server API key not configured' });
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const r = await model.generateContent(prompt);
    let raw = r.response.text().replace(/```json\s*/g, '').replace(/```/g, '').trim();
    res.status(200).json({ result: JSON.parse(raw) });
  } catch (err) {
    console.error('[dev-api] /api/analyze error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`);
  console.log('  POST /api/saju    → api/saju.ts');
  console.log('  POST /api/chat    → api/chat.ts');
  console.log('  POST /api/analyze → legacy pass-through');
});
