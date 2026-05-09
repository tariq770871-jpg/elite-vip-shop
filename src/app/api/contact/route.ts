import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { sendTelegramNotification } from "@/lib/telegram";

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

    // Send Telegram notification directly via the telegram library
    try {
      const tgMessage = [
        `📩 <b>رسالة تواصل جديدة</b>`,
        `👤 الاسم: ${name}`,
        email ? `📧 البريد: ${email}` : null,
        phone ? `📞 الهاتف: ${phone}` : null,
        subject ? `📋 الموضوع: ${subject}` : null,
        `💬 الرسالة: ${message}`,
        `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
      ].filter(Boolean).join("\n");

      await sendTelegramNotification(tgMessage);
    } catch {
      // Telegram may not be configured
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
