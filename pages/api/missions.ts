/**
 * Viral Missions Engine — daily/weekly engagement loops
 * Anti-gambling: no random rewards, deterministic progress only
 * Alineado con guías World: no chance-based mechanics sin disclosure
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRatelimitRead } from '@/lib/ratelimit';
import { getPool } from '@/lib/db';
import { getConfigStatus, notConfiguredBody } from '@/lib/config-status';

const MISSIONS: Mission[] = [
  { id: 'first_verify', title: '🌍 Verifica tu humanidad', xp: 100, type: 'onboarding', target: 1 },
  { id: 'first_payment', title: '⚡ Primer pago verificado', xp: 200, type: 'payment', target: 1 },
  { id: 'daily_3payments', title: '🔥 3 pagos en 24h', xp: 150, type: 'daily', target: 3 },
  { id: 'streak_7days', title: '🏆 7 días activo', xp: 500, type: 'streak', target: 7 },
  { id: 'invite_3humans', title: '👥 Invita 3 humanos', xp: 300, type: 'referral', target: 3 },
  { id: 'yield_first', title: '📈 Activa tu primer yield', xp: 250, type: 'yield', target: 1 },
];

interface Mission { id: string; title: string; xp: number; type: string; target: number; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!getConfigStatus().configured) {
    return res.status(503).json(notConfiguredBody());
  }

  const nullifier = req.headers['x-world-id'] as string;
  if (!nullifier) return res.status(400).json({ error: 'Missing x-world-id' });

  const limiter = getRatelimitRead();
  if (!limiter) return res.status(503).json(notConfiguredBody());
  const { success } = await limiter.limit(nullifier);
  if (!success) return res.status(429).json({ error: 'Too many requests' });

  const pool = getPool();
  if (!pool) return res.status(503).json(notConfiguredBody());

  if (req.method === 'GET') {
    const rows = await pool.query(
      `SELECT mission_id, progress, completed_at FROM user_missions WHERE nullifier_hash = $1`,
      [nullifier]
    );
    const progressMap = Object.fromEntries(rows.rows.map((r: any) => [r.mission_id, r]));
    return res.status(200).json({
      missions: MISSIONS.map(m => ({
        ...m,
        progress: progressMap[m.id]?.progress ?? 0,
        completed: !!progressMap[m.id]?.completed_at,
      })),
    });
  }

  return res.status(405).end();
}
