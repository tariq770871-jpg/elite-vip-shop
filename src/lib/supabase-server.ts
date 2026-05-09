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
 *   3. Uses the anon key + user's access token for user-scoped operations
 *      that respect RLS
 *
 * IMPORTANT: This file must ONLY be imported in server-side code.
 * Do NOT import this in client components.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ─── Environment variables ──────────────────────────────────────
// NEXT_PUBLIC_SUPABASE_URL is safe to use server-side (it's just a URL)
// SUPABASE_SERVICE_ROLE_KEY must NEVER be prefixed with NEXT_PUBLIC_
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

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
// Respects RLS — uses the anon key + user's access token from cookies

/**
 * Create a Supabase client for Server Components that respects RLS.
 * Reads the user's access token from cookies to authenticate requests.
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
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

  // If we have a refresh token but the access token is expired,
  // attempt to refresh the session
  if (accessToken) {
    const { data: userData, error } = await client.auth.getUser(accessToken);

    if (error && refreshToken) {
      // Access token expired — try to refresh
      const { data: refreshData, error: refreshError } =
        await client.auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (!refreshError && refreshData.session) {
        // Return a new client with the refreshed access token
        return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${refreshData.session.access_token}`,
            },
          },
        });
      }
    }

    // If getUser succeeded, the client is already configured correctly
    if (!error && userData.user) {
      return client;
    }
  }

  // No valid session — return client without auth context (public-only RLS)
  return client;
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

  // Extract token from Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  const headerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  // Fallback: read from cookie header
  let cookieToken: string | null = null;
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/sb-access-token=([^;]+)/);
    cookieToken = match ? match[1] : null;
  }

  const accessToken = headerToken || cookieToken;

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

  // Extract token
  const authHeader = request.headers.get("authorization");
  const headerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  let cookieToken: string | null = null;
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/sb-access-token=([^;]+)/);
    cookieToken = match ? match[1] : null;
  }

  const accessToken = headerToken || cookieToken;

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
