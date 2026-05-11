import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { payload, reference } = req.body;
  if (!payload || !reference) return res.status(400).json({ success: false, error: 'Missing params' });

  try {
    const appId = process.env.NEXT_PUBLIC_APP_ID as string;
    if (!appId) throw new Error('NEXT_PUBLIC_APP_ID not configured');

    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${appId}`,
      { headers: { Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}` } }
    );
    const tx = await response.json();

    if (tx.reference !== reference) {
      return res.status(400).json({ success: false, error: 'Reference mismatch' });
    }

    // Strict status check — pending/failed both rejected
    if (tx.status !== 'mined') {
      return res.status(400).json({ success: false, error: `TX not mined — status: ${tx.status}` });
    }

    return res.status(200).json({ success: true, transaction_id: payload.transaction_id });
  } catch (e: any) {
    console.error('[confirm-payment]', e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
