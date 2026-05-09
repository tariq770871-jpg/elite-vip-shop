import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

/** Verify the authenticated user has admin role */
async function verifyAdmin(request: Request) {
  const { user, error: authError } = await verifyAuthToken(request);
  if (authError || !user) {
    return { user: null, errorResponse: NextResponse.json({ error: "غير مصرح به" }, { status: 401 }) };
  }
  const serviceClient = getSupabaseServiceClient();
  if (serviceClient) {
    const { data: profile } = await serviceClient
      .from("users")
      .select("role_id, roles(role_name)")
      .eq("email", user.email)
      .single();
    const roleName = (profile?.roles as { role_name?: string } | null)?.role_name;
    if (roleName !== "admin") {
      return { user: null, errorResponse: NextResponse.json({ error: "ممنوع — يتطلب صلاحية المدير" }, { status: 403 }) };
    }
  }
  return { user, errorResponse: null };
}

export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "contact");
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: "يرجى ملء الاسم والرسالة" }, { status: 400 });
    }

    if (supabase) {
      const { error } = await supabase.from("contact_messages").insert({
        name,
        email: email || null,
        phone: phone || null,
        subject: subject || "رسالة عامة",
        message,
      });

      if (error) {
        console.log("Contact save (table may not exist):", error.message);
      }
    }

    try {
      const baseUrl = new URL(request.url).origin;
      await fetch(`${baseUrl}/api/notify?XTransformPort=3005`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_message",
          data: { name, email, phone, subject, message },
        }),
      });
    } catch {
      // Telegram bot may not be running
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Admin authorization check — only admins can read contact messages (PII)
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;

    if (!supabase) return NextResponse.json({ messages: [] });
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ messages: [] });
    return NextResponse.json({ messages: data });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
