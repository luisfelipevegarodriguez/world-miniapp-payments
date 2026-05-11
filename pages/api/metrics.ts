import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  // Grants-required public metrics endpoint
  const GROK_BRAIN_URL = process.env.GROK_BRAIN_URL || 'https://grok-world-orchestrator.vercel.app'

  // Fetch brain metrics
  let brainMetrics = {}
  try {
    const r = await fetch(`${GROK_BRAIN_URL}/api/metrics`, { cache: 'no-store' })
    if (r.ok) brainMetrics = await r.json()
  } catch { /* non-fatal */ }

  res.json({
    app: 'world-miniapp-payments',
    version: '1.0.0',
    chain_id: 480,
    metrics: {
      verified_users: parseInt(process.env.METRIC_USERS || '0'),
      transactions_7d: parseInt(process.env.METRIC_TXS || '0'),
      retention_7d: parseFloat(process.env.METRIC_RETENTION || '0'),
      tvl_usd: parseFloat(process.env.METRIC_TVL || '0')
    },
    brain: brainMetrics,
    timestamp: Date.now()
  })
}
