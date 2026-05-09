import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  // Security: only allow with service role key
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = getSupabaseServiceClient();
  if (!serviceClient) {
    return NextResponse.json({ error: "Service client unavailable" }, { status: 503 });
  }

  const results: string[] = [];

  // Check if columns exist by trying to select with them
  const { data: testData, error: testError } = await serviceClient
    .from("orders")
    .select("order_id, delivery_type, customer_name, customer_phone, province, district, street, landmark, seller_id, product_id, product_name_snapshot, unit_price, quantity, total_price")
    .limit(1);

  if (!testError) {
    results.push("All new columns already exist - no migration needed");
    return NextResponse.json({ results, status: "already_migrated" });
  }

  // Columns don't exist - try to add them via Supabase SQL
  // Since we can't use raw SQL via PostgREST, we'll use a workaround:
  // Insert a row with the new columns (Supabase won't auto-create, so we need SQL)
  
  // Try using the Supabase SQL API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
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
  ];

  for (const sql of sqlStatements) {
    try {
      // Use the Supabase SQL execution API
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "apikey": serviceKey!,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql_query: sql }),
      });
      
      if (res.ok) {
        results.push(`OK: ${sql.substring(0, 60)}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        results.push(`SQL_NEEDED: ${sql.substring(0, 60)} (${errData.message || res.statusText})`);
      }
    } catch (e: any) {
      results.push(`ERROR: ${sql.substring(0, 60)} (${e.message})`);
    }
  }

  return NextResponse.json({ 
    results,
    message: "If SQL_NEEDED entries appear, run the migration SQL manually in Supabase Dashboard > SQL Editor",
    sqlToRun: sqlStatements.join(";\n"),
  });
}
