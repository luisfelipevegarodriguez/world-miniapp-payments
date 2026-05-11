import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';
import { ratelimit } from '@/lib/ratelimit';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CONSENT_VERSION = process.env.CONSENT_VERSION ?? 'v1';

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS used_nullifiers (
      nullifier_hash TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS consent_log (
      nullifier_hash TEXT NOT NULL,
      consent_version TEXT NOT NULL,
      granted_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (nullifier_hash, consent_version)
    );
  `);
  tableReady = true;
}
ensureTable().catch((e) => console.error('[verify:init]', e instanceof Error ? e.message : e));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { payload } = req.body ?? {};
  if (!payload) return res.status(400).json({ success: false, error: 'Missing payload' });

  // 1. Rate limit
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'anon';
  const { success: ratePassed } = await ratelimit.limit(ip);
  if (!ratePassed) return res.status(429).json({ success: false, error: 'Too many requests' });

  // 2. Consent enforcement (GDPR Art.7 / CCPA) — must come before any data processing
  if (payload.consent !== 'granted') {
    return res.status(403).json({ success: false, error: 'ConsentRequired' });
  }

  try {
    await ensureTable();

    // 3. Anti-sybil: nullifier dedup
    const existing = await pool.query(
      'SELECT 1 FROM used_nullifiers WHERE nullifier_hash = $1',
      [payload.nullifier_hash]
    );
    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ success: false, error: 'Nullifier already used — duplicate human' });
    }

    // 4. ZKP verification
    const appId = process.env.WORLD_APP_ID as `app_${string}`;
    const actionId = process.env.WORLD_ACTION_ID ?? 'nexus-trust-payment-2026';
    const result: IVerifyResponse = await verifyCloudProof(payload, appId, actionId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.detail ?? 'Proof invalid' });
    }

    // 5. Persist: nullifier + consent audit log
    await pool.query(
      'INSERT INTO used_nullifiers (nullifier_hash) VALUES ($1)',
      [payload.nullifier_hash]
    );
    await pool.query(
      'INSERT INTO consent_log (nullifier_hash, consent_version) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [payload.nullifier_hash, CONSENT_VERSION]
    );

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[verify]', e instanceof Error ? e.message : e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
