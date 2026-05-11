import { useState, useEffect } from 'react';
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput, VerifyCommandInput, VerificationLevel } from '@worldcoin/minikit-js';
import Head from 'next/head';

type Step = 'idle' | 'verifying' | 'verified' | 'paying' | 'success' | 'error';

const ALLOWED_TOKENS = [Tokens.USDC, Tokens.WLD];

export default function Home() {
  const [step, setStep] = useState<Step>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [txId, setTxId] = useState('');

  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      console.warn('MiniKit not installed — open in World App');
    }
  }, []);

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setErrorMsg('Abre esta app dentro de World App');
      setStep('error');
      return;
    }
    setStep('verifying');
    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'verify-user',
        // Device level = incognito_action, no retinal scan required
        verification_level: VerificationLevel.Device,
      } as VerifyCommandInput);
      if (finalPayload.status === 'error') throw new Error(finalPayload.details ?? 'Verification failed');

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: finalPayload }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Backend verify failed');
      setStep('verified');
    } catch (e: any) {
      setErrorMsg(e.message);
      setStep('error');
    }
  };

  const handlePay = async () => {
    if (!MiniKit.isInstalled()) {
      setErrorMsg('Abre esta app dentro de World App');
      setStep('error');
      return;
    }
    setStep('paying');
    try {
      // reference generated server-side to prevent client-side tampering
      const refRes = await fetch('/api/initiate-payment', { method: 'POST' });
      const { reference } = await refRes.json();
      if (!reference) throw new Error('Failed to generate payment reference');

      const token = Tokens.USDC;
      if (!ALLOWED_TOKENS.includes(token)) throw new Error('Token no permitido');

      const payload: PayCommandInput = {
        reference,
        to: process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS as string,
        tokens: [{ symbol: token, token_amount: tokenToDecimals(1, token).toString() }],
        description: 'Nexus Trust — verified payment',
      };
      const { finalPayload } = await MiniKit.commandsAsync.pay(payload);
      if (finalPayload.status === 'error') throw new Error('Payment cancelled or failed');

      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: finalPayload, reference }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Payment not confirmed');
      setTxId(finalPayload.transaction_id ?? reference);
      setStep('success');
    } catch (e: any) {
      setErrorMsg(e.message);
      setStep('error');
    }
  };

  const reset = () => { setStep('idle'); setErrorMsg(''); setTxId(''); };

  return (
    <>
      <Head>
        <title>Nexus Trust</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg,#0a0a0f 0%,#12121c 60%,#0d1117 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif", color: '#f0f0f0',
      }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 32, boxShadow: '0 0 32px #4f46e580',
          }}>🔐</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Nexus Trust</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#8b8b9e' }}>Human-verified payments · World App</p>
        </div>

        <div style={{
          width: '100%', maxWidth: 380,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '28px 24px', backdropFilter: 'blur(12px)',
        }}>
          {step === 'idle' && (
            <>
              <p style={{ fontSize: 14, color: '#a0a0b0', marginBottom: 24, lineHeight: 1.6 }}>
                Verifica tu humanidad con World ID para desbloquear el pago seguro.
              </p>
              <button onClick={handleVerify} style={btnStyle('#4f46e5')}>
                🌐 Verificar con World ID
              </button>
            </>
          )}

          {step === 'verifying' && <Spinner label="Verificando identidad..." />}
          {step === 'paying' && <Spinner label="Procesando pago..." />}

          {step === 'verified' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 40 }}>✅</div>
                <p style={{ margin: '8px 0 0', fontWeight: 600 }}>Identidad verificada</p>
                <p style={{ fontSize: 12, color: '#8b8b9e', margin: '4px 0 0' }}>Puedes proceder con el pago</p>
              </div>
              <button onClick={handlePay} style={btnStyle('#059669')}>
                💳 Pagar 1 USDC
              </button>
            </>
          )}

          {step === 'success' && (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48 }}>🎉</div>
                <p style={{ fontWeight: 700, fontSize: 18, margin: '12px 0 4px' }}>¡Pago completado!</p>
                <p style={{ fontSize: 11, color: '#8b8b9e', wordBreak: 'break-all' }}>TX: {txId}</p>
              </div>
              <button onClick={reset} style={{ ...btnStyle('#4f46e5'), marginTop: 20 }}>Nueva transacción</button>
            </>
          )}

          {step === 'error' && (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40 }}>⚠️</div>
                <p style={{ fontWeight: 600, margin: '10px 0 4px' }}>Algo salió mal</p>
                <p style={{ fontSize: 12, color: '#f87171' }}>{errorMsg}</p>
              </div>
              <button onClick={reset} style={{ ...btnStyle('#6b7280'), marginTop: 20 }}>Reintentar</button>
            </>
          )}
        </div>

        <p style={{ marginTop: 24, fontSize: 11, color: '#4a4a5e' }}>Powered by World Chain · MiniKit v2</p>
      </div>
    </>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{
        width: 40, height: 40, border: '3px solid rgba(79,70,229,0.2)',
        borderTop: '3px solid #4f46e5', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 14, color: '#a0a0b0', margin: 0 }}>{label}</p>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    width: '100%', padding: '14px 0', background: bg, color: '#fff',
    border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', transition: 'opacity 0.2s',
  };
}
