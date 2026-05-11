import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: 'ok',
    service: 'nexus-trust',
    version: '2.0.0',
    ts: new Date().toISOString(),
    chain: 'world-chain',
    minikit: '2.0',
  });
}
