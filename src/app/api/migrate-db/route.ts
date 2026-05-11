import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { safeCompare } from "@/lib/utils";

/**
 * POST /api/migrate-db
 * 
 * Checks if all required tables and columns exist in the database.
 * Returns a comprehensive status report and migration SQL if needed.
 * 
 * Security: Requires the SUPABASE_SERVICE_ROLE_KEY as Bearer token.
 */
export async function POST(request: Request) {
  // Block migration endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Migration endpoints are disabled in production. Use Supabase Dashboard → SQL Editor instead.' },
      { status: 403 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!authHeader || !safeCompare(authHeader, `Bearer ${serviceKey}`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = getSupabaseServiceClient();
  if (!serviceClient) {
    return NextResponse.json({ error: "Service client unavailable" }, { status: 503 });
  }

  const results: Array<{ table: string; status: string; detail?: string }> = [];
  const migrationsNeeded: string[] = [];

  // ─── Check 1: orders table columns ───────────────────────────
  const { error: ordersError } = await serviceClient
    .from("orders")
    .select("order_id, delivery_type, customer_name, customer_phone, province, district, street, landmark, seller_id, product_id, product_name_snapshot, unit_price, quantity, total_price")
    .limit(1);

  if (ordersError) {
    results.push({ table: "orders", status: "migration_needed", detail: ordersError.message });
    migrationsNeeded.push("orders_columns");
  } else {
    results.push({ table: "orders", status: "ok" });
  }

  // ─── Check 2: contact_messages table ─────────────────────────
  const { error: contactError } = await serviceClient
    .from("contact_messages")
    .select("message_id, name, email, phone, subject, message, is_read, created_at")
    .limit(1);

  if (contactError) {
    results.push({ table: "contact_messages", status: "missing", detail: contactError.message });
    migrationsNeeded.push("contact_messages");
  } else {
    results.push({ table: "contact_messages", status: "ok" });
  }

  // ─── Check 3: coupons table ──────────────────────────────────
  const { error: couponsError } = await serviceClient
    .from("coupons")
    .select("coupon_id, code, discount_value, min_order_amount, max_uses, used_count, is_active, valid_from, valid_until, created_at")
    .limit(1);

  if (couponsError) {
    results.push({ table: "coupons", status: "missing", detail: couponsError.message });
    migrationsNeeded.push("coupons");
  } else {
    results.push({ table: "coupons", status: "ok" });
  }

  // ─── Check 4: order_items table ──────────────────────────────
  const { error: orderItemsError } = await serviceClient
    .from("order_items")
    .select("order_item_id, order_id, product_id, product_name, quantity, price")
    .limit(1);

  if (orderItemsError) {
    results.push({ table: "order_items", status: "missing", detail: orderItemsError.message });
    migrationsNeeded.push("order_items");
  } else {
    results.push({ table: "order_items", status: "ok" });
  }

  // If all OK
  if (migrationsNeeded.length === 0) {
    return NextResponse.json({
      status: "all_ok",
      message: "All required tables and columns exist",
      results,
    });
  }

  // Build migration SQL for all missing items
  const sqlParts: string[] = [];

  if (migrationsNeeded.includes("contact_messages")) {
    sqlParts.push(`
-- TABLE: contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  subject VARCHAR(255) DEFAULT 'رسالة عامة',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_created ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_read ON public.contact_messages(is_read);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages_insert_public" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_admin_read" ON public.contact_messages FOR SELECT USING (public.is_admin());
GRANT ALL ON public.contact_messages TO anon, authenticated;`);
  }

  if (migrationsNeeded.includes("coupons")) {
    sqlParts.push(`
-- TABLE: coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  coupon_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_value DECIMAL(5, 2) NOT NULL CHECK (discount_value > 0 AND discount_value <= 100),
  min_order_amount DECIMAL(12, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_admin_all" ON public.coupons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT ALL ON public.coupons TO anon, authenticated;
INSERT INTO public.coupons (code, discount_value, min_order_amount, max_uses, is_active, valid_from, valid_until)
VALUES ('WELCOME10', 10.00, 1000, 100, true, NOW(), NOW() + INTERVAL '6 months'),
       ('VIP20', 20.00, 5000, 50, true, NOW(), NOW() + INTERVAL '3 months')
ON CONFLICT (code) DO NOTHING;`);
  }

  if (migrationsNeeded.includes("order_items")) {
    sqlParts.push(`
-- TABLE: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_orderitems_order ON public.order_items(order_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_read_own" ON public.order_items FOR SELECT USING (order_id IN (SELECT order_id FROM public.orders WHERE user_id = public.current_user_id()));
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT WITH CHECK (order_id IN (SELECT order_id FROM public.orders WHERE user_id = public.current_user_id()));
CREATE POLICY "order_items_admin_read" ON public.order_items FOR SELECT USING (public.is_admin());
GRANT ALL ON public.order_items TO anon, authenticated;`);
  }

  if (migrationsNeeded.includes("orders_columns")) {
    sqlParts.push(`
-- MIGRATION: Add chat-based ordering columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS street VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS landmark VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
  }

  return NextResponse.json({
    status: "migration_needed",
    message: `${migrationsNeeded.length} migration(s) needed. Run the SQL in Supabase Dashboard → SQL Editor.`,
    migrationsNeeded,
    results,
    sql: sqlParts.join("\n\n"),
    sqlFilePath: "scripts/migration-missing-tables.sql",
  });
}
