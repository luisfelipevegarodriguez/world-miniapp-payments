import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { readEnv } from '@/lib/config-status';

let writeLimiter: Ratelimit | null | undefined;
let readLimiter: Ratelimit | null | undefined;

function buildLimiter(prefix: string, limit: number): Ratelimit | null {
  const url = readEnv('UPSTASH_REDIS_REST_URL', 'KV_REST_API_URL');
  const token = readEnv('UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_TOKEN');
  if (!url || !token) {
    return null;
  }
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, '1 m'),
    analytics: true,
    prefix,
  });
}

export function getRatelimit(): Ratelimit | null {
  if (writeLimiter === undefined) {
    writeLimiter = buildLimiter('@world-miniapp/ratelimit', 5);
  }
  return writeLimiter;
}

export function getRatelimitRead(): Ratelimit | null {
  if (readLimiter === undefined) {
    readLimiter = buildLimiter('@world-miniapp/ratelimit-read', 30);
  }
  return readLimiter;
}
