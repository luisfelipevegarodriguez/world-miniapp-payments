import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import pool from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const reference = randomUUID();

  await pool.query(
    `INSERT INTO payments (reference, status) VALUES ($1, 'pending')`,
    [reference]
  );

  return res.status(200).json({ reference });
}
