import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Middleware: Admin API Authentication
 *
 * Protects /api/admin/* routes by verifying the Supabase auth session.
 * - Reads the Authorization header (Bearer token) or sb-* cookies
 * - Validates the session using Supabase Auth
 * - Checks that the authenticated user has an admin role
 * - Returns 401 Unauthorized if no valid session
 * - Returns 403 Forbidden if user is not an admin
 * - Allows all other routes to pass through
 */

// Helper: create a Supabase client for middleware (uses service role to verify tokens)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Admin API route protection ──────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    const supabaseAdmin = getSupabaseAdmin();

    // If Supabase is not configured, deny access by default
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      );
    }

    // Extract token from Authorization header (Bearer <token>)
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1];

    // Fallback: check for sb-access-token cookie (Supabase default cookie name)
    const cookieToken = request.cookies.get("sb-access-token")?.value;

    const accessToken = token || cookieToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized — no authentication token provided" },
        { status: 401 }
      );
    }

    // Verify the token with Supabase Auth
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized — invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if the user has an admin role
    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("role_id, roles(role_name)")
      .eq("email", user.email)
      .single();

    const roleName = (userProfile?.roles as { role_name?: string } | null)
      ?.role_name;

    if (roleName !== "admin") {
      return NextResponse.json(
        { error: "Forbidden — admin access required" },
        { status: 403 }
      );
    }

    // Token is valid and user is admin — add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email || "");
    requestHeaders.set("x-user-role", "admin");

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ─── All other routes pass through ───────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
