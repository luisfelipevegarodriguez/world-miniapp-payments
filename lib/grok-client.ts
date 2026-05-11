/**
 * Grok Brain Client
 * Connects world-miniapp-payments → grok-world-orchestrator
 */

const GROK_BRAIN_URL = process.env.GROK_BRAIN_URL || 'https://grok-world-orchestrator.vercel.app'

export interface GrokSignalPayload {
  worldId: string
  nullifier_hash: string
  action: 'yield_optimize' | 'payment_verify' | 'rebalance' | 'claim_rewards'
  amount?: string
  token?: 'WLD' | 'USDC' | 'ETH'
}

export interface GrokSignalResponse {
  signal: {
    execute: boolean
    risk: number        // 0-10
    protocol: string | null
    reasoning: string
  }
  worldId: string
  timestamp: number
  executed: boolean
}

export interface YieldResponse {
  protocol: string
  chain_id: number
  token: string
  amount: string
  apy: string
  projected_yield: {
    daily: string
    weekly: string
    monthly: string
    annual: string
  }
  world_chain_market: string
  timestamp: number
}

/**
 * Send signal to Grok brain for AI-driven DeFi decision
 */
export async function sendGrokSignal(
  payload: GrokSignalPayload
): Promise<GrokSignalResponse> {
  const res = await fetch(`${GROK_BRAIN_URL}/api/signal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-world-id': payload.worldId
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Grok brain error ${res.status}: ${err.error || 'Unknown'}`)
  }

  return res.json()
}

/**
 * Get Morpho yield projection from grok orchestrator
 */
export async function getYieldProjection(
  token: 'USDC' | 'ETH' | 'WLD',
  amount: string,
  protocol: 'morpho' | 'aave' | 'pendle' | 'auto' = 'auto'
): Promise<YieldResponse> {
  const res = await fetch(`${GROK_BRAIN_URL}/api/yield`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, amount, protocol, worldId: 'anonymous' })
  })

  if (!res.ok) throw new Error(`Yield fetch failed: ${res.status}`)
  return res.json()
}

/**
 * Health check grok brain
 */
export async function checkGrokHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${GROK_BRAIN_URL}/health`, { cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}
