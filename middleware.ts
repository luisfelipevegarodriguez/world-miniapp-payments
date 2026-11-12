import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ISO 3166-1 alpha-2 codes blocked: OFAC sanctions + high-risk jurisdictions
const BLOCKED_COUNTRIES = new Set(['CU', 'IR', 'KP', 'RU', 'SY']);

export function middleware(req: NextRequest) {
  // Next.js 15 removed NextRequest.geo. On Vercel (including Hobby) the country
  // still arrives as this header, which is what `geo.country` used to read.
  const country = req.headers.get('x-vercel-ip-country') ?? '';

  // Block OFAC-sanctioned countries
  if (BLOCKED_COUNTRIES.has(country)) {
    return new NextResponse(
      JSON.stringify({ error: 'Service not available in your region' }),
      { status: 451, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Enforce TARGET_JURISDICTIONS if set (allowlist mode)
  const targetJurisdictions = process.env.TARGET_JURISDICTIONS;
  if (targetJurisdictions && country) {
    const allowed = new Set(targetJurisdictions.split(',').map(c => c.trim()));
    if (!allowed.has(country)) {
      return new NextResponse(
        JSON.stringify({ error: 'Service not available in your region' }),
        { status: 451, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply only to API routes and main page — not to static assets
  matcher: ['/', '/api/verify', '/api/initiate-payment', '/api/confirm-payment'],
};
