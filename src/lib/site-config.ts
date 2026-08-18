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
// Production MUST set env vars — empty-string fallbacks prevent accidental
// leakage of the owner's personal contact info into production builds.
// (H20 fix: previously these fell back to real phone/email/Telegram URLs,
//  which meant forgetting to set env vars in a new deployment silently
//  exposed personal data to customers.)
//
// Behavior:
//   - env var set              → use env var (works in any environment)
//   - env var unset, dev       → use DEV_CONTACT fallback (local UX intact)
//   - env var unset, production → empty string (link/button hidden by callers)
const DEV_CONTACT = {
  whatsapp: "967782138587",
  telegram: "https://t.me/tariq77087",
  email: "tariq770871@gmail.com",
  facebook: "https://www.facebook.com/share/1Gr8vRUE4M/",
};

const isDev = process.env.NODE_ENV === "development";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || (isDev ? DEV_CONTACT.whatsapp : "");
export const WHATSAPP_LINK = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "";
export const TELEGRAM_LINK =
  process.env.NEXT_PUBLIC_TELEGRAM_LINK || (isDev ? DEV_CONTACT.telegram : "");
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || (isDev ? DEV_CONTACT.email : "");
export const FACEBOOK_LINK =
  process.env.NEXT_PUBLIC_FACEBOOK_LINK || (isDev ? DEV_CONTACT.facebook : "");

// Build-time sanity check: warn (not throw) so the build still succeeds
// but operators see the missing-env-var warning in production build logs.
if (process.env.NODE_ENV === "production") {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) missing.push("NEXT_PUBLIC_WHATSAPP_NUMBER");
  if (!process.env.NEXT_PUBLIC_TELEGRAM_LINK) missing.push("NEXT_PUBLIC_TELEGRAM_LINK");
  if (!process.env.NEXT_PUBLIC_CONTACT_EMAIL) missing.push("NEXT_PUBLIC_CONTACT_EMAIL");
  if (!process.env.NEXT_PUBLIC_FACEBOOK_LINK) missing.push("NEXT_PUBLIC_FACEBOOK_LINK");
  if (missing.length > 0) {
    console.warn(
      `[site-config] Production is missing contact env vars: ${missing.join(", ")}. ` +
      `Contact links will be hidden on the site until these are set.`
    );
  }
}

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
  if (!WHATSAPP_LINK) return "";
  const message = `مرحباً، أريد طلب المنتج التالي:\n*${productName}*\nمن موقع Elite VIP Shop`;
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppServiceLink(serviceName: string): string {
  if (!WHATSAPP_LINK) return "";
  const message = `مرحباً، أريد الاستفسار عن الخدمة التالية:\n*${serviceName}*\nمن موقع Elite VIP Shop`;
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
}
