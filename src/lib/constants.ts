/**
 * Centralized Application Constants
 *
 * Single source of truth for tuning parameters, magic numbers,
 * and shared constant values used across the application.
 * Import from this file instead of hardcoding values.
 */

// ─── Quantity limits ───────────────────────────────────────────
/** Maximum quantity per item in cart / orders — must match across cart-store, order-modal, and orders API */
export const MAX_QUANTITY_PER_ITEM = 99;

// ─── UI Timing (ms) ────────────────────────────────────────────
export const SEARCH_DEBOUNCE_MS = 200;
export const SEARCH_MAX_RESULTS = 6;
export const SCROLL_TO_TOP_THRESHOLD = 400;
export const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes
export const ANNOUNCEMENT_ROTATION_MS = 4000;
export const TOOLTIP_SHOW_DELAY_MS = 3000;
export const ORDER_MODAL_CLOSE_DELAY_MS = 5000;
export const ORDER_MODAL_DELIVERY_FORM_DELAY_MS = 400;
export const ORDER_MODAL_OPTIONS_DELAY_MS = 700;

// ─── Cache TTLs ────────────────────────────────────────────────
export const PRODUCTS_CACHE_TTL_MS = 30_000; // 30 seconds

// ─── Pagination limits ─────────────────────────────────────────
export const ORDERS_DEFAULT_LIMIT = 50;
export const ORDERS_MAX_LIMIT = 100;
export const ADMIN_ORDERS_DEFAULT_LIMIT = 100;
export const ADMIN_ORDERS_MAX_LIMIT = 200;
export const ADMIN_USERS_LIMIT = 200;

// ─── Brand colors ──────────────────────────────────────────────
export const GOLD_GRADIENT_CSS = "linear-gradient(to left, #d4a843, #f0d078, #d4a843)";
export const GOLD_GRADIENT_VERTICAL_CSS = "linear-gradient(to bottom, #d4a843, #f0d078, #d4a843)";
export const THEME_COLOR = "#d4a843";

// ─── Order statuses ────────────────────────────────────────────
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  new: "جديد",
};

// Legacy status mapping — for orders inserted with status: "new" before migration
export const LEGACY_STATUS_LABELS: Record<string, string> = {
  new: "قيد الانتظار",
};

// ─── Locale / Timezone ─────────────────────────────────────────
export const APP_LOCALE = "ar-YE";
export const APP_TIMEZONE = "Asia/Aden";

// ─── Number locale ─────────────────────────────────────────────
export const CURRENCY_LOCALE = "ar-SA";
export const CURRENCY_SUFFIX = "ر.ي";

// ─── Order number generation ───────────────────────────────────
export const ORDER_NUMBER_PREFIX = "ORD";
export const ORDER_NUMBER_RANDOM_LENGTH = 8;

/**
 * Generate a unique order number.
 * Format: ORD-XXXXXXXX (8 random hex chars, uppercase)
 */
export function generateOrderNumber(): string {
  return `${ORDER_NUMBER_PREFIX}-${crypto.randomUUID().substring(0, ORDER_NUMBER_RANDOM_LENGTH).toUpperCase()}`;
}

// ─── Database migrations ────────────────────────────────────────
/**
 * Shared list of ALTER TABLE statements for the chat-based ordering columns.
 * Used by both /api/migrate and /api/migrate-db to avoid drift between them.
 */
export const ORDERS_MIGRATION_COLUMNS: readonly string[] = [
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup'",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS province VARCHAR(100)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS district VARCHAR(100)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS street VARCHAR(255)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS landmark VARCHAR(255)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(500)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2)",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
] as const;

/** Joined SQL block (with trailing indexes) for migrate-db single-statement execution */
export const ORDERS_MIGRATION_SQL_BLOCK = `
-- MIGRATION: Add chat-based ordering columns to orders table
${ORDERS_MIGRATION_COLUMNS.join(";\n")};
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`;
