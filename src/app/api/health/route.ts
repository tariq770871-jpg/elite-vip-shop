import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

/**
 * GET /api/health
 *
 * Health check endpoint for production monitoring.
 * Verifies database connectivity and environment configuration.
 * SECURITY: Does NOT expose env var names or DB error details to callers.
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: "ok" | "error"; latency?: number; detail?: string }> = {};

  // ─── Check 1: Environment Variables ─────────────────────────
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missingCount = requiredEnvVars.filter(
    (name) => !process.env[name]
  ).length;

  // Log names server-side only (visible in Vercel/logs, not to API callers)
  if (missingCount > 0) {
    const missingNames = requiredEnvVars.filter((n) => !process.env[n]);
    console.error("[health] Missing env vars:", missingNames.join(", "));
  }

  checks.environment = missingCount > 0
    ? {
        status: "error",
        detail: `${missingCount} required configuration value(s) missing`,
      }
    : { status: "ok" };

  // ─── Check 2: Database Connectivity ─────────────────────────
  try {
    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      checks.database = {
        status: "error",
        detail: "Service client unavailable",
      };
    } else {
      const dbStart = Date.now();
      const { error } = await serviceClient
        .from("products")
        .select("product_id")
        .limit(1);

      checks.database = error
        ? { status: "error", detail: "Database query failed" }
        : { status: "ok", latency: Date.now() - dbStart };
    }
  } catch (err) {
    // Log real error server-side, return generic message to caller
    console.error("[health] DB connection error:", err instanceof Error ? err.message : err);
    checks.database = {
      status: "error",
      detail: "Database connection failed",
    };
  }

  // ─── Overall Status ─────────────────────────────────────────
  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const overallStatus = allOk ? "healthy" : "degraded";
  const httpStatus = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      // Only indicate env type, never expose internal details
      checks,
      latency: Date.now() - startTime,
    },
    { status: httpStatus }
  );
}
