import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { verifyAdmin } from "@/lib/admin-auth";
import { rateLimitResponse } from "@/lib/rate-limit";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "contact");
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: "يرجى ملء الاسم والرسالة" }, { status: 400 });
    }

    const serviceClient = getSupabaseServiceClient();
    if (serviceClient) {
      const { error } = await serviceClient.from("contact_messages").insert({
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

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) return NextResponse.json({ messages: [] });
    const { data, error } = await serviceClient
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
