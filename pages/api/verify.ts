import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Ensure nullifier table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS used_nullifiers (
      nullifier_hash TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { payload } = req.body;
  if (!payload) return res.status(400).json({ success: false, error: 'Missing payload' });

  try {
    await ensureTable();

    // Check for duplicate nullifier (anti-sybil)
    const existing = await pool.query(
      'SELECT 1 FROM used_nullifiers WHERE nullifier_hash = $1',
      [payload.nullifier_hash]
    );
    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ success: false, error: 'Nullifier already used — duplicate human' });
    }

    // Verify with World ID cloud
    const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
    const result: IVerifyResponse = await verifyCloudProof(payload, appId, 'verify-user');

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.detail ?? 'Proof invalid' });
    }

    // Store nullifier to prevent reuse
    await pool.query(
      'INSERT INTO used_nullifiers (nullifier_hash) VALUES ($1)',
      [payload.nullifier_hash]
    );

    return res.status(200).json({ success: true });
  } catch (e: any) {
    console.error('[verify]', e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
