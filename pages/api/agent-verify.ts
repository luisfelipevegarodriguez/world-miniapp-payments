/**
 * Vercel Workflow SDK — Human Oversight Step
 * Integra World ID en cualquier workflow de Vercel como paso de verificación
 * Ref: https://vercel.com/docs/workflow-sdk
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';
import { logger } from '@/lib/logger';
import { ratelimit } from '@/lib/ratelimit';

const APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
  const { success } = await ratelimit.limit(ip);
  if (!success) return res.status(429).json({ error: 'rate_limited' });

  const { proof, nullifier_hash, merkle_root, verification_level, action, signal } = req.body ?? {};

  if (!proof || !nullifier_hash || !action) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  try {
    const verifyRes: IVerifyResponse = await verifyCloudProof(
      { proof, nullifier_hash, merkle_root, verification_level },
      APP_ID,
      action,
      signal
    );

    if (!verifyRes.success) {
      logger.warn({ action, reason: verifyRes.detail }, 'agent_verify_failed');
      return res.status(400).json({ error: verifyRes.detail, code: verifyRes.code });
    }

    // Registrar aprobación humana para audit trail (Vercel Workflow SDK compatible)
    logger.info({
      nullifier: nullifier_hash.slice(0, 16),
      action,
      signal,
      ts: new Date().toISOString(),
    }, 'human_approval_granted');

    return res.status(200).json({
      success: true,
      nullifier_hash,
      action,
      approved_at: new Date().toISOString(),
      // Workflow SDK espera este campo para continuar el pipeline
      workflow_continue: true,
    });
  } catch (err) {
    logger.error({ err }, 'agent_verify_error');
    return res.status(500).json({ error: 'internal_error' });
  }
}
