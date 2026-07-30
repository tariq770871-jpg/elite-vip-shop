import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { timingSafeEqual } from "crypto"
import { APP_LOCALE, APP_TIMEZONE, CURRENCY_LOCALE, CURRENCY_SUFFIX } from "@/lib/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Escape HTML special characters to prevent injection when user input
 * is interpolated into HTML strings (e.g., Telegram messages with parse_mode: "HTML").
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Safely serialize data for use in <script type="application/ld+json">.
 * Escapes </script> sequences to prevent script injection attacks.
 * JSON.stringify alone does NOT escape </script>, allowing an attacker
 * to break out of the script tag if any user-controlled data contains "</script>".
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f");
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Shared utility used by migration routes.
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/**
 * Calculate the effective price considering sale price.
 * Returns salePrice if it exists and is lower than the regular price, otherwise returns price.
 */
export function getEffectivePrice(price: number, salePrice?: number | null): number {
  return salePrice != null && salePrice < price ? salePrice : price;
}

/**
 * Safely parse request body as JSON with error handling.
 * Returns parsed body or null if parsing fails.
 */
export async function safeParseJson(request: Request): Promise<{ data: unknown | null; error: string | null }> {
  try {
    const data = await request.json();
    return { data, error: null };
  } catch {
    return { data: null, error: "صيغة البيانات غير صالحة" };
  }
}

/**
 * Format a Date / timestamp as a localized Arabic string for the Asia/Aden timezone.
 * Centralized to avoid the same `toLocaleString("ar-YE", { timeZone: "Asia/Aden", ... })`
 * being duplicated across telegram.ts, notify/route.ts and contact/route.ts.
 */
export function formatAdenTimestamp(date: Date = new Date()): string {
  return date.toLocaleString(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Format a numeric amount as a localized currency string (e.g., "1,234 ر.ي").
 * Centralized to ensure consistent currency formatting across all components.
 */
export function formatCurrency(amount: number): string {
  return `${Number(amount).toLocaleString(CURRENCY_LOCALE)} ${CURRENCY_SUFFIX}`;
}

/**
 * Safely parse JSON from a fetch Response, returning null if the body
 * is not valid JSON (e.g., when the server returned an HTML error page).
 */
export async function safeReadJson<T = unknown>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Safely parse a URL string, returning null on failure instead of throwing.
 * Use this for `document.referrer` or any user-supplied URL.
 */
export function safeParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
