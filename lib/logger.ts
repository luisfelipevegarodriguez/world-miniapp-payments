/**
 * Structured observability logger — NIST-aligned
 * Emits JSON to stdout (Vercel captures as structured logs)
 */
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'AUDIT' | 'SECURITY';

interface LogEntry {
  ts: string;
  level: LogLevel;
  service: string;
  event: string;
  data?: Record<string, unknown>;
  nullifier?: string;  // anonymized user ID
  ip?: string;
}

export function log(level: LogLevel, event: string, data?: Record<string, unknown>, meta?: { nullifier?: string; ip?: string }) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    service: 'nexus-trust',
    event,
    ...(data && { data }),
    ...(meta?.nullifier && { nullifier: meta.nullifier }),
    ...(meta?.ip && { ip: meta.ip }),
  };
  const out = JSON.stringify(entry);
  if (level === 'ERROR' || level === 'SECURITY') {
    console.error(out);
  } else {
    console.log(out);
  }
}

// Security-specific helpers
export const security = {
  rateLimitHit: (ip: string) => log('SECURITY', 'rate_limit_exceeded', undefined, { ip }),
  consentMissing: (ip: string) => log('SECURITY', 'consent_not_granted', undefined, { ip }),
  nullifierReused: (nullifier: string) => log('SECURITY', 'nullifier_reused', undefined, { nullifier }),
  proofInvalid: (detail: string, ip: string) => log('SECURITY', 'proof_invalid', { detail }, { ip }),
  geoBlocked: (country: string, ip: string) => log('SECURITY', 'geo_blocked', { country }, { ip }),
  verifySuccess: (nullifier: string) => log('AUDIT', 'verify_success', undefined, { nullifier }),
  paymentConfirmed: (reference: string, nullifier: string) => log('AUDIT', 'payment_confirmed', { reference }, { nullifier }),
};
