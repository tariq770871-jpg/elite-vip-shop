import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { escapeHtml, formatAdenTimestamp } from "@/lib/utils";
import { PAYMENT_METHOD_NAMES } from "@/lib/site-config";

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

async function getTelegramConfig(): Promise<TelegramConfig | null> {
  try {
    // Use service client (server-side) — the browser anon client cannot read
    // site_settings rows with type="secret" (RLS blocks anon access to tokens)
    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) return null;

    const { data } = await serviceClient
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
  deliveryType?: string;
  province?: string;
  district?: string;
  street?: string;
  landmark?: string;
}): Promise<boolean> {
  const itemsList = order.items
    .map((i) => `  • ${escapeHtml(i.name)} × ${i.quantity} — ${Number(i.price).toLocaleString("ar-SA")} ر.ي`)
    .join("\n");

  const message = [
    `🛒 <b>طلب جديد!</b>`,
    ``,
    `📦 <b>رقم الطلب:</b> ${escapeHtml(order.orderNumber)}`,
    order.customerName ? `👤 <b>العميل:</b> ${escapeHtml(order.customerName)}` : null,
    order.customerPhone ? `📞 <b>الهاتف:</b> ${escapeHtml(order.customerPhone)}` : null,
    order.deliveryType ? `🚚 <b>نوع الاستلام:</b> ${order.deliveryType === "delivery" ? "توصيل" : "استلام شخصي"}` : null,
    order.province || order.district ? `📍 <b>العنوان:</b> ${[order.province, order.district, order.street, order.landmark].filter(Boolean).map(s => escapeHtml(s!)).join("، ")}` : null,
    order.customerAddress && !order.province ? `📍 <b>العنوان:</b> ${escapeHtml(order.customerAddress)}` : null,
    ``,
    `🧾 <b>المنتجات:</b>`,
    itemsList,
    ``,
    order.discount ? `🏷️ <b>الخصم:</b> ${Number(order.discount).toLocaleString("ar-SA")} ر.ي` : null,
    order.couponCode ? `🎫 <b>كود الخصم:</b> ${escapeHtml(order.couponCode)}` : null,
    `💰 <b>الإجمالي:</b> ${Number(order.total).toLocaleString("ar-SA")} ر.ي`,
    order.paymentMethod ? `💳 <b>طريقة الدفع:</b> ${PAYMENT_METHOD_NAMES[order.paymentMethod] || order.paymentMethod}` : null,
    ``,
    `🕐 ${formatAdenTimestamp()}`,
    ``,
    `━━━━━━━━━━━━━━`,
    `📋 <b>الرد التلقائي للعميل:</b>`,
    ``,
    `💳 اختر طريقة الدفع المفضلة:`,
    `  • جيب`,
    `  • جوالي`,
    `  • ايزي فلوسك`,
    `  • سلطيف`,
    `  • حوالة شبكة محلية`,
    ``,
    `⚠️ <b>تنبيه هام:</b> لا تسلّم المبلغ أو تقوم بالتحويل والإيداع حتى تستلم بضاعتك أو طلبك. هذا الإجراء للتحقق من مصداقية الشراء.`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendTelegramNotification(message);
}
