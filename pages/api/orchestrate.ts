import type { NextApiRequest, NextApiResponse } from 'next';
import { ratelimit } from '@/lib/ratelimit';

/**
 * Nexus Trust — Grok Brain Orchestrator
 * Propósito: reducir la brecha de acceso a productos financieros
 * complejos mediante decisiones automáticas verificadas por World ID.
 * Anti-abuse: rate limit por World ID o IP.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Identificador: prioriza World ID header sobre IP para rate limit
  const id =
    (req.headers['x-world-id'] as string) ??
    (req.headers['x-forwarded-for'] as string) ??
    req.socket.remoteAddress ??
    'anon';

  const { success, limit, remaining, reset } = await ratelimit.limit(id);

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', reset);

  if (!success) {
    return res.status(429).json({ error: 'Rate limit exceeded — retry after reset' });
  }

  const { action, context } = req.body ?? {};
  if (!action) return res.status(400).json({ error: 'Missing action' });

  try {
    // Punto de extensión: conectar con Grok API, yield signals, on-chain data
    const result = await dispatchAction(action, context);
    return res.status(200).json({ success: true, result });
  } catch (e) {
    console.error('[orchestrate]', e instanceof Error ? e.message : e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}

// Dispatcher — expande con Grok / DeFi / yield según tu roadmap
async function dispatchAction(action: string, context: unknown) {
  switch (action) {
    case 'yield_signal':
      return { status: 'queued', action, ts: Date.now() };
    case 'payment_intent':
      return { status: 'queued', action, ts: Date.now() };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
