/**
 * Dev Rewards tracker — World $100K/week pool
 * Tracks verified unique users needed to qualify
 * Pool: https://world.org/blog/announcements/dev-rewards-pilot-increases-to-100k-per-week
 * Minimum: 10K verified unique humans
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TARGET = 10_000; // minimum for Dev Rewards

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const [usersRes, weeklyTxRes, retentionRes] = await Promise.all([
    pool.query(`SELECT COUNT(DISTINCT nullifier_hash) as total FROM used_nullifiers`),
    pool.query(`SELECT COUNT(*) as count FROM payments WHERE status='completed' AND created_at > NOW() - INTERVAL '7 days'`),
    pool.query(`SELECT COUNT(DISTINCT nullifier_hash) as retained FROM used_nullifiers WHERE created_at > NOW() - INTERVAL '30 days'`),
  ]);

  const verified = Number(usersRes.rows[0].total);
  const weeklyTx = Number(weeklyTxRes.rows[0].count);
  const retained30d = Number(retentionRes.rows[0].retained);
  const progress = Math.min((verified / TARGET) * 100, 100).toFixed(1);

  res.status(200).json({
    program: 'World Dev Rewards',
    pool_usd_weekly: 100_000,
    payout_currency: 'WLD',
    payout_date: 'weekly automatic',
    source: 'https://world.org/retro',
    metrics: {
      verified_humans: verified,
      target_humans: TARGET,
      progress_pct: Number(progress),
      weekly_transactions: weeklyTx,
      retained_30d: retained30d,
      qualified: verified >= TARGET,
    },
    next_steps: verified >= TARGET
      ? ['QUALIFIED — Submit at world.org/retro']
      : [`Need ${TARGET - verified} more verified humans to qualify`],
    retroactive_grant: {
      amount_wld: 50_000,
      deadline: '2026-06-09',
      payment_date: '2026-06-20',
      apply_url: 'https://world.org/retro',
    },
  });
}
