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

    // Try profiles table first (new schema)
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

    if (profile?.is_admin === true) {
      return NextResponse.json({ role: "admin" });
    }

    // Fallback: check legacy users/roles tables
    const { data: legacyProfile } = await serviceClient
      .from("users")
      .select("role_id, roles(role_name)")
      .eq("email", user.email)
      .single();

    const roleName = (legacyProfile?.roles as { role_name?: string } | null)?.role_name || "user";
    return NextResponse.json({ role: roleName });
  } catch {
    return NextResponse.json({ role: "user" });
  }
}
