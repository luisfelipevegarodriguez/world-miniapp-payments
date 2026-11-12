import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';
import { getRatelimit } from '@/lib/ratelimit';
import { getPool } from '@/lib/db';
import { getConfigStatus, notConfiguredBody, readEnv } from '@/lib/config-status';

const CONSENT_VERSION = process.env.CONSENT_VERSION ?? 'v1';

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  const pool = getPool();
  if (!pool) return;
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!getConfigStatus().configured) {
    return res.status(503).json(notConfiguredBody());
  }

  const { payload } = req.body ?? {};
  if (!payload) return res.status(400).json({ success: false, error: 'Missing payload' });

  const limiter = getRatelimit();
  if (!limiter) return res.status(503).json(notConfiguredBody());

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'anon';
  const { success: ratePassed } = await limiter.limit(ip);
  if (!ratePassed) return res.status(429).json({ success: false, error: 'Too many requests' });

  if (payload.consent !== 'granted') {
    return res.status(403).json({ success: false, error: 'ConsentRequired' });
  }

  const pool = getPool();
  if (!pool) return res.status(503).json(notConfiguredBody());

  try {
    await ensureTable();

    const existing = await pool.query(
      'SELECT 1 FROM used_nullifiers WHERE nullifier_hash = $1',
      [payload.nullifier_hash]
    );
    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ success: false, error: 'Nullifier already used — duplicate human' });
    }

    const appId = readEnv('WORLD_APP_ID', 'NEXT_PUBLIC_WORLD_APP_ID', 'NEXT_PUBLIC_APP_ID') as `app_${string}`;
    const actionId = readEnv('WORLD_ACTION_ID', 'NEXT_PUBLIC_WORLD_ACTION_ID') ?? 'nexus-trust-payment-2026';
    const result: IVerifyResponse = await verifyCloudProof(payload, appId, actionId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.detail ?? 'Proof invalid' });
    }

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
