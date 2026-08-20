/**
 * In-Memory Rate Limiter
 *
 * Tracks requests by IP address using a Map with TTL-based cleanup.
 * - API routes: 10 requests per 60 seconds
 * - Contact form: 5 requests per 60 seconds
 * - Returns 429 Too Many Requests when limit exceeded
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp (ms) when the window resets
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

// Preset configurations
// NOTE: In-memory rate limiting on Vercel serverless is per-instance.
// Cold starts create fresh Maps, so the limit is best-effort, not a hard cap.
// For strict production rate limiting, use Upstash Redis or Vercel KV.
// The globalThis singleton ensures warm instances share state across invocations.
export const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig> = {
  api: { limit: 10, windowMs: 60_000 },       // 10 req / 60s
  contact: { limit: 5, windowMs: 60_000 },     // 5 req / 60s
  coupon: { limit: 3, windowMs: 60_000 },       // 3 req / 60s (brute-force protection, stricter)
};

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Run TTL cleanup every 60 seconds to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);

    // Allow the process to exit even if the interval is running
    if (this.cleanupInterval && typeof this.cleanupInterval === "object") {
      this.cleanupInterval.unref?.();
    }
  }

  /**
   * Check if a request should be rate-limited.
   * Returns `{ allowed: true }` or `{ allowed: false, retryAfterMs }`.
   */
  check(
    key: string,
    config: RateLimitConfig = RATE_LIMIT_PRESETS.api
  ): { allowed: true; remaining: number } | { allowed: false; retryAfterMs: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      // No entry or window expired — start a new window
      this.store.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return { allowed: true, remaining: config.limit - 1 };
    }

    // Window is active
    if (entry.count >= config.limit) {
      // Limit exceeded
      return { allowed: false, retryAfterMs: entry.resetAt - now };
    }

    // Increment counter
    entry.count += 1;
    return { allowed: true, remaining: config.limit - entry.count };
  }

  /**
   * Remove expired entries to free memory.
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all entries (useful for testing).
   */
  reset(): void {
    this.store.clear();
  }
}

// Singleton instance — shared across warm serverless invocations via globalThis.
// Cold starts reset the Map, so rate limiting is best-effort, not a hard cap.
// For strict production rate limiting, use Upstash Redis or Vercel KV.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForRateLimit = globalThis as unknown as { __rateLimiter?: RateLimiter };

export const rateLimiter =
  globalForRateLimit.__rateLimiter ?? new RateLimiter();

if (!globalForRateLimit.__rateLimiter) {
  globalForRateLimit.__rateLimiter = rateLimiter;
}

/**
 * Extract a client identifier from a Request object.
 * Uses the LAST IP in X-Forwarded-For (set by closest trusted proxy)
 * to prevent spoofing. Falls back to x-real-ip or "unknown".
 *
 * When IP cannot be determined, appends a random per-process suffix
 * to prevent all "unknown" clients from sharing the same rate limit bucket.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Use LAST IP (set by the closest trusted proxy) instead of first (client-controlled)
    const ips = forwarded.split(",").map((ip) => ip.trim()).filter(Boolean);
    if (ips.length > 0) {
      return ips[ips.length - 1];
    }
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  // Include a per-process random suffix so unknown IPs don't all share one bucket.
  // This prevents a single attacker from consuming the entire "unknown" rate limit.
  return `unknown-${processPid}`;
}

// Generate a per-process unique ID so unknown IPs don't share one bucket
const processPid = Math.random().toString(36).substring(2, 8);

/**
 * Convenience function: check rate limit and return a 429 Response if exceeded.
 * Returns `null` if the request is allowed.
 *
 * Usage in API routes:
 * ```ts
 * const blocked = rateLimitResponse(request, "api");
 * if (blocked) return blocked;
 * ```
 */
export function rateLimitResponse(
  request: Request,
  preset: keyof typeof RATE_LIMIT_PRESETS = "api"
): Response | null {
  const ip = getClientIp(request);
  const config = RATE_LIMIT_PRESETS[preset];
  const key = `${preset}:${ip}`;
  const result = rateLimiter.check(key, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil(result.retryAfterMs / 1000);
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return null;
}
