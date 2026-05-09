import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware: Session refresh + Admin API Authentication
 *
 * 1. Refreshes Supabase auth sessions on every matched route by reading
 *    and updating cookies via @supabase/ssr. This ensures server components
 *    and API routes always have a valid session.
 *
 * 2. Protects /api/admin/* routes by verifying the Supabase auth session.
 *    - Reads the Authorization header (Bearer token) or cookies
 *    - Validates the session using Supabase Auth
 *    - Checks that the authenticated user has an admin role
 *    - Returns 401 Unauthorized if no valid session
 *    - Returns 403 Forbidden if user is not an admin
 *    - Allows all other routes to pass through
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Step 1: Refresh session cookies on ALL matched routes ────────
  // This ensures that server components always have fresh session data.
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Set cookies on the request so downstream handlers can read them
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            // Create a new response with updated cookies
            supabaseResponse = NextResponse.next({
              request,
            });
            // Set cookies on the response so the browser stores them
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      // Refresh the session — this will update the cookie if needed
      await supabase.auth.getUser();
    }
  } catch {
    // If session refresh fails, continue without auth context
    // (e.g., user is not logged in)
  }

  // ─── Step 2: Admin API route protection ──────────────────────────
  if (pathname.startsWith("/api/admin")) {
    // Try Authorization header first (set by client-side API calls)
    const authHeader = request.headers.get("authorization");
    const headerToken =
      authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1];

    // Fallback: check for sb-access-token cookie (set by @supabase/ssr browser client)
    const cookieToken = request.cookies.get("sb-access-token")?.value;

    const accessToken = headerToken || cookieToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized — no authentication token provided" },
        { status: 401 }
      );
    }

    // Verify the token with Supabase Auth using service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      );
    }

    // Use a fresh client with service role to verify the token
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

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

    // Merge with any cookie updates from Step 1
    const adminResponse = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Preserve any cookie updates from the session refresh
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      adminResponse.cookies.set(cookie.name, cookie.value);
    });

    return adminResponse;
  }

  // ─── All other routes — return session-refreshed response ─────────
  return supabaseResponse;
}

export const config = {
  // Match all routes except static assets and Next.js internals
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/profile/:path*",
    "/checkout/:path*",
  ],
};
