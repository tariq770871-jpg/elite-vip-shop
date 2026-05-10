import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { Client } from "pg";
import { timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/**
 * POST /api/migrate
 *
 * Runs the chat-based ordering migration by adding columns to the orders table.
 * Uses direct PostgreSQL connection via pg driver.
 *
 * Security: only allow with service role key as Bearer token.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!authHeader || !safeCompare(authHeader, `Bearer ${serviceKey}`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = getSupabaseServiceClient();
  if (!serviceClient) {
    return NextResponse.json({ error: "Service client unavailable" }, { status: 503 });
  }

  // Step 1: Check if columns already exist
  const { data: testData, error: testError } = await serviceClient
    .from("orders")
    .select("order_id, delivery_type, customer_name, customer_phone, province, district, street, landmark, seller_id, product_id, product_name_snapshot, unit_price, quantity, total_price")
    .limit(1);

  if (!testError) {
    return NextResponse.json({
      status: "already_migrated",
      message: "All chat-based ordering columns already exist",
    });
  }

  // Step 2: Try direct PostgreSQL connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || serviceKey;

  const sqlStatements = [
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
  ];

  const results: Array<{ sql: string; ok: boolean; detail?: string }> = [];
  let pgConnected = false;

  // Try pooler connection (session mode, port 5432)
  const connectionConfigs = [
    {
      host: "aws-0-us-east-1.pooler.supabase.com",
      port: 5432,
      database: "postgres",
      user: `postgres.${projectRef}`,
      password: dbPassword,
    },
    {
      host: "aws-0-us-east-1.pooler.supabase.com",
      port: 6543,
      database: "postgres",
      user: `postgres.${projectRef}`,
      password: dbPassword,
    },
  ];

  for (const config of connectionConfigs) {
    const client = new Client({
      ...config,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });

    try {
      await client.connect();
      pgConnected = true;

      for (const sql of sqlStatements) {
        try {
          await client.query(sql);
          results.push({ sql: sql.substring(0, 60), ok: true });
        } catch (e: any) {
          results.push({ sql: sql.substring(0, 60), ok: false, detail: e.message?.substring(0, 80) });
        }
      }

      await client.end();
      break; // Success, don't try other configs
    } catch {
      // Try next config
      try { await client.end(); } catch { /* ignore */ }
    }
  }

  if (pgConnected) {
    // Verify migration
    const { error: verifyError } = await serviceClient
      .from("orders")
      .select("order_id, delivery_type, customer_name, customer_phone, product_name_snapshot")
      .limit(1);

    if (!verifyError) {
      return NextResponse.json({
        status: "migration_complete",
        message: "All chat-based ordering columns added successfully",
        results,
      });
    }

    return NextResponse.json({
      status: "partial_migration",
      message: "Some columns may have failed. Check results.",
      results,
    });
  }

  // Fallback: return SQL for manual execution
  return NextResponse.json({
    status: "manual_migration_needed",
    message: "Could not connect to PostgreSQL directly. Please run the migration SQL in Supabase Dashboard → SQL Editor.",
    sql: sqlStatements.join(";\n") + ";",
    results,
    sqlFilePath: "supabase-migrations/003_chat_orders_columns.sql",
  });
}
