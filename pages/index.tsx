import { useState } from 'react';
import Head from 'next/head';
import { isMiniKitAvailable, triggerVerify, triggerPay } from '@/lib/minikit';
import WorldIDWidget from '@/components/WorldIDWidget';
import type { ISuccessResult } from '@worldcoin/idkit';

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'paying' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inWorldApp = isMiniKitAvailable();

  async function handleVerify(proof?: ISuccessResult) {
    setStatus('verifying');
    try {
      const payload = proof ?? await triggerVerify('nexus-trust-payment-2026');
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: { ...payload, consent: 'granted' } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStatus('done');
      setMessage('✅ Verified as real human');
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Verification failed');
    }
  }

  async function handlePay() {
    setStatus('paying');
    try {
      const ref = crypto.randomUUID();
      await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref }),
      });
      const payload = await triggerPay(ref, 1.00, 'Nexus Trust — 1 USDC payment');
      if (!payload) throw new Error('Payment cancelled');
      const confirm = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, reference: ref }),
      });
      const data = await confirm.json();
      if (!data.success) throw new Error(data.error);
      setStatus('done');
      setMessage('✅ Payment confirmed on World Chain');
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Payment failed');
    }
  }

  return (
    <>
      <Head>
        <title>Nexus Trust — Real humans, real money</title>
        <meta name="description" content="Human-verified P2P payments on World Chain. Zero bots. LATAM financial inclusion." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#0a0a0f', color: '#fff', fontFamily: 'sans-serif', maxWidth: 380, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Nexus Trust</h1>
        <p style={{ color: '#aaa', textAlign: 'center', marginBottom: 32, fontSize: 15 }}>
          Pagos verificados por humanos reales.<br/>
          Zero bots. Anti-inflación. 14 países.
        </p>

        {message && (
          <div style={{ background: status === 'error' ? '#2d0a0a' : '#0a2d1a', padding: '12px 20px', borderRadius: 10, marginBottom: 20, fontSize: 14, textAlign: 'center' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          {inWorldApp ? (
            <button onClick={() => handleVerify()} disabled={status !== 'idle'}
              style={{ background: '#4f46e5', color: '#fff', padding: '14px', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: status !== 'idle' ? 0.6 : 1 }}>
              {status === 'verifying' ? 'Verificando...' : '🌍 Verificar con World ID'}
            </button>
          ) : (
            <WorldIDWidget onSuccess={handleVerify} />
          )}

          <button onClick={handlePay} disabled={status !== 'done'}
            style={{ background: '#059669', color: '#fff', padding: '14px', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 600, cursor: status !== 'done' ? 'not-allowed' : 'pointer', opacity: status !== 'done' ? 0.4 : 1 }}>
            {status === 'paying' ? 'Procesando...' : '⚡ Pagar 1 USDC'}
          </button>
        </div>

        <div style={{ marginTop: 40, display: 'flex', gap: 20, fontSize: 12, color: '#666' }}>
          <a href="/terms" style={{ color: '#666' }}>Términos</a>
          <a href="/privacy" style={{ color: '#666' }}>Privacidad</a>
          <a href="/api/metrics" style={{ color: '#666' }}>Métricas</a>
        </div>
      </main>
    </>
  );
}
