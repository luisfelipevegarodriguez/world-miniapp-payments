import type { NextApiRequest, NextApiResponse } from 'next';
import { getConfigStatus } from '@/lib/config-status';
import { getPool } from '@/lib/db';

const COUNTRIES = ['ES', 'MX', 'CO', 'AR', 'PE', 'CL', 'EC', 'GT', 'HN', 'BO', 'PY', 'UY', 'BR', 'PT'];

function body(counts: { users: number; tx: number; volume: number }, extra: Record<string, unknown>) {
  return {
    project: 'Nexus Trust',
    app_url: 'https://nexus-trust.vercel.app',
    github: 'https://github.com/luisfelipevegarodriguez/world-miniapp-payments',
    verified_users: counts.users,
    total_transactions: counts.tx,
    total_volume_usd: counts.volume.toFixed(2),
    countries_active: COUNTRIES.length,
    chains: ['World Chain', 'Celo mainnet'],
    world_id_level: 'Orb',
    anti_sybil: true,
    grants: {
      world_retroactive: {
        target: 10000,
        current: counts.users,
        deadline: '2026-06-09',
        url: 'https://world.org/retro',
      },
      celo_prezenti: {
        target_daily_tx: 10000,
        current_total_tx: counts.tx,
        deadline: '2026-06-30',
        url: 'https://prezenti.xyz',
      },
    },
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const config = getConfigStatus();
  const pool = getPool();
  if (!pool) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(body(
      { users: 0, tx: 0, volume: 0 },
      { configured: false, missing_required: config.missingRequired, data: 'unavailable' },
    ));
  }

  try {
    const [usersRes, txRes, volumeRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM used_nullifiers'),
      pool.query(`SELECT COUNT(*)::int AS total FROM payments WHERE status = 'confirmed'`),
      pool.query(`SELECT amount FROM payments WHERE status = 'confirmed'`),
    ]);
    const users = Number(usersRes.rows[0]?.total ?? 0);
    const tx = Number(txRes.rows[0]?.total ?? 0);
    const volume = (volumeRes.rows as { amount: unknown }[]).reduce((sum, row) => {
      return sum + Number(row.amount ?? 0);
    }, 0);

    res.setHeader('Cache-Control', 'public, s-maxage=60');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(body(
      { users, tx, volume: Number.isFinite(volume) ? volume : 0 },
      { configured: config.configured },
    ));
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(body(
      { users: 0, tx: 0, volume: 0 },
      { configured: config.configured, data: 'unavailable' },
    ));
  }
}
