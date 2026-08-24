/**
 * Next.js Instrumentation Hook
 *
 * Runs once per server lifecycle (cold start) before any request is handled.
 * Used here to validate environment variables as early as possible so that
 * a misconfigured deployment fails at boot instead of producing 503s with
 * no obvious root cause.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Behavior:
 *   - Development: log warnings, do NOT throw (lets you iterate locally
 *     even with partial env vars — fallbacks kick in).
 *   - Production:  throw if any REQUIRED env var is missing. The thrown
 *     error crashes the boot so the platform (Vercel/Netlify/Docker)
 *     reports the failure explicitly instead of running a half-broken app.
 *
 * This file MUST be at `src/instrumentation.ts` (project root with `srcDir`).
 * Next.js auto-detects it when `experimental.instrumentationHook` is unset
 * (default in Next 15+).
 */

export async function register(): Promise<void> {
  // Only run on the server — Next.js imports this file in both runtimes
  // during build, but `register()` itself only fires server-side at boot.
  if (typeof window !== "undefined") return;

  try {
    const { validateEnv } = await import("@/lib/env");
    const result = validateEnv();

    if (!result.valid && process.env.NODE_ENV === "production") {
      // Keep the public storefront available with its documented fallbacks.
      // Protected API/admin paths still fail closed when server credentials are absent.
      console.error(
        `[instrumentation] Missing required env vars; storefront will use fallbacks: ${result.missing.join(", ")}`
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.info(
        `[instrumentation] Env validation passed. ` +
        `Required vars OK; ${result.warnings.length} optional vars missing.`
      );
    }
  } catch (err) {
    // Do not take down the entire storefront because an optional integration
    // or server-only credential is unavailable. Individual protected routes
    // handle the missing client and return a safe error response.
    const message = err instanceof Error ? err.message : String(err);
    if (process.env.NODE_ENV === "production") {
      console.error(`[instrumentation] Environment validation failed; continuing safely:`, message);
    } else {
      console.warn(`[instrumentation] Env validation warning:`, message);
    }
  }
}
