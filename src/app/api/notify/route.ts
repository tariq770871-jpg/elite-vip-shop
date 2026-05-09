import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";

const EMOJIS: Record<string, string> = {
  visit: "👁️",
  register: "🎉",
  login: "🔑",
  add_to_cart: "🛍️",
  whatsapp_click: "💬",
  review: "⭐",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, data = {} } = body;

    if (!event) return NextResponse.json({ ok: false });

    const emoji = EMOJIS[event] || "📌";
    let message = "";

    switch (event) {
      case "visit":
        message = [
          `${emoji} <b>زيارة جديدة للموقع</b>`,
          data.page ? `📄 الصفحة: ${data.page}` : null,
          data.referrer ? `🔗 المصدر: ${data.referrer}` : null,
          data.device ? `📱 الجهاز: ${data.device}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      case "register":
        message = [
          `${emoji} <b>مستخدم جديد سجّل في المتجر!</b>`,
          data.name ? `👤 الاسم: ${data.name}` : null,
          data.email ? `📧 البريد: ${data.email}` : null,
          data.phone ? `📞 الهاتف: ${data.phone}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      case "login":
        message = [
          `${emoji} <b>تسجيل دخول</b>`,
          data.name ? `👤 ${data.name}` : null,
          data.email ? `📧 ${data.email}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      case "add_to_cart":
        message = [
          `${emoji} <b>إضافة منتج للسلة</b>`,
          data.productName ? `📦 المنتج: ${data.productName}` : null,
          data.price ? `💰 السعر: ${Number(data.price).toLocaleString("ar-SA")} ر.ي` : null,
          data.userName ? `👤 العميل: ${data.userName}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      case "whatsapp_click":
        message = [
          `${emoji} <b>عميل نقر على واتساب</b>`,
          data.productName ? `📦 المنتج: ${data.productName}` : null,
          data.userName ? `👤 العميل: ${data.userName}` : null,
          `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
        ].filter(Boolean).join("\n");
        break;

      default:
        message = `${emoji} <b>حدث جديد: ${event}</b>\n${JSON.stringify(data)}`;
    }

    await sendTelegramNotification(message);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
