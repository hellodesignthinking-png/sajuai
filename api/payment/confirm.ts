import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { paymentKey, orderId, amount } = req.body ?? {};

  if (!paymentKey || !orderId || !amount) {
    return res.status(400).json({ message: '필수 파라미터가 없습니다.' });
  }

  const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_docs_OePea1d5RRpd5Wv7PDr8gLzN97Eon';
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');

  try {
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    });

    const data = await tossRes.json();

    if (tossRes.ok) {
      return res.status(200).json({ success: true, payment: data });
    }

    return res.status(tossRes.status).json({ success: false, message: data.message });
  } catch (err) {
    console.error('[payment/confirm]', err);
    return res.status(500).json({ success: false, message: '결제 확인 중 오류가 발생했습니다.' });
  }
}
