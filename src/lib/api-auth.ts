/**
 * API Authentication Helpers
 *
 * Provides utility functions for adding authentication headers
 * to API requests from the client side. Extracts the Supabase
 * access token from the auth store's session.
 *
 * Usage:
 * ```ts
 * import { getAuthHeaders, authFetch } from '@/lib/api-auth'
 *
 * // Option 1: Get headers and merge manually
 * const res = await fetch('/api/orders', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
 *   body: JSON.stringify(data),
 * })
 *
 * // Option 2: Use authFetch helper
 * const res = await authFetch('/api/orders', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(data),
 * })
 * ```
 */

import { useAuthStore } from "@/store/auth-store";

/**
 * Get authentication headers for API requests.
 * Extracts the access token from the current Supabase session
 * stored in the auth Zustand store.
 *
 * Returns an object with the Authorization header if a session exists,
 * or an empty object if not authenticated.
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
 *
 * The Authorization header is added automatically from the
 * current Supabase session. Existing headers in the options
 * are preserved (auth headers won't override explicit ones).
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
 *
 * Use this instead of raw fetch() for any API calls that
 * require authentication (orders, coupons, contact, etc.).
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(input, authFetchOptions(init));
}
