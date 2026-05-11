import type { NextApiRequest, NextApiResponse } from 'next'
import { sendGrokSignal, getYieldProjection } from '../../lib/grok-client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, worldId, nullifier_hash, amount, token } = req.body

  if (!worldId || !nullifier_hash) {
    return res.status(400).json({ error: 'worldId and nullifier_hash required' })
  }

  try {
    switch (type) {
      case 'signal': {
        // Send to Grok brain for DeFi decision
        const result = await sendGrokSignal({
          worldId,
          nullifier_hash,
          action: req.body.action || 'yield_optimize',
          amount,
          token
        })
        return res.json(result)
      }

      case 'yield': {
        // Get yield projection without AI overhead
        if (!token || !amount) {
          return res.status(400).json({ error: 'token and amount required for yield' })
        }
        const projection = await getYieldProjection(token, amount, 'auto')
        return res.json(projection)
      }

      default:
        return res.status(400).json({
          error: `Unknown type: ${type}. Use 'signal' or 'yield'`
        })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    console.error('[orchestrate]', message)
    return res.status(500).json({ error: message })
  }
}
