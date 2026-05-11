import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

/**
 * GET /api/health
 *
 * Health check endpoint for production monitoring.
 * Verifies database connectivity and environment configuration.
 * Returns a structured status response.
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

  const missingEnvVars = requiredEnvVars.filter(
    (name) => !process.env[name]
  );

  checks.environment = missingEnvVars.length > 0
    ? {
        status: "error",
        detail: `Missing: ${missingEnvVars.join(", ")}`,
      }
    : { status: "ok" };

  // ─── Check 2: Database Connectivity ─────────────────────────
  try {
    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      checks.database = {
        status: "error",
        detail: "Supabase service client unavailable — check environment variables",
      };
    } else {
      const dbStart = Date.now();
      const { error } = await serviceClient
        .from("products")
        .select("product_id")
        .limit(1);

      checks.database = error
        ? { status: "error", detail: error.message }
        : { status: "ok", latency: Date.now() - dbStart };
    }
  } catch (err) {
    checks.database = {
      status: "error",
      detail: err instanceof Error ? err.message : "Unknown database error",
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
      version: process.env.NEXT_PUBLIC_SITE_URL ? "production" : "development",
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      checks,
    },
    { status: httpStatus }
  );
}
