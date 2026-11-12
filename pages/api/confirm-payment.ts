import type { NextApiRequest, NextApiResponse } from 'next';
import { getConfigStatus, notConfiguredBody, readEnv } from '@/lib/config-status';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!getConfigStatus().configured) {
    return res.status(503).json(notConfiguredBody());
  }

  const { payload, reference } = req.body ?? {};
  if (!payload || !reference) return res.status(400).json({ success: false, error: 'Missing params' });

  try {
    const appId = readEnv('NEXT_PUBLIC_APP_ID', 'NEXT_PUBLIC_WORLD_APP_ID', 'WORLD_APP_ID');
    const apiKey = readEnv('DEV_PORTAL_API_KEY', 'WORLD_API_KEY');
    if (!appId || !apiKey) return res.status(503).json(notConfiguredBody());

    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${appId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const tx = await response.json();

    if (tx.reference !== reference) {
      return res.status(400).json({ success: false, error: 'Reference mismatch' });
    }

    if (tx.status !== 'mined') {
      return res.status(400).json({ success: false, error: `TX not mined — status: ${tx.status}` });
    }

    return res.status(200).json({ success: true, transaction_id: payload.transaction_id });
  } catch (e: unknown) {
    console.error('[confirm-payment]', e instanceof Error ? e.message : e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
