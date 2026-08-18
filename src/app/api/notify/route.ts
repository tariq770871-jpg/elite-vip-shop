import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";
import { verifyAuthToken } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { escapeHtml, formatAdenTimestamp } from "@/lib/utils";
import { isSameOrigin } from "@/lib/origin-check";

const EMOJIS: Record<string, string> = {
  visit: "👁️",
  register: "🎉",
  login: "🔑",
  add_to_cart: "🛍️",
  whatsapp_click: "💬",
  review: "⭐",
};

export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;

  // CSRF / Origin check: even though authenticated events require a
  // token, the "visit" event is unauthenticated and any malicious site
  // could otherwise flood the admin's Telegram with fake "visit" notices
  // from a victim's browser. Browsers always send Origin or Referer on
  // cross-origin POSTs, so requiring a matching Origin stops CSRF-style
  // abuse without breaking legitimate same-site usage.
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "الطلب غير مصرح به (Origin)" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { event, data = {} } = body;

    if (!event) return NextResponse.json({ ok: false });

    // Escape HTML in input to prevent injection in Telegram messages (parse_mode: "HTML")
    const sanitizedEvent = escapeHtml(event).trim();
    const sanitizedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedData[escapeHtml(key).trim()] = typeof value === "string" ? escapeHtml(value) : value;
    }

    // Only "visit" event is allowed without authentication
    // (visitors are unauthenticated — layout-client.tsx sends this before login)
    const PUBLIC_EVENTS = ["visit"];

    if (!PUBLIC_EVENTS.includes(sanitizedEvent)) {
      const { user, error: authError } = await verifyAuthToken(request);
      if (authError || !user) {
        return NextResponse.json({ ok: false, error: "غير مصرح به" }, { status: 401 });
      }
    }

    const emoji = EMOJIS[sanitizedEvent] || "📌";
    let message = "";

    switch (sanitizedEvent) {
      case "visit":
        message = [
          `${emoji} <b>زيارة جديدة للموقع</b>`,
          sanitizedData.page ? `📄 الصفحة: ${sanitizedData.page}` : null,
          sanitizedData.referrer ? `🔗 المصدر: ${sanitizedData.referrer}` : null,
          sanitizedData.device ? `📱 الجهاز: ${sanitizedData.device}` : null,
          `🕐 ${formatAdenTimestamp()}`,
        ].filter(Boolean).join("\n");
        break;

      case "register":
        message = [
          `${emoji} <b>مستخدم جديد سجّل في المتجر!</b>`,
          `🕐 ${formatAdenTimestamp()}`,
        ].filter(Boolean).join("\n");
        break;

      case "login":
        message = [
          `${emoji} <b>تسجيل دخول</b>`,
          `🕐 ${formatAdenTimestamp()}`,
        ].filter(Boolean).join("\n");
        break;

      case "add_to_cart":
        message = [
          `${emoji} <b>إضافة منتج للسلة</b>`,
          sanitizedData.productName ? `📦 المنتج: ${sanitizedData.productName}` : null,
          sanitizedData.price ? `💰 السعر: ${Number(sanitizedData.price).toLocaleString("ar-SA")} ر.ي` : null,
          sanitizedData.userName ? `👤 العميل: ${sanitizedData.userName}` : null,
          `🕐 ${formatAdenTimestamp()}`,
        ].filter(Boolean).join("\n");
        break;

      case "whatsapp_click":
        message = [
          `${emoji} <b>عميل نقر على واتساب</b>`,
          sanitizedData.productName ? `📦 المنتج: ${sanitizedData.productName}` : null,
          sanitizedData.userName ? `👤 العميل: ${sanitizedData.userName}` : null,
          `🕐 ${formatAdenTimestamp()}`,
        ].filter(Boolean).join("\n");
        break;

      default:
        message = `${emoji} <b>حدث جديد: ${sanitizedEvent}</b>\n${JSON.stringify(sanitizedData)}`;
    }

    await sendTelegramNotification(message);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
