/**
 * MiniPay (Opera) + Celo integration endpoint
 * Opera MiniPay: $1M CELO incentive pool for builders
 * Source: https://press.opera.com/2026/04/22/minipay-builders-incentive-and-roadshow/
 * Celo chainId: 42220 | MiniPay deeplink: celo://wallet
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  // Detect MiniPay user agent
  const ua = req.headers['user-agent'] ?? '';
  const isMiniPay = ua.includes('MiniPay') || ua.includes('Opera Mini');

  res.status(200).json({
    integration: 'MiniPay + Celo',
    incentive_pool: '$1M CELO',
    deadline: '2026-06-30',
    apply_url: 'https://press.opera.com/2026/04/22/minipay-builders-incentive-and-roadshow/',
    celo_chain_id: 42220,
    supported_tokens: ['USDC', 'cUSD', 'cEUR', 'cREAL', 'CELO'],
    latam_stablecoins: ['wARS', 'wCOP', 'wMXN', 'wBRL', 'wPEN'],
    is_minipay_user: isMiniPay,
    deeplink: 'celo://wallet',
    // MiniPay supports same codebase as World App via MiniKit
    minikit_compatible: true,
  });
}
