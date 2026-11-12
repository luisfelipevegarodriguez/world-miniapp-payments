/**
 * Vercel Workflow SDK — Human Oversight Step
 * Integra World ID en cualquier workflow de Vercel como paso de verificación
 * Ref: https://vercel.com/docs/workflow-sdk
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js';
import { log } from '@/lib/logger';
import { getRatelimit } from '@/lib/ratelimit';
import { getConfigStatus, notConfiguredBody, readEnv } from '@/lib/config-status';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!getConfigStatus().configured) {
    return res.status(503).json(notConfiguredBody());
  }

  const limiter = getRatelimit();
  if (!limiter) return res.status(503).json(notConfiguredBody());

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
  const { success } = await limiter.limit(ip);
  if (!success) return res.status(429).json({ error: 'rate_limited' });

  const { proof, nullifier_hash, merkle_root, verification_level, action, signal } = req.body ?? {};

  if (!proof || !nullifier_hash || !action) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  try {
    const appId = readEnv('NEXT_PUBLIC_WORLD_APP_ID', 'WORLD_APP_ID', 'NEXT_PUBLIC_APP_ID') as `app_${string}`;
    const verifyRes: IVerifyResponse = await verifyCloudProof(
      { proof, nullifier_hash, merkle_root, verification_level },
      appId,
      action,
      signal
    );

    if (!verifyRes.success) {
      log('WARN', 'agent_verify_failed', { action, reason: verifyRes.detail });
      return res.status(400).json({ error: verifyRes.detail, code: verifyRes.code });
    }

    log('INFO', 'human_approval_granted', {
      nullifier: String(nullifier_hash).slice(0, 16),
      action,
      signal,
      ts: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      nullifier_hash,
      action,
      approved_at: new Date().toISOString(),
      // Workflow SDK espera este campo para continuar el pipeline
      workflow_continue: true,
    });
  } catch (err) {
    log('ERROR', 'agent_verify_error', { err: err instanceof Error ? err.message : 'internal_error' });
    return res.status(500).json({ error: 'internal_error' });
  }
}
