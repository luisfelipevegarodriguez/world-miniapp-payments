import type { NextApiRequest, NextApiResponse } from 'next';
import { getConfigStatus } from '@/lib/config-status';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const config = getConfigStatus();
  res.status(200).json({
    status: 'ok',
    configured: config.configured,
    missing_required: config.missingRequired,
    missing_optional: config.missingOptional,
    service: 'nexus-trust',
    version: '2.0.0',
    ts: new Date().toISOString(),
    chain: 'world-chain',
    minikit: '2.0',
  });
}
