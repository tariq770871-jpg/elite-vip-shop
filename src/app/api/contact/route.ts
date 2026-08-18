import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { verifyAdmin } from "@/lib/admin-auth";
import { rateLimitResponse } from "@/lib/rate-limit";
import { sendTelegramNotification } from "@/lib/telegram";
import { escapeHtml, formatAdenTimestamp } from "@/lib/utils";
import { isSameOrigin } from "@/lib/origin-check";

export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "contact");
  if (blocked) return blocked;

  // CSRF / Origin check: this endpoint accepts unauthenticated POSTs from
  // the browser. Without an Origin check, a malicious site could submit
  // fake contact messages via a victim's browser. Browsers always send
  // `Origin` or `Referer` on cross-origin/same-origin POSTs, so the
  // absence of a matching Origin is a strong signal of CSRF or scripted
  // abuse.
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "الطلب غير مصرح به (Origin)" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const rawName = typeof body?.name === "string" ? body.name.trim() : "";
    const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
    const rawPhone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const rawSubject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const rawMessage = typeof body?.message === "string" ? body.message.trim() : "";

    // Required fields
    if (!rawName || !rawMessage) {
      return NextResponse.json({ error: "يرجى ملء الاسم والرسالة" }, { status: 400 });
    }

    // Length limits (prevents storage DoS and abuse)
    if (rawName.length > 100) {
      return NextResponse.json({ error: "الاسم طويل جدًا" }, { status: 400 });
    }
    if (rawMessage.length > 5000) {
      return NextResponse.json({ error: "الرسالة طويلة جدًا (الحد الأقصى 5000 حرف)" }, { status: 400 });
    }
    if (rawSubject.length > 200) {
      return NextResponse.json({ error: "الموضوع طويل جدًا" }, { status: 400 });
    }
    if (rawPhone.length > 30) {
      return NextResponse.json({ error: "رقم الهاتف طويل جدًا" }, { status: 400 });
    }

    // Email format validation (when provided)
    if (rawEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawEmail) || rawEmail.length > 254) {
        return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
      }
    }

    // Phone format validation (when provided) — allow +, digits, spaces, dashes
    if (rawPhone && !/^\+?[0-9\s\-]{7,20}$/.test(rawPhone)) {
      return NextResponse.json({ error: "رقم الهاتف غير صالح" }, { status: 400 });
    }

    const name = rawName;
    const email = rawEmail || null;
    const phone = rawPhone || null;
    const subject = rawSubject || "رسالة عامة";
    const message = rawMessage;

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
        console.warn("Contact save (table may not exist):", error.message);
      }
    }

    // Send Telegram notification directly via the telegram library
    try {
      const tgMessage = [
        `📩 <b>رسالة تواصل جديدة</b>`,
        `👤 الاسم: ${escapeHtml(name)}`,
        email ? `📧 البريد: ${escapeHtml(email)}` : null,
        phone ? `📞 الهاتف: ${escapeHtml(phone)}` : null,
        subject ? `📋 الموضوع: ${escapeHtml(subject)}` : null,
        `💬 الرسالة: ${escapeHtml(message)}`,
        `🕐 ${formatAdenTimestamp()}`,
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
    if (!serviceClient) return NextResponse.json({ error: "خدمة قاعدة البيانات غير متاحة" }, { status: 503 });
    const { data, error } = await serviceClient
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: "فشل في جلب الرسائل" }, { status: 500 });
    return NextResponse.json({ messages: data });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
