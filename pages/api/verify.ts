import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Upstash rate limit — basic DoS protection
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
});

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
ensureTable().catch((e) => console.error('[verify:init]', e instanceof Error ? e.message : e));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { payload } = req.body;
  if (!payload) return res.status(400).json({ success: false, error: 'Missing payload' });

  try {
    // Rate limit per IP
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'anon';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return res.status(429).json({ success: false, error: 'Too many requests' });
    }

    await ensureTable();

    // Anti-sybil: check duplicate nullifier
    const existing = await pool.query(
      'SELECT 1 FROM used_nullifiers WHERE nullifier_hash = $1',
      [payload.nullifier_hash]
    );
    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ success: false, error: 'Nullifier already used — duplicate human' });
    }

    const appId = process.env.WORLD_APP_ID as `app_${string}`;
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
  } catch (e) {
    console.error('[verify]', e instanceof Error ? e.message : e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
