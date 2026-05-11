import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
});

export async function middleware(req: NextRequest) {
  const protectedRoutes = ['/api/confirm-payment', '/api/verify', '/api/initiate-payment'];
  const isProtected = protectedRoutes.some(r => req.nextUrl.pathname.startsWith(r));

  if (!isProtected) return NextResponse.next();

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
  const { success, limit, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse(JSON.stringify({ success: false, error: 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/confirm-payment', '/api/verify', '/api/initiate-payment'],
};
