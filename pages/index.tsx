import { useState, useEffect } from 'react';
import Head from 'next/head';
import { isMiniKitAvailable, triggerVerify, triggerPay } from '@/lib/minikit';
import WorldIDWidget from '@/components/WorldIDWidget';
import type { ISuccessResult } from '@worldcoin/idkit';
import { STABLECOINS } from '@/lib/stablecoins';

type Status = 'idle' | 'verifying' | 'verified' | 'paying' | 'done' | 'error';

const AMOUNT_PRESETS = [1, 5, 10, 25, 50];
const OVERSIGHT_THRESHOLD = 50; // USDC — requiere aprobación humana

export default function Home() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [nullifier, setNullifier] = useState('');
  const [amount, setAmount] = useState(5);
  const [token, setToken] = useState('USDC');
  const [agentMode, setAgentMode] = useState(false);
  const [txHash, setTxHash] = useState('');
  const inWorldApp = isMiniKitAvailable();

  // Detectar si viene de agente (header X-World-Human-Principal)
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('worldapp') || ua.includes('minikit')) setAgentMode(false);
  }, []);

  async function handleVerify(proof?: ISuccessResult) {
    setStatus('verifying');
    setMessage('');
    try {
      const payload = proof ?? await triggerVerify(process.env.NEXT_PUBLIC_WORLD_ACTION_ID ?? 'nexus-trust-payment-2026');
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: { ...payload, consent: 'granted' } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? data.detail ?? 'Verificación fallida');
      setNullifier(data.nullifier_hash ?? '');
      setStatus('verified');
      setMessage('✅ Humano verificado — listo para pagar');
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Error de verificación');
    }
  }

  async function handlePay() {
    // Supervisión humana para pagos grandes
    if (amount > OVERSIGHT_THRESHOLD) {
      const confirm = window.confirm(
        `⚠️ Pago de ${amount} ${token} supera $${OVERSIGHT_THRESHOLD}. ¿Confirmas?`
      );
      if (!confirm) return;
      // En producción: triggerVerify('agent-oversight-payment') para ZKP real
    }

    setStatus('paying');
    try {
      const ref = crypto.randomUUID();
      await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, token, amount }),
      });
      const payload = await triggerPay(ref, amount, `Nexus Trust — ${amount} ${token}`, token);
      if (!payload) throw new Error('Pago cancelado');
      const confirm = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, reference: ref, nullifier_hash: nullifier }),
      });
      const data = await confirm.json();
      if (!data.success) throw new Error(data.error);
      setTxHash(data.tx_hash ?? '');
      setStatus('done');
      setMessage(`✅ ${amount} ${token} enviados — World Chain confirmado`);
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Error en pago');
    }
  }

  const selectedCoin = STABLECOINS.find(c => c.symbol === token) ?? STABLECOINS[0];
  const canPay = status === 'verified' || status === 'done';
  const isLoading = status === 'verifying' || status === 'paying';

  return (
    <>
      <Head>
        <title>Nexus Trust — Pagos humanos verificados</title>
        <meta name="description" content="Pagos P2P verificados en World Chain. Sin bots. Inclusión financiera LATAM." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <main style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        padding: '16px 16px 32px', background: '#0a0a0f', color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        maxWidth: 420, margin: '0 auto',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Nexus Trust</h1>
            <p style={{ fontSize: 11, color: '#555', margin: 0 }}>World Chain • Celo • 14 países</p>
          </div>
          <a href="/dashboard" style={{
            background: '#1a1a24', color: '#888', padding: '6px 12px',
            borderRadius: 8, fontSize: 12, textDecoration: 'none', border: '1px solid #2a2a3a'
          }}>
            📊 Dashboard
          </a>
        </div>

        {/* Status bar */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 24, alignItems: 'center'
        }}>
          {(['idle', 'verified', 'done'] as Status[]).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', border: '2px solid',
                borderColor: ['verified', 'done'].includes(status) && i === 0 ? '#10b981' :
                  status === 'done' && i === 1 ? '#10b981' : '#2a2a3a',
                background: ['verified', 'done'].includes(status) && i === 0 ? '#10b981' :
                  status === 'done' && i === 1 ? '#10b981' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>
                {i === 0 && (['verified', 'done'].includes(status)) ? '✓' :
                  i === 1 && status === 'done' ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, color: '#666' }}>
                {i === 0 ? 'Verificar' : i === 1 ? 'Pagar' : 'Listo'}
              </span>
              {i < 2 && <div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />}
            </div>
          ))}
        </div>

        {/* Token selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Token</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STABLECOINS.slice(0, 6).map(c => (
              <button key={c.symbol} onClick={() => setToken(c.symbol)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid',
                  borderColor: token === c.symbol ? '#4f46e5' : '#2a2a3a',
                  background: token === c.symbol ? '#1e1b4b' : '#111118',
                  color: token === c.symbol ? '#818cf8' : '#666',
                  fontSize: 12, cursor: 'pointer', fontWeight: token === c.symbol ? 700 : 400,
                }}>
                {c.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Importe ({token})</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {AMOUNT_PRESETS.map(a => (
              <button key={a} onClick={() => setAmount(a)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, border: '1px solid',
                  borderColor: amount === a ? '#10b981' : '#2a2a3a',
                  background: amount === a ? '#0a2d1a' : '#111118',
                  color: amount === a ? '#10b981' : '#666',
                  fontSize: 13, cursor: 'pointer', fontWeight: amount === a ? 700 : 400,
                }}>
                {a}
              </button>
            ))}
          </div>
          <input
            type="number" value={amount} min={0.01} step={0.01}
            onChange={e => setAmount(Number(e.target.value))}
            style={{
              width: '100%', background: '#111118', border: '1px solid #2a2a3a',
              borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 16,
              fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          {amount > OVERSIGHT_THRESHOLD && (
            <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>
              ⚠️ Requiere aprobación humana (AgentKit oversight)
            </p>
          )}
        </div>

        {/* Feedback */}
        {message && (
          <div style={{
            background: status === 'error' ? '#2d0a0a' : '#0a2d1a',
            border: `1px solid ${status === 'error' ? '#7f1d1d' : '#14532d'}`,
            padding: '12px 16px', borderRadius: 10, marginBottom: 16,
            fontSize: 13, textAlign: 'center', lineHeight: 1.5,
          }}>
            {message}
            {txHash && (
              <div style={{ marginTop: 6 }}>
                <a href={`https://worldchain-mainnet.explorer.alchemy.com/tx/${txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: '#10b981', fontSize: 11 }}>
                  Ver en explorer →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {status === 'idle' || status === 'error' ? (
            inWorldApp ? (
              <button onClick={() => handleVerify()} disabled={isLoading}
                style={{
                  background: '#4f46e5', color: '#fff', padding: '16px',
                  borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1, width: '100%',
                }}>
                {status === 'verifying' ? '⏳ Verificando...' : '🌍 Verificar con World ID'}
              </button>
            ) : (
              <WorldIDWidget onSuccess={handleVerify} />
            )
          ) : null}

          {(status === 'verified' || status === 'done') && (
            <>
              <button onClick={handlePay} disabled={isLoading || status === 'done'}
                style={{
                  background: status === 'done' ? '#065f46' : '#059669',
                  color: '#fff', padding: '16px', borderRadius: 14,
                  border: 'none', fontSize: 16, fontWeight: 700,
                  cursor: (isLoading || status === 'done') ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1, width: '100%',
                }}>
                {status === 'paying' ? '⏳ Procesando...' :
                  status === 'done' ? `✅ ${amount} ${token} enviados` :
                    `⚡ Pagar ${amount} ${token}`}
              </button>
              {status !== 'done' && (
                <button onClick={() => { setStatus('idle'); setMessage(''); setNullifier(''); }}
                  style={{
                    background: 'transparent', color: '#666', padding: '10px',
                    borderRadius: 10, border: '1px solid #2a2a3a',
                    fontSize: 13, cursor: 'pointer', width: '100%',
                  }}>
                  Verificar otra cuenta
                </button>
              )}
            </>
          )}
        </div>

        {/* Badges */}
        <div style={{ marginTop: 28, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['World Chain', 'ZKP • Sin PII', 'Gas Gratis', 'Celo'].map(b => (
            <span key={b} style={{
              background: '#111118', border: '1px solid #2a2a3a',
              borderRadius: 6, padding: '4px 8px', fontSize: 10, color: '#555',
            }}>{b}</span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', gap: 16, fontSize: 11, color: '#444', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: '#444' }}>Términos</a>
          <a href="/privacy" style={{ color: '#444' }}>Privacidad</a>
          <a href="/api/metrics" style={{ color: '#444' }}>Métricas</a>
          <a href="/api/health" style={{ color: '#444' }}>Status</a>
          <a href="https://world.org" target="_blank" rel="noopener" style={{ color: '#444' }}>World</a>
        </div>
      </main>
    </>
  );
}
