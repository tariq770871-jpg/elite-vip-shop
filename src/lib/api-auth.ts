/**
 * API Authentication Helpers
 *
 * Provides utility functions for adding authentication headers
 * to API requests from the client side. Extracts the Supabase
 * access token from the auth store's session.
 *
 * Also provides server-side admin verification for API routes.
 *
 * Usage (client):
 * ```ts
 * import { getAuthHeaders, authFetch } from '@/lib/api-auth'
 * const res = await fetch('/api/orders', {
 *   headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
 * })
 * ```
 *
 * Usage (server API routes):
 * ```ts
 * import { verifyAdmin } from '@/lib/api-auth'
 * const { user, errorResponse } = await verifyAdmin(request)
 * if (errorResponse) return errorResponse
 * ```
 */

import { useAuthStore } from "@/store/auth-store";

// ─── Client-side helpers ────────────────────────────────────────

/**
 * Get authentication headers for API requests.
 * Extracts the access token from the current Supabase session
 * stored in the auth Zustand store.
 */
export function getAuthHeaders(): Record<string, string> {
  const { session } = useAuthStore.getState();
  const headers: Record<string, string> = {};

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return headers;
}

/**
 * Create authenticated fetch options by merging auth headers
 * with the provided options.
 */
export function authFetchOptions(
  options: RequestInit = {}
): RequestInit {
  const authHeaders = getAuthHeaders();
  const existingHeaders =
    options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : typeof options.headers === "object" && options.headers !== null
        ? (options.headers as Record<string, string>)
        : {};

  return {
    ...options,
    headers: {
      ...authHeaders,
      ...existingHeaders,
    },
  };
}

/**
 * Convenience wrapper around fetch() that automatically
 * includes the Authorization header from the current session.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(input, authFetchOptions(init));
}
