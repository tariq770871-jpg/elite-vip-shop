import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/csp-report
 *
 * Receives Content-Security-Policy violation reports from browsers.
 * Logs them server-side for observability. Does NOT return details to caller.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Log the violation server-side (visible in Vercel/logs)
    console.warn('[CSP Violation]', JSON.stringify(body).substring(0, 500));
  } catch {
    // Ignore malformed reports
  }
  // Always return 204 — no information disclosed
  return new NextResponse(null, { status: 204 });
}
