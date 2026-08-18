import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { extractAccessToken } from "@/lib/supabase-server";
import { extractRoleName } from "@/types/db";
import { randomBytes } from "crypto";

/**
 * Generate a fresh nonce for CSP per request.
 * Base64-encoded 18 bytes (24 chars) — sufficient entropy for CSP nonces.
 */
function generateNonce(): string {
  return randomBytes(18).toString("base64");
}

/**
 * Build the Content-Security-Policy header value with the given nonce.
 * 'strict-dynamic' allows scripts loaded by nonced scripts to run,
 * so we don't need to whitelist every domain.
 */
function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in https://www.google-analytics.com https://www.googletagmanager.com https://api.telegram.org",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.supabase.co",
  ].join("; ");
}

/**
 * Middleware: Session refresh + Admin API Authentication + CSP nonce injection
 *
 * 1. Generates a per-request CSP nonce and sets it as a request header (x-nonce)
 *    so the layout can read it via headers() and add `nonce={nonce}` to inline scripts.
 *    Also sets the Content-Security-Policy response header.
 *
 * 2. Refreshes Supabase auth sessions on every matched route by reading
 *    and updating cookies via @supabase/ssr.
 *
 * 3. Protects /api/admin/* routes by verifying the Supabase auth session.
 *    - Reads the Authorization header (Bearer token) or cookies
 *    - Validates the session using Supabase Auth
 *    - Checks that the authenticated user has an admin role
 *    - Returns 401 Unauthorized if no valid session
 *    - Returns 403 Forbidden if user is not an admin
 *    - Allows all other routes to pass through
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Step 0: Generate per-request CSP nonce ───────────────────────
  // The nonce is forwarded to the layout via the x-nonce request header
  // (so server components can read it via headers() from "next/headers").
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // ─── Step 1: Refresh session cookies on ALL matched routes ────────
  // This ensures that server components always have fresh session data.
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set the CSP header on the response (overrides next.config.ts static headers)
  supabaseResponse.headers.set("Content-Security-Policy", buildCSP(nonce));

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
            // Create a new response with updated cookies (preserves nonce + CSP headers)
            supabaseResponse = NextResponse.next({
              request: { headers: requestHeaders },
            });
            // Re-apply the CSP header (the new NextResponse resets headers)
            supabaseResponse.headers.set("Content-Security-Policy", buildCSP(nonce));
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
    // Extract access token using shared utility (Authorization header + cookie fallback)
    const accessToken = extractAccessToken(request);

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

    const roleName = extractRoleName(userProfile?.roles);

    if (roleName !== "admin" && roleName !== "owner") {
      return NextResponse.json(
        { error: "Forbidden — admin access required" },
        { status: 403 }
      );
    }

    // Token is valid and user is admin/owner — add user info to request headers for downstream use
    const adminReqHeaders = new Headers(requestHeaders);
    adminReqHeaders.set("x-user-id", user.id);
    adminReqHeaders.set("x-user-email", user.email || "");
    adminReqHeaders.set("x-user-role", roleName || "admin");

    // Merge with any cookie updates from Step 1
    const adminResponse = NextResponse.next({
      request: { headers: adminReqHeaders },
    });

    // Set the CSP header on the admin response (with the same nonce)
    adminResponse.headers.set("Content-Security-Policy", buildCSP(nonce));

    // Preserve any cookie updates from the session refresh
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      adminResponse.cookies.set(cookie.name, cookie.value);
    });

    return adminResponse;
  }

  // ─── Step 3: Dashboard page protection (admin-only page) ──────────
  if (pathname.startsWith("/dashboard")) {
    const accessToken = extractAccessToken(request);

    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

      if (error || !user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Check admin role via profiles table first, then legacy users/roles
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

      const isAdmin = profile?.is_admin === true;

      if (!isAdmin) {
        // Fallback: check legacy users/roles tables
        const { data: legacyProfile } = await supabaseAdmin
          .from("users")
          .select("role_id, roles(role_name)")
          .eq("email", user.email)
          .single();

        const roleName = extractRoleName(legacyProfile?.roles);
        if (roleName !== "admin" && roleName !== "owner") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ─── All other routes — return session-refreshed response ─────────
  return supabaseResponse;
}

export const config = {
  // Match all routes except:
  //   - _next/static        (static assets — cached, no nonce needed)
  //   - _next/image         (image optimizer)
  //   - favicon.ico         (browser-fetched icon)
  //   - public assets       (icons, manifest, sw.js)
  // Everything else gets a per-request nonce for CSP.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|robots.txt|sitemap.xml).*)",
  ],
};
