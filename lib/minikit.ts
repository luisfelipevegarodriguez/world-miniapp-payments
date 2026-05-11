/**
 * MiniKit 2.0 — Nexus Trust
 * Build once, deploy web + World App
 * https://world.org/blog/announcements/build-once-deploy-anywhere-minikit-2.0-is-live-for-world-developers
 */
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput, VerifyCommandInput, MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js';

export function isMiniKitAvailable(): boolean {
  return typeof window !== 'undefined' && MiniKit.isInstalled();
}

/**
 * Trigger World ID verification (ZKP)
 */
export async function triggerVerify(action: string, signal = ''): Promise<{ proof: unknown } | null> {
  if (!isMiniKitAvailable()) return null;
  const payload: VerifyCommandInput = {
    action,
    signal,
    verification_level: 'orb', // máximo: Orb-verified humans only
  };
  const { finalPayload } = await MiniKit.commandsAsync.verify(payload);
  if (finalPayload.status === 'error') throw new Error(finalPayload.error_code);
  return finalPayload;
}

/**
 * Trigger USDC/WLD payment — non-custodial: user signs from own wallet
 * Supports LATAM stablecoins via token param
 */
export async function triggerPay(
  reference: string,
  amountUSDC: number,
  description: string,
  token: Tokens = Tokens.USDCE
): Promise<MiniAppPaymentSuccessPayload | null> {
  if (!isMiniKitAvailable()) return null;
  const payload: PayCommandInput = {
    reference,
    to: process.env.NEXT_PUBLIC_PAYMENT_RECEIVER!,
    tokens: [{
      symbol: token,
      token_amount: tokenToDecimals(amountUSDC, token).toString(),
    }],
    description,
  };
  const { finalPayload } = await MiniKit.commandsAsync.pay(payload);
  if (finalPayload.status === 'error') throw new Error((finalPayload as any).error_code);
  return finalPayload;
}

/**
 * WalletAuth — sign-in with Ethereum wallet (EIP-4361 SIWE)
 */
export async function triggerWalletAuth(nonce: string) {
  if (!isMiniKitAvailable()) return null;
  const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
    nonce,
    statement: 'Sign in to Nexus Trust — real humans, zero bots',
    expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (finalPayload.status === 'error') throw new Error((finalPayload as any).error_code);
  return finalPayload;
}
