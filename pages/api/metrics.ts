/**
 * Public metrics endpoint — required for World Foundation + Celo Prezenti grants
 * Evidence of real usage: verified_users, transactions_7d, tvl_usd
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { ratelimitRead } from '@/lib/ratelimit';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = (req.headers['x-forwarded-for'] as string) || 'anon';
  const { success } = await ratelimitRead.limit(ip);
  if (!success) return res.status(429).json({ error: 'Too many requests' });

  try {
    const [usersRes, txRes, metricsRes, agentRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM used_nullifiers`),
      pool.query(`SELECT COUNT(*) as count FROM payments WHERE status = 'completed' AND created_at > NOW() - INTERVAL '7 days'`),
      pool.query(`SELECT key, value FROM metrics`),
      pool.query(`SELECT action_type, COUNT(*) as count, MAX(created_at) as last_run FROM agent_logs GROUP BY action_type ORDER BY last_run DESC LIMIT 5`),
    ]);

    const metricsMap = Object.fromEntries(metricsRes.rows.map((r: any) => [r.key, Number(r.value)]));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({
      verified_humans: Number(usersRes.rows[0].count),
      transactions_7d: Number(txRes.rows[0].count),
      tvl_usd: (metricsMap['tvl_usd_cents'] ?? 0) / 100,
      agent_runs: metricsMap['agent_runs'] ?? 0,
      agent_activity: agentRes.rows,
      generated_at: new Date().toISOString(),
      // Grant evidence links
      grant_targets: {
        world_foundation: { target: 10000, current: Number(usersRes.rows[0].count), deadline: '2026-06-09', url: 'https://world.org/retro' },
        celo_prezenti: { target_daily_tx: 10000, current_7d: Number(txRes.rows[0].count), deadline: '2026-06-30', url: 'https://www.prezenti.xyz' },
      },
    });
  } catch (e) {
    return res.status(500).json({ error: 'DB unavailable' });
  }
}
