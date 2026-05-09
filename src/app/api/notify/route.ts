import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";
import { verifyAuthToken } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

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
  try {
    // Auth check: only authenticated users can send notifications
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: "غير مصرح به" }, { status: 401 });
    }

    const body = await request.json();
    const { event, data = {} } = body;

    if (!event) return NextResponse.json({ ok: false });

    // Sanitize input: strip HTML tags from event and data values
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, "").trim();
    const sanitizedEvent = sanitize(event);
    const sanitizedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedData[sanitize(key)] = typeof value === "string" ? sanitize(value) : value;
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
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      case "register":
        message = [
          `${emoji} <b>مستخدم جديد سجّل في المتجر!</b>`,
          sanitizedData.name ? `👤 الاسم: ${sanitizedData.name}` : null,
          sanitizedData.email ? `📧 البريد: ${sanitizedData.email}` : null,
          sanitizedData.phone ? `📞 الهاتف: ${sanitizedData.phone}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      case "login":
        message = [
          `${emoji} <b>تسجيل دخول</b>`,
          sanitizedData.name ? `👤 ${sanitizedData.name}` : null,
          sanitizedData.email ? `📧 ${sanitizedData.email}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      case "add_to_cart":
        message = [
          `${emoji} <b>إضافة منتج للسلة</b>`,
          sanitizedData.productName ? `📦 المنتج: ${sanitizedData.productName}` : null,
          sanitizedData.price ? `💰 السعر: ${Number(sanitizedData.price).toLocaleString("ar-SA")} ر.ي` : null,
          sanitizedData.userName ? `👤 العميل: ${sanitizedData.userName}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      case "whatsapp_click":
        message = [
          `${emoji} <b>عميل نقر على واتساب</b>`,
          sanitizedData.productName ? `📦 المنتج: ${sanitizedData.productName}` : null,
          sanitizedData.userName ? `👤 العميل: ${sanitizedData.userName}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
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
