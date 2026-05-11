import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// In-memory store for pending references (use Redis in production)
const pendingReferences = new Set<string>();

export { pendingReferences };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const reference = crypto.randomUUID();
  pendingReferences.add(reference);
  // Expire reference after 5 minutes
  setTimeout(() => pendingReferences.delete(reference), 5 * 60 * 1000);
  return res.status(200).json({ reference });
}
