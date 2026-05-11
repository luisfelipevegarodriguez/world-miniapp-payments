import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Run once at cold start — not on every request
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS used_nullifiers (
      nullifier_hash TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  tableReady = true;
}

// Initialize on module load
ensureTable().catch(console.error);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { payload } = req.body;
  if (!payload) return res.status(400).json({ success: false, error: 'Missing payload' });

  try {
    await ensureTable();

    // Anti-sybil: check duplicate nullifier
    const existing = await pool.query(
      'SELECT 1 FROM used_nullifiers WHERE nullifier_hash = $1',
      [payload.nullifier_hash]
    );
    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ success: false, error: 'Nullifier already used — duplicate human' });
    }

    const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
    // Action ID from env — never hardcoded
    const actionId = process.env.WORLD_ACTION_ID ?? 'verify-user';
    const result: IVerifyResponse = await verifyCloudProof(payload, appId, actionId);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.detail ?? 'Proof invalid' });
    }

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
