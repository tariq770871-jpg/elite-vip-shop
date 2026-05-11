import { NextResponse } from "next/server";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      // Return 401 instead of defaulting to "user" — prevents role probing
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 });
    }

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ role: "user" });
    }

    // ── Query both tables in parallel instead of sequentially ──
    // Previously: profiles first, then users only if not admin (2 round-trips for non-admins)
    // Now: both queries fire simultaneously, cutting latency ~50% for non-admin users
    const [profileResult, legacyResult] = await Promise.all([
      serviceClient
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single(),
      serviceClient
        .from("users")
        .select("role_id, roles(role_name)")
        .eq("email", user.email)
        .single(),
    ]);

    if (profileResult.data?.is_admin === true) {
      return NextResponse.json({ role: "admin" });
    }

    const roleName = (legacyResult.data?.roles as { role_name?: string } | null)?.role_name || "user";
    return NextResponse.json({ role: roleName });
  } catch {
    return NextResponse.json({ role: "user" });
  }
}
