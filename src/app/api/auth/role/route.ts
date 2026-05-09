import { NextResponse } from "next/server";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      return NextResponse.json({ role: "user" });
    }

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ role: "user" });
    }

    const { data: profile } = await serviceClient
      .from("users")
      .select("role_id, roles(role_name)")
      .eq("email", user.email)
      .single();

    const roleName = (profile?.roles as { role_name?: string } | null)?.role_name || "user";
    return NextResponse.json({ role: roleName });
  } catch {
    return NextResponse.json({ role: "user" });
  }
}
