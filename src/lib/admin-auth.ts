/**
 * Server-side Admin Verification
 *
 * Verifies that a request comes from an authenticated admin user.
 * This file should ONLY be imported in API route handlers (server-side).
 *
 * Usage:
 * ```ts
 * import { verifyAdmin } from '@/lib/admin-auth'
 * const { user, errorResponse } = await verifyAdmin(request)
 * if (errorResponse) return errorResponse
 * ```
 */

import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { extractRoleName } from "@/types/db";

/**
 * Verify that the request comes from an authenticated admin user.
 * Uses the profiles table (is_admin column) for role checking,
 * with fallback to the legacy users/roles tables.
 *
 * Returns { user, errorResponse } where:
 * - user is the Supabase Auth user object if valid admin
 * - errorResponse is a NextResponse to return if verification fails
 */
export async function verifyAdmin(request: Request): Promise<{
  user: Awaited<ReturnType<typeof verifyAuthToken>>["user"];
  errorResponse: NextResponse | null;
}> {
  const { user, error: authError } = await verifyAuthToken(request);
  if (authError || !user) {
    return { user: null, errorResponse: NextResponse.json({ error: "غير مصرح به" }, { status: 401 }) };
  }

  const serviceClient = getSupabaseServiceClient();
  if (!serviceClient) {
    return { user: null, errorResponse: NextResponse.json({ error: "خدمة المصادقة غير متاحة" }, { status: 503 }) };
  }

  // Try profiles table first (new schema)
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (profile?.is_admin === true) {
    return { user, errorResponse: null };
  }

  // Fallback: check users table with roles join (legacy schema)
  const { data: legacyProfile } = await serviceClient
    .from("users")
    .select("role_id, roles(role_name)")
    .eq("email", user.email)
    .single();

  const roleName = extractRoleName(legacyProfile?.roles);
  if (roleName === "admin" || roleName === "owner") {
    return { user, errorResponse: null };
  }

  return { user: null, errorResponse: NextResponse.json({ error: "صلاحيات غير كافية" }, { status: 403 }) };
}
