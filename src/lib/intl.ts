export const DEFAULT_LOCALE = "ar-YE";
export const DEFAULT_CURRENCY = "YER";

function toFiniteNumber(value: number | string): number | null {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

/**
 * Normalize supported storefront locales while keeping Arabic as the default.
 * Additional translations can build on this boundary without changing callers.
 */
export function normalizeLocale(locale?: string): string {
  return locale?.toLowerCase().startsWith("en") ? "en-US" : DEFAULT_LOCALE;
}

export function formatNumber(value: number | string, locale = DEFAULT_LOCALE): string {
  const numberValue = toFiniteNumber(value);
  if (numberValue === null) return "—";

  return new Intl.NumberFormat(normalizeLocale(locale), {
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export function formatCurrency(value: number | string, locale = DEFAULT_LOCALE): string {
  const numberValue = toFiniteNumber(value);
  if (numberValue === null) return "—";

  return new Intl.NumberFormat(normalizeLocale(locale), {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(numberValue);
}
