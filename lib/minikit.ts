/**
 * MiniKit 2.0 — Nexus Trust
 * Build once, deploy web + World App
 * https://world.org/blog/announcements/build-once-deploy-anywhere-minikit-2.0-is-live-for-world-developers
 */
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  VerificationLevel,
  PayCommandInput,
  VerifyCommandInput,
  MiniAppPaymentSuccessPayload,
  MiniAppVerifyActionPayload,
} from '@worldcoin/minikit-js';

export function isMiniKitAvailable(): boolean {
  return typeof window !== 'undefined' && MiniKit.isInstalled();
}

/**
 * Trigger World ID verification (ZKP)
 */
export async function triggerVerify(action: string, signal = ''): Promise<MiniAppVerifyActionPayload | null> {
  if (!isMiniKitAvailable()) return null;
  const payload: VerifyCommandInput = {
    action,
    signal,
    verification_level: VerificationLevel.Orb,
  };
  const { finalPayload } = await MiniKit.commandsAsync.verify(payload);
  if (finalPayload.status === 'error') throw new Error(finalPayload.error_code);
  return finalPayload;
}

/**
 * Trigger USDC/WLD payment — non-custodial: user signs from own wallet
 * Supports LATAM stablecoins via token param
 */
function toPayToken(token: Tokens | string): Tokens {
  if (token === Tokens.WLD || token === 'WLD') return Tokens.WLD;
  if (token === Tokens.USDC || token === 'USDC' || token === 'USDCE') return Tokens.USDC;
  return token as Tokens;
}

export async function triggerPay(
  reference: string,
  amountUSDC: number,
  description: string,
  token: Tokens | string = Tokens.USDC
): Promise<MiniAppPaymentSuccessPayload | null> {
  if (!isMiniKitAvailable()) return null;
  const receiver = process.env.NEXT_PUBLIC_PAYMENT_RECEIVER;
  if (!receiver) throw new Error('NEXT_PUBLIC_PAYMENT_RECEIVER is not configured');
  const symbol = toPayToken(token);
  const payload: PayCommandInput = {
    reference,
    to: receiver,
    tokens: [{
      symbol,
      token_amount: tokenToDecimals(amountUSDC, symbol).toString(),
    }],
    description,
  };
  const { finalPayload } = await MiniKit.commandsAsync.pay(payload);
  if (finalPayload.status === 'error') throw new Error(finalPayload.error_code);
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
    expirationTime: new Date(Date.now() + 10 * 60 * 1000),
  });
  if (finalPayload.status === 'error') throw new Error(finalPayload.error_code);
  return finalPayload;
}
