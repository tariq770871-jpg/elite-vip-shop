/**
 * Site Configuration — Single Source of Truth
 *
 * All site-wide constants (URL, name, WhatsApp, etc.) are defined here.
 * Use environment variables with safe fallbacks for development.
 * Import from this file instead of hardcoding values elsewhere.
 */

// ─── Site URL ──────────────────────────────────────────────────
// NEXT_PUBLIC_SITE_URL must be set in production.
// Falls back to localhost for local development only.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://elite-vip-shop.vercel.app");

// ─── Site Identity ─────────────────────────────────────────────
export const SITE_NAME = "Elite VIP Shop - متجر النخبة";
export const SITE_DESCRIPTION =
  "منصة النخبة المتكاملة — متجر، تطبيقات وأدوات، خدمات رقمية، تداول، وربح من الإنترنت. أفضل المنتجات بأسعار تنافسية مع ضمان الجودة.";

// ─── Contact ───────────────────────────────────────────────────
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "967782138587";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const TELEGRAM_LINK = process.env.NEXT_PUBLIC_TELEGRAM_LINK || "https://t.me/tariq77087";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "tariq770871@gmail.com";
export const FACEBOOK_LINK = process.env.NEXT_PUBLIC_FACEBOOK_LINK || "https://www.facebook.com/share/1Gr8vRUE4M/";

// ─── Payment Methods ───────────────────────────────────────────
export const PAYMENT_METHOD_NAMES: Record<string, string> = {
  jeeb: "جيب",
  jawaly: "جوالي",
  easy_fulusk: "ايزي فلوسك",
  saltef: "سلطيف",
  local_transfer: "حوالة شبكة محلية",
  whatsapp: "واتساب",
  sms: "رسالة نصية",
  in_app: "طلب عبر الموقع",
};

// ─── Helper Functions ──────────────────────────────────────────
export function getWhatsAppOrderLink(productName: string): string {
  const message = `مرحباً، أريد طلب المنتج التالي:\n*${productName}*\nمن موقع Elite VIP Shop`;
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppServiceLink(serviceName: string): string {
  const message = `مرحباً، أريد الاستفسار عن الخدمة التالية:\n*${serviceName}*\nمن موقع Elite VIP Shop`;
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
}
