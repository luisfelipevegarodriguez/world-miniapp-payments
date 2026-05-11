/**
 * Nexus Trust Brain Agent — scheduled via Vercel Cron
 * Cron config: vercel.json → { "crons": [{ "path": "/api/agent-run", "schedule": "*/10 * * * *" }] }
 * 
 * Misión: reducir brecha de acceso a yield global mediante decisiones automáticas verificadas por World ID
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { log } from '@/lib/logger';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const AGENT_SECRET = process.env.AGENT_CRON_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth: Vercel cron passes Authorization header
  if (req.headers.authorization !== `Bearer ${AGENT_SECRET}`) {
    return res.status(401).end();
  }

  const started = Date.now();
  const actions: AgentAction[] = [];

  try {
    // 1. Fetch yield signals (extend: connect Grok API, DeFiLlama, Aave/Morpho)
    const yieldSignals = await fetchYieldSignals();
    
    for (const signal of yieldSignals) {
      const action: AgentAction = {
        type: 'yield_signal',
        protocol: signal.protocol,
        apy: signal.apy,
        risk_level: signal.risk,
        recommendation: signal.apy > 8 ? 'ENTER' : signal.apy < 3 ? 'EXIT' : 'HOLD',
        ts: new Date().toISOString(),
      };
      actions.push(action);
    }

    // 2. Health factor monitoring (extend: Aave positions per nullifier)
    const healthAlerts = await checkHealthFactors();
    actions.push(...healthAlerts);

    // 3. Persist agent decisions to DB
    for (const action of actions) {
      await pool.query(
        `INSERT INTO agent_logs (action_type, payload, duration_ms)
         VALUES ($1, $2, $3)`,
        [action.type, JSON.stringify(action), Date.now() - started]
      );
    }

    log('INFO', 'agent_run_complete', { actions_count: actions.length, duration_ms: Date.now() - started });
    return res.status(200).json({ success: true, actions_count: actions.length, actions });
  } catch (e) {
    log('ERROR', 'agent_run_failed', { error: e instanceof Error ? e.message : String(e) });
    return res.status(500).json({ success: false });
  }
}

interface YieldSignal { protocol: string; apy: number; risk: 'low' | 'medium' | 'high'; }
interface AgentAction { type: string; protocol?: string; apy?: number; risk_level?: string; recommendation?: string; health_factor?: number; ts: string; }

async function fetchYieldSignals(): Promise<YieldSignal[]> {
  // TODO: replace with real Grok + DeFiLlama API call
  return [
    { protocol: 'Aave-USDC', apy: 6.2, risk: 'low' },
    { protocol: 'Morpho-USDC', apy: 9.1, risk: 'medium' },
    { protocol: 'Pendle-PT-USDC', apy: 12.4, risk: 'medium' },
  ];
}

async function checkHealthFactors(): Promise<AgentAction[]> {
  // TODO: query on-chain positions per registered nullifier_hash
  return [];
}
