import { NextResponse } from "next/server";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

/** Verify the authenticated user has admin role */
async function verifyAdmin(request: Request) {
  const { user, error: authError } = await verifyAuthToken(request);
  if (authError || !user) {
    return { user: null, errorResponse: NextResponse.json({ error: "غير مصرح به" }, { status: 401 }) };
  }
  const serviceClient = getSupabaseServiceClient();
  if (!serviceClient) {
    // FAIL CLOSED: deny access when we can't verify the role
    return { user: null, errorResponse: NextResponse.json({ error: "خدمة المصادقة غير متاحة" }, { status: 503 }) };
  }
  const { data: profile } = await serviceClient
    .from("users")
    .select("role_id, roles(role_name)")
    .eq("email", user.email)
    .single();
  const roleName = (profile?.roles as { role_name?: string } | null)?.role_name;
  if (roleName !== "admin") {
    return { user: null, errorResponse: NextResponse.json({ error: "ممنوع — يتطلب صلاحية المدير" }, { status: 403 }) };
  }
  return { user, errorResponse: null };
}

// GET: Fetch all users with their roles (admin only)
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Admin authorization check — only admins can list all users (PII)
    const { errorResponse: getErr } = await verifyAdmin(request);
    if (getErr) return getErr;

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ users: [], total: 0 });
    }

    const { data: users, error, count } = await serviceClient
      .from("users")
      .select("user_id, name, email, phone, is_active, created_at, role_id, roles(role_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      // Fallback without join if roles table doesn't exist as expected
      const { data: usersSimple, error: e2, count: c2 } = await serviceClient
        .from("users")
        .select("user_id, name, email, phone, is_active, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(200);

      if (e2) {
        console.error("Users fetch error:", e2);
        return NextResponse.json({ error: "فشل في جلب المستخدمين" }, { status: 500 });
      }

      return NextResponse.json({
        users: (usersSimple || []).map((u: Record<string, unknown>) => ({
          id: u.user_id,
          name: u.name || "مستخدم",
          email: u.email || "",
          phone: u.phone || "",
          role: "user",
          status: u.is_active ? "نشط" : "معلق",
          created_at: u.created_at,
        })),
        total: c2 || 0,
      });
    }

    const mappedUsers = (users || []).map((u: Record<string, unknown>) => {
      const rolesData = u.roles as { role_name?: string } | null;
      return {
        id: u.user_id,
        name: u.name || "مستخدم",
        email: u.email || "",
        phone: u.phone || "",
        role: rolesData?.role_name || "user",
        status: u.is_active ? "نشط" : "معلق",
        created_at: u.created_at,
      };
    });

    return NextResponse.json({ users: mappedUsers, total: count || 0 });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: "حدث خطأ في جلب المستخدمين" }, { status: 500 });
  }
}

// PATCH: Update a user's name (admin only)
export async function PATCH(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Admin authorization check — verify admin role
    const { errorResponse: patchErr } = await verifyAdmin(request);
    if (patchErr) return patchErr;

    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: "معرف المستخدم والاسم مطلوبان" }, { status: 400 });
    }

    const sc = getSupabaseServiceClient();
    if (!sc) {
      return NextResponse.json({ success: true });
    }

    const { error } = await sc
      .from("users")
      .update({ name })
      .eq("user_id", userId);

    if (error) {
      console.error("User update error:", error);
      return NextResponse.json({ error: "فشل في تحديث المستخدم" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user patch error:", error);
    return NextResponse.json({ error: "حدث خطأ في تحديث المستخدم" }, { status: 500 });
  }
}

// DELETE: Deactivate a user (admin only) — soft delete by setting is_active = false
export async function DELETE(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Admin authorization check — verify admin role
    const { errorResponse: deleteErr } = await verifyAdmin(request);
    if (deleteErr) return deleteErr;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    const sc = getSupabaseServiceClient();
    if (!sc) {
      return NextResponse.json({ success: true });
    }

    // Soft delete: deactivate instead of removing to preserve data integrity
    const { error } = await sc
      .from("users")
      .update({ is_active: false })
      .eq("user_id", userId);

    if (error) {
      console.error("User deactivate error:", error);
      return NextResponse.json({ error: "فشل في تعطيل المستخدم" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ error: "حدث خطأ في حذف المستخدم" }, { status: 500 });
  }
}
