import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';

const DEV_PORTAL_URL = 'https://developer.worldcoin.org/api/v2/minikit/transaction';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { payload } = req.body as {
    payload: {
      transaction_id: string;
      reference: string;
      from: string;
      chain: string;
      status: string;
    };
  };

  if (!payload?.transaction_id) {
    return res.status(400).json({ error: 'Missing transaction_id' });
  }

  // 1. Verify with Developer Portal API
  const portalRes = await fetch(
    `${DEV_PORTAL_URL}/${payload.transaction_id}?app_id=${process.env.APP_ID}&type=payment`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    }
  );

  if (!portalRes.ok) {
    return res.status(502).json({ error: 'Developer Portal verification failed' });
  }

  const portalData = await portalRes.json();

  // 2. Validate reference, status and amount match DB record
  const { rows } = await pool.query(
    `SELECT * FROM payments WHERE reference = $1`,
    [payload.reference]
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Payment reference not found' });
  }

  if (portalData.status !== 'mined') {
    return res.status(202).json({ verified: false, portalStatus: portalData.status });
  }

  // 3. Mark as confirmed
  await pool.query(
    `UPDATE payments
     SET status = 'confirmed',
         transaction_id = $1,
         from_address = $2,
         chain = $3,
         updated_at = NOW()
     WHERE reference = $4`,
    [payload.transaction_id, payload.from, payload.chain, payload.reference]
  );

  return res.status(200).json({ verified: true, transactionId: payload.transaction_id });
}
