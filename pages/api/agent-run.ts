/**
 * Nexus Trust Brain Agent — Vercel Cron every 10 min
 * vercel.json: { "crons": [{ "path": "/api/agent-run", "schedule": "*/10 * * * *" }] }
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { log } from '@/lib/logger';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const AGENT_SECRET = process.env.AGENT_CRON_SECRET;
const GROK_API_KEY = process.env.GROK_API_KEY;
const DEFI_BASE = process.env.DEFILLAAMA_BASE_URL ?? 'https://yields.llama.fi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${AGENT_SECRET}`) return res.status(401).end();

  const started = Date.now();
  try {
    const [yieldSignals, grokInsights] = await Promise.all([
      fetchDeFiLlamaYields(),
      fetchGrokInsights(),
    ]);

    const actions = yieldSignals.map((s: YieldSignal) => ({
      type: 'yield_signal',
      protocol: s.project,
      apy: s.apy,
      tvlUsd: s.tvlUsd,
      chain: s.chain,
      symbol: s.symbol,
      recommendation: s.apy > 10 ? 'ENTER' : s.apy < 3 ? 'EXIT' : 'HOLD',
      ts: new Date().toISOString(),
    }));

    if (grokInsights) {
      actions.push({ type: 'grok_macro', ...grokInsights, ts: new Date().toISOString() });
    }

    for (const action of actions) {
      await pool.query(
        `INSERT INTO agent_logs (action_type, payload, duration_ms) VALUES ($1, $2, $3)`,
        [action.type, JSON.stringify(action), Date.now() - started]
      );
    }

    // Update metrics
    await pool.query(`UPDATE metrics SET value = value + $1, updated_at = NOW() WHERE key = 'agent_runs'`, [1]);

    log('INFO', 'agent_run_complete', { actions_count: actions.length, duration_ms: Date.now() - started });
    return res.status(200).json({ success: true, actions_count: actions.length, top_yield: actions[0] ?? null });
  } catch (e) {
    log('ERROR', 'agent_run_failed', { error: e instanceof Error ? e.message : String(e) });
    return res.status(500).json({ success: false });
  }
}

interface YieldSignal { project: string; apy: number; tvlUsd: number; chain: string; symbol: string; }

async function fetchDeFiLlamaYields(): Promise<YieldSignal[]> {
  const res = await fetch(`${DEFI_BASE}/pools`);
  if (!res.ok) throw new Error(`DeFiLlama error: ${res.status}`);
  const { data } = await res.json();
  return (data as YieldSignal[])
    .filter((p) => ['USDC', 'USDC.e', 'USDCE', 'USDT'].includes(p.symbol) && p.tvlUsd > 1_000_000)
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 10);
}

async function fetchGrokInsights(): Promise<Record<string, unknown> | null> {
  if (!GROK_API_KEY) return null;
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROK_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [{
          role: 'user',
          content: 'Give a 1-sentence macro DeFi risk assessment for USDC yield farming on World Chain today. JSON: { sentiment: \'bullish\'|\'neutral\'|\'bearish\', reason: string, risk_score: 1-10 }'
        }],
        max_tokens: 120,
      }),
    });
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch { return null; }
}
