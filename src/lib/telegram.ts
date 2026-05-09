import { supabase } from "@/lib/supabase";

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

async function getTelegramConfig(): Promise<TelegramConfig | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["telegram_bot_token", "telegram_chat_id"]);

    if (!data || data.length < 2) return null;

    const tokenRow = data.find((r) => r.key === "telegram_bot_token");
    const chatRow = data.find((r) => r.key === "telegram_chat_id");

    if (!tokenRow?.value || !chatRow?.value) return null;
    return { botToken: tokenRow.value, chatId: chatRow.value };
  } catch {
    return null;
  }
}

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const config = await getTelegramConfig();
  if (!config) return false;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendOrderNotification(order: {
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  paymentMethod?: string;
  couponCode?: string;
  discount?: number;
}): Promise<boolean> {
  const itemsList = order.items
    .map((i) => `  • ${i.name} × ${i.quantity} — ${Number(i.price).toLocaleString("ar-SA")} ر.ي`)
    .join("\n");

  const message = [
    `🛒 <b>طلب جديد!</b>`,
    ``,
    `📦 <b>رقم الطلب:</b> ${order.orderNumber}`,
    order.customerName ? `👤 <b>العميل:</b> ${order.customerName}` : null,
    order.customerPhone ? `📞 <b>الهاتف:</b> ${order.customerPhone}` : null,
    order.customerAddress ? `📍 <b>العنوان:</b> ${order.customerAddress}` : null,
    ``,
    `🧾 <b>المنتجات:</b>`,
    itemsList,
    ``,
    order.discount ? `🏷️ <b>الخصم:</b> ${Number(order.discount).toLocaleString("ar-SA")} ر.ي` : null,
    order.couponCode ? `🎫 <b>كود الخصم:</b> ${order.couponCode}` : null,
    `💰 <b>الإجمالي:</b> ${Number(order.total).toLocaleString("ar-SA")} ر.ي`,
    order.paymentMethod ? `💳 <b>طريقة الدفع:</b> ${order.paymentMethod === "whatsapp" ? "واتساب" : "رسالة نصية"}` : null,
    ``,
    `🕐 ${new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", dateStyle: "short", timeStyle: "short" })}`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendTelegramNotification(message);
}
