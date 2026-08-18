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
      // validateEnv() already threw inside its body in production, but
      // belt-and-suspenders: if it ever stops throwing, we still exit.
      // Avoid process.exit(1) so the platform gets a clean unhandled
      // rejection that surfaces in logs as the source of the failure.
      throw new Error(
        `[instrumentation] Refusing to boot: missing required env vars: ${result.missing.join(", ")}`
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.info(
        `[instrumentation] Env validation passed. ` +
        `Required vars OK; ${result.warnings.length} optional vars missing.`
      );
    }
  } catch (err) {
    // Re-throw so the boot visibly fails — do NOT swallow.
    // The thrown Error message from validateEnv() is preserved.
    if (process.env.NODE_ENV === "production") {
      throw err;
    }
    // In dev, log and continue (developer can fix at their pace).
    console.warn(`[instrumentation] Env validation warning:`, err instanceof Error ? err.message : String(err));
  }
}
