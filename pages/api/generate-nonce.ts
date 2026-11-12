import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { getPool } from '@/lib/db';
import { notConfiguredBody } from '@/lib/config-status';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const pool = getPool();
  if (!pool) return res.status(503).json(notConfiguredBody());

  const reference = randomUUID();

  try {
    await pool.query(
      `INSERT INTO payments (reference, status) VALUES ($1, 'pending')`,
      [reference]
    );
    return res.status(200).json({ reference });
  } catch (e) {
    console.error('[generate-nonce]', e instanceof Error ? e.message : e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
