import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

/**
 * POST /api/migrate-db
 * 
 * Checks if chat-based ordering columns exist in the orders table.
 * If not, returns the SQL migration script to run manually.
 * 
 * Security: Requires the SUPABASE_SERVICE_ROLE_KEY as Bearer token.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = getSupabaseServiceClient();
  if (!serviceClient) {
    return NextResponse.json({ error: "Service client unavailable" }, { status: 503 });
  }

  // Check if columns already exist
  const { data: testData, error: testError } = await serviceClient
    .from("orders")
    .select("order_id, delivery_type, customer_name, customer_phone, province, district, street, landmark, seller_id, product_id, product_name_snapshot, unit_price, quantity, total_price")
    .limit(1);

  if (!testError) {
    return NextResponse.json({
      status: "already_migrated",
      message: "All chat-based ordering columns already exist in the orders table",
    });
  }

  const migrationSQL = `-- Migration: Add chat-based ordering columns to orders table
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
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`;

  return NextResponse.json({
    status: "migration_needed",
    message: "The orders table is missing chat-based ordering columns. Please run the migration SQL in Supabase Dashboard > SQL Editor.",
    sql: migrationSQL,
    missingColumn: testError.message,
    sqlFilePath: "supabase-migrations/003_chat_orders_columns.sql",
  });
}
