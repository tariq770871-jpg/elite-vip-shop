/**
 * Supabase Server-Side Client (SSR-safe)
 *
 * This module creates Supabase clients that are safe for use in:
 *   - Server Components
 *   - Route Handlers (API routes)
 *   - Server Actions
 *
 * Key differences from the browser client:
 *   1. Reads cookies from the request context (no localStorage)
 *   2. Uses SUPABASE_SERVICE_ROLE_KEY (server-only, no NEXT_PUBLIC_ prefix)
 *      for admin/service operations that bypass RLS
 *   3. Uses @supabase/ssr createServerClient for cookie-based auth
 *
 * IMPORTANT: This file must ONLY be imported in server-side code.
 * Do NOT import this in client components.
 */

import { createServerClient as createSsrServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ─── Shared Auth Token Extraction ───────────────────────────────
// Used by createRouteHandlerClient(), verifyAuthToken(), and middleware.
// Extracts the access token from the Authorization header first,
// then falls back to the sb-access-token cookie.

/**
 * Extract the Supabase access token from a Request object.
 *
 * Resolution order:
 *   1. Authorization: Bearer <token> header (preferred — set by client-side API calls)
 *   2. `sb-<project-ref>-auth-token` cookie (single-chunk form, supabase-js v2)
 *   3. `sb-<project-ref>-auth-token.0` + `.1` + ... chunked cookies (@supabase/ssr v0.10+)
 *
 * Note: @supabase/ssr v0.10+ chunks cookies larger than ~3180 bytes into
 * `<name>.0`, `<name>.1`, ... parts. We must reassemble them in order.
 *
 * @param request - The incoming Request (or NextRequest)
 * @returns The access token string, or null if not found
 */
export function extractAccessToken(request: Request): string | null {
  // 1. Authorization header (set by client-side API calls)
  const authHeader = request.headers.get("authorization");
  const headerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (headerToken) return headerToken;

  // 2 & 3. Cookie-based extraction.
  //    NextRequest exposes `request.cookies.get()`, but generic Request does not.
  //    Fall back to raw header parsing to support both call sites.
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  // Parse all cookies once into a Map (key → value)
  const cookies = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    cookies.set(key, val);
  }

  // Match `sb-<project-ref>-auth-token` (single-chunk) first.
  // Project ref is the middle segment of the Supabase URL host
  // (e.g., https://abcdefgh.supabase.co → ref = abcdefgh).
  const singleMatch = /^sb-[\w-]+-auth-token$/;
  for (const [key, value] of cookies) {
    if (singleMatch.test(key)) return decodeCookieValue(value);
  }

  // Otherwise, reassemble chunked form: `sb-<ref>-auth-token.0`, `.1`, ...
  const chunkPrefix = /^sb-[\w-]+-auth-token\.(\d+)$/;
  const chunks: Array<{ index: number; value: string }> = [];
  for (const [key, value] of cookies) {
    const m = key.match(chunkPrefix);
    if (m) chunks.push({ index: parseInt(m[1], 10), value });
  }
  if (chunks.length === 0) return null;

  chunks.sort((a, b) => a.index - b.index);
  return decodeCookieValue(chunks.map((c) => c.value).join(""));
}

/**
 * Decode a Supabase session cookie value into a raw access token.
 *
 * The cookie value may be either:
 *   - URL-encoded JSON:  `%7B%22access_token%22%3A%22eyJ...%22%7D`  → parse → access_token
 *   - Raw JSON:           `{"access_token":"eyJ...","refresh_token":"..."}` → parse → access_token
 *   - Raw JWT:            `eyJhbGciOi...` (no curly braces) → return as-is
 *
 * Returns null on malformed JSON.
 */
function decodeCookieValue(raw: string): string | null {
  if (!raw) return null;

  // Fast path: looks like a JWT (header.payload.signature) — return as-is.
  if (raw.startsWith("eyJ")) return raw;

  // Try URL-decode first (some browsers/SSR layers encode the value).
  let decoded = raw;
  try {
    if (raw.includes("%")) decoded = decodeURIComponent(raw);
  } catch {
    // decodeURIComponent can throw on malformed input — keep `raw`.
  }

  // Try JSON parse to extract access_token.
  try {
    const parsed = JSON.parse(decoded) as { access_token?: string };
    return parsed.access_token ?? null;
  } catch {
    return null;
  }
}

// ─── Environment variables ──────────────────────────────────────
// NEXT_PUBLIC_SUPABASE_URL is safe to use server-side (it's just a URL)
// SUPABASE_SERVICE_ROLE_KEY must NEVER be prefixed with NEXT_PUBLIC_
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️ [Supabase Server] Missing required environment variables:',
    [
      !SUPABASE_URL && 'NEXT_PUBLIC_SUPABASE_URL',
      !SUPABASE_ANON_KEY && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      !SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean).join(', '),
    '— Supabase server clients will return null. See .env.example for reference.'
  );
}

// ─── Service Role Client ────────────────────────────────────────
// Bypasses Row Level Security — use ONLY for admin operations
// (e.g., in middleware, admin API routes with auth checks already done)
let _serviceClient: SupabaseClient | null = null;

/**
 * Get a Supabase client that uses the service role key.
 * This bypasses RLS and should ONLY be used in trusted server contexts
 * where authentication has already been verified (e.g., after middleware auth check).
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  if (!_serviceClient) {
    _serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _serviceClient;
}

// ─── Server Component Client ────────────────────────────────────
// Uses @supabase/ssr createServerClient with cookie-based auth

/**
 * Create a Supabase client for Server Components that respects RLS.
 * Reads the user's session from cookies set by the browser client.
 *
 * Usage in Server Components:
 * ```tsx
 * import { createServerClient } from '@/lib/supabase-server'
 *
 * export default async function Page() {
 *   const supabase = await createServerClient()
 *   const { data } = await supabase.from('products').select('*')
 *   // ...
 * }
 * ```
 */
export async function createServerClient(): Promise<SupabaseClient | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const cookieStore = await cookies();

  return createSsrServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

// ─── Route Handler Client ───────────────────────────────────────
// For API routes that need to verify the authenticated user

/**
 * Create a Supabase client for API Route Handlers that respects RLS.
 * Extracts the auth token from the request's Authorization header or cookies.
 *
 * Usage in API routes:
 * ```ts
 * import { createRouteHandlerClient } from '@/lib/supabase-server'
 *
 * export async function GET(request: Request) {
 *   const supabase = createRouteHandlerClient(request)
 *   const { data } = await supabase.from('products').select('*')
 *   // ...
 * }
 * ```
 */
export function createRouteHandlerClient(
  request: Request
): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const accessToken = extractAccessToken(request);

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });
}

/**
 * Verify a user's auth token and return the user object.
 * Useful for API routes that need to check authentication.
 *
 * Returns `{ user, error }` where:
 * - user is the Supabase Auth user object if valid
 * - error is a string describing why auth failed
 */
export async function verifyAuthToken(request: Request): Promise<{
  user: Awaited<ReturnType<SupabaseClient["auth"]["getUser"]>>["data"]["user"];
  error: string | null;
}> {
  const serviceClient = getSupabaseServiceClient();
  if (!serviceClient) {
    return { user: null, error: "Authentication service unavailable" };
  }

  const accessToken = extractAccessToken(request);

  if (!accessToken) {
    return { user: null, error: "No authentication token provided" };
  }

  const {
    data: { user },
    error,
  } = await serviceClient.auth.getUser(accessToken);

  if (error || !user) {
    return { user: null, error: "Invalid or expired token" };
  }

  return { user, error: null };
}
