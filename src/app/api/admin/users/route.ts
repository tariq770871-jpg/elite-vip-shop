import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Fetch all users with their roles
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ users: [], total: 0 });
    }

    const { data: users, error, count } = await supabase
      .from("users")
      .select("user_id, name, email, phone, is_active, created_at, role_id, roles(role_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      // Fallback without join if roles table doesn't exist as expected
      const { data: usersSimple, error: e2, count: c2 } = await supabase
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
