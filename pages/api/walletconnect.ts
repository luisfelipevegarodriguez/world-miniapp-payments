// WalletConnect manifest — required for World App discovery
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(process.env.NEXT_PUBLIC_WORLD_APP_ID ?? '');
}
