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
 * Checks the `Authorization: Bearer <token>` header first,
 * then falls back to the `sb-access-token` cookie.
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

  // 2. Cookie: try structured API first (NextRequest), then raw header parsing
  //    NextRequest has request.cookies.get(), generic Request does not.
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/sb-access-token=([^;]+)/);
    if (match) return match[1];
  }

  return null;
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
