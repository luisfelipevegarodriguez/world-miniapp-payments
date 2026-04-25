'use client';
import { useEffect, useState } from 'react';
import { MiniKit, Tokens, tokenToDecimals, PayCommandInput, ResponseEvent } from '@worldcoin/minikit-js';

export default function Home() {
  const [status, setStatus] = useState<string>('idle');

  useEffect(() => {
    // Subscribe to PaymentResponse event from World App
    MiniKit.subscribe(ResponseEvent.MiniAppPayment, async (payload) => {
      if (payload.status === 'error') {
        setStatus(`Error: ${payload.error_code}`);
        return;
      }

      setStatus('Verifying on backend...');

      const verifyRes = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      const data = await verifyRes.json();
      setStatus(data.verified ? '✅ Payment confirmed!' : `⏳ Status: ${data.portalStatus}`);
    });

    return () => MiniKit.unsubscribe(ResponseEvent.MiniAppPayment);
  }, []);

  async function sendPayment() {
    if (!MiniKit.isInstalled()) {
      alert('Open this app inside World App');
      return;
    }

    setStatus('Generating reference...');

    // 1. Get nonce/reference from backend
    const nonceRes = await fetch('/api/generate-nonce', { method: 'POST' });
    const { reference } = await nonceRes.json();

    // 2. Build payment command — pay 1 USDC
    const payPayload: PayCommandInput = {
      reference,
      to: '0xYOUR_RECIPIENT_ADDRESS', // ← replace with your wallet
      tokens: [
        {
          symbol: Tokens.USDC,
          token_amount: tokenToDecimals(1, Tokens.USDC).toString(), // 1 USDC
        },
      ],
      description: 'Payment via World Mini App',
    };

    setStatus('Waiting for World App...');
    MiniKit.commands.pay(payPayload);
  }

  async function sendWLD() {
    if (!MiniKit.isInstalled()) {
      alert('Open this app inside World App');
      return;
    }

    setStatus('Generating reference...');
    const nonceRes = await fetch('/api/generate-nonce', { method: 'POST' });
    const { reference } = await nonceRes.json();

    const payPayload: PayCommandInput = {
      reference,
      to: '0xYOUR_RECIPIENT_ADDRESS', // ← replace with your wallet
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(0.5, Tokens.WLD).toString(), // 0.5 WLD
        },
      ],
      description: 'WLD payment via World Mini App',
    };

    setStatus('Waiting for World App...');
    MiniKit.commands.pay(payPayload);
  }

  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 480, margin: 'auto' }}>
      <h1>World Mini App — Payments</h1>
      <p>Status: <strong>{status}</strong></p>
      <button onClick={sendPayment} style={btn}>
        Pay 1 USDC
      </button>
      <button onClick={sendWLD} style={{ ...btn, background: '#1a1a2e', marginLeft: 8 }}>
        Pay 0.5 WLD
      </button>
    </main>
  );
}

const btn: React.CSSProperties = {
  background: '#0d47a1',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  cursor: 'pointer',
  fontSize: 16,
};
