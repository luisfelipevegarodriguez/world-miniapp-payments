import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const [{ count: verified_users }, { count: total_tx }, { data: volume }] = await Promise.all([
      supabase.from('nullifiers').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('payments').select('amount').eq('status', 'confirmed'),
    ]);

    const total_volume_usd = volume?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;

    res.setHeader('Cache-Control', 'public, s-maxage=60');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).json({
      project: 'Nexus Trust',
      app_url: 'https://nexus-trust.vercel.app',
      github: 'https://github.com/luisfelipevegarodriguez/world-miniapp-payments',
      verified_users: verified_users ?? 0,
      total_transactions: total_tx ?? 0,
      total_volume_usd: total_volume_usd.toFixed(2),
      countries_active: ['ES','MX','CO','AR','PE','CL','EC','GT','HN','BO','PY','UY','BR','PT'].length,
      chains: ['World Chain', 'Celo mainnet'],
      world_id_level: 'Orb',
      anti_sybil: true,
      grants: {
        world_retroactive: { target: 10000, current: verified_users ?? 0, deadline: '2026-06-09', url: 'https://world.org/retro' },
        celo_prezenti: { target_daily_tx: 10000, current_total_tx: total_tx ?? 0, deadline: '2026-06-30', url: 'https://prezenti.xyz' }
      },
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({ error: 'metrics_unavailable', detail: String(e) });
  }
}
