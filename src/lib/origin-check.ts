/**
 * Origin / CSRF validation for state-changing public endpoints.
 *
 * Why: /api/contact and /api/notify (visit event) accept POSTs without
 * authentication. Without an Origin check, a malicious site can submit
 * fake contact messages or fire fake "visit" events from a victim's
 * browser (CSRF).
 *
 * Strategy:
 *   1. Read `Origin` header (sent automatically by same-origin and
 *      cross-origin fetch() in modern browsers).
 *   2. Fall back to `Referer` if `Origin` is missing (older browsers).
 *   3. Compare against the configured `SITE_URL` host.
 *   4. In development, allow `localhost` variants so local dev isn't
 *      blocked.
 *   5. If neither Origin nor Referer is present (e.g., curl, server-side
 *      bots), REJECT — browsers always send at least one of them on POSTs.
 *
 * Returns `true` if the request is allowed, `false` otherwise.
 * Callers should return 403 when this returns false.
 */

import { SITE_URL } from "@/lib/site-config";

const ALLOWED_DEV_HOSTS = new Set<string>([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

/**
 * Extract the hostname from an Origin or Referer header value.
 * Returns null if the value is malformed.
 */
function extractHost(rawHeader: string | null): string | null {
  if (!rawHeader) return null;
  try {
    // URL parsing normalizes trailing slashes, ports, and protocols.
    // Origin is "https://host[:port]" with no path; Referer is a full URL.
    // Both work with `new URL(...)`.
    return new URL(rawHeader).hostname;
  } catch {
    return null;
  }
}

/**
 * Returns the configured SITE_URL hostname, or null if SITE_URL is unset.
 */
function getSiteHost(): string | null {
  try {
    return new URL(SITE_URL).hostname;
  } catch {
    return null;
  }
}

/**
 * Validate that the request originates from the same site (SITE_URL)
 * or, in development, from localhost.
 *
 * Usage:
 *   if (!isSameOrigin(request)) {
 *     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 *   }
 */
export function isSameOrigin(request: Request): boolean {
  const origin = extractHost(request.headers.get("origin"));
  const referer = extractHost(request.headers.get("referer"));

  // No Origin AND no Referer on a POST → almost certainly a non-browser
  // request (curl, server-side script, malicious bot). Browsers ALWAYS
  // send at least Origin or Referer on cross-origin/same-origin POSTs.
  if (!origin && !referer) {
    return false;
  }

  const candidateHost = origin || referer;
  if (!candidateHost) return false;

  const isDev = process.env.NODE_ENV === "development";

  // In dev: allow any localhost variant so local testing isn't blocked.
  if (isDev && ALLOWED_DEV_HOSTS.has(candidateHost)) {
    return true;
  }

  // Production: must match SITE_URL hostname exactly.
  const siteHost = getSiteHost();
  if (!siteHost) {
    // SITE_URL is misconfigured — fail closed. In production this should
    // never happen because instrumentation.ts would have already thrown
    // for missing NEXT_PUBLIC_SITE_URL, but we guard anyway.
    return false;
  }

  return candidateHost === siteHost;
}
