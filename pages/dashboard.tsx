import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Metrics {
  verified_humans: number;
  transactions_7d: number;
  agent_runs: number;
  tvl_usd: number;
  grant_targets: {
    world_foundation: { target: number; current: number; deadline: string; url: string };
    celo_prezenti: { target_daily_tx: number; current_7d: number; deadline: string; url: string };
  };
}

interface Rewards {
  metrics: { verified_humans: number; target_humans: number; progress_pct: number; qualified: boolean; weekly_transactions: number };
  retroactive_grant: { amount_wld: number; deadline: string; payment_date: string; apply_url: string };
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/metrics').then(r => r.json()),
      fetch('/api/dev-rewards').then(r => r.json()),
    ]).then(([m, r]) => { setMetrics(m); setRewards(r); });
  }, []);

  const s = { card: { background: '#111', borderRadius: 12, padding: '20px', border: '1px solid #222' } as const };

  return (
    <>
      <Head><title>Nexus Trust — Dashboard</title></Head>
      <main style={{ background: '#0a0a0f', minHeight: '100dvh', color: '#fff', fontFamily: 'sans-serif', padding: '1.5rem', maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>⚡ Nexus Trust Dashboard</h1>

        {metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[['Humans', metrics.verified_humans], ['Tx 7d', metrics.transactions_7d], ['Agent runs', metrics.agent_runs], ['TVL $', metrics.tvl_usd]]
              .map(([k, v]) => (
                <div key={String(k)} style={s.card}>
                  <div style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{Number(v).toLocaleString()}</div>
                </div>
              ))}
          </div>
        )}

        {rewards && (
          <div style={{ ...s.card, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🏆 Dev Rewards $100K/week</div>
            <div style={{ background: '#222', borderRadius: 8, height: 8, marginBottom: 6 }}>
              <div style={{ background: rewards.metrics.qualified ? '#10b981' : '#f59e0b', height: 8, borderRadius: 8, width: `${rewards.metrics.progress_pct}%`, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {rewards.metrics.verified_humans.toLocaleString()} / {rewards.metrics.target_humans.toLocaleString()} humans
              {' — '}{rewards.metrics.progress_pct}%
              {rewards.metrics.qualified ? ' ✅ QUALIFIED' : ''}
            </div>
            <a href={rewards.retroactive_grant.apply_url} target="_blank"
              style={{ display: 'block', marginTop: 10, background: '#4f46e5', color: '#fff', padding: '10px', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              Apply Retroactive — Deadline {rewards.retroactive_grant.deadline}
            </a>
          </div>
        )}

        {metrics?.grant_targets && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[metrics.grant_targets.world_foundation, metrics.grant_targets.celo_prezenti].map((g, i) => (
              <div key={i} style={s.card}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                  {i === 0 ? '🌍 World Foundation' : '🟡 Celo Prezenti'}
                  {' — '}⏰ {g.deadline}
                </div>
                <a href={g.url} target="_blank" style={{ color: '#60a5fa', fontSize: 13 }}>{g.url}</a>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
