import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
