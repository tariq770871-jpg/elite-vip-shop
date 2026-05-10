/**
 * Run Database Migration Script
 * 
 * Creates missing tables: contact_messages, coupons
 * Adds missing columns to orders table
 * 
 * Usage: node scripts/run-migration.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nssmnftpcnkrcbtzjpuf.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REDACTED_SUPABASE_SECRET';

// We'll use the Supabase REST API with service role key for DDL operations
// since the service role key bypasses RLS

async function runMigration() {
  console.log('🔍 Checking database state...\n');

  // Check current state by trying to query each table
  const checks = [
    { table: 'contact_messages', query: 'select=message_id,name' },
    { table: 'coupons', query: 'select=coupon_id,code' },
    { table: 'orders', query: 'select=order_id,delivery_type,customer_name' },
    { table: 'order_items', query: 'select=order_item_id,product_name' },
  ];

  const results = {};

  for (const check of checks) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${check.table}?${check.query}&limit=1`,
        {
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.ok) {
        results[check.table] = 'EXISTS';
        console.log(`  ✅ ${check.table}: موجود`);
      } else if (res.status === 404) {
        results[check.table] = 'MISSING';
        console.log(`  ❌ ${check.table}: غير موجود (404)`);
      } else {
        const data = await res.json();
        // Check if it's a "relation does not exist" error
        const msg = data?.message || data?.code || JSON.stringify(data);
        if (msg.includes('does not exist') || msg.includes('42P01') || msg.includes('not found')) {
          results[check.table] = 'MISSING';
          console.log(`  ❌ ${check.table}: غير موجود — ${msg.substring(0, 80)}`);
        } else {
          results[check.table] = 'ERROR';
          console.log(`  ⚠️ ${check.table}: خطأ — ${msg.substring(0, 80)}`);
        }
      }
    } catch (err) {
      results[check.table] = 'ERROR';
      console.log(`  ⚠️ ${check.table}: خطأ في الاتصال — ${err.message}`);
    }
  }

  console.log('\n📋 ملخص:');
  const missing = Object.entries(results).filter(([_, v]) => v === 'MISSING' || v === 'ERROR');
  if (missing.length === 0) {
    console.log('  ✅ جميع الجداول موجودة! لا حاجة لـ migration.');
    return;
  }

  console.log(`  ❌ ${missing.length} جدول/عمود يحتاج migration:`);
  missing.forEach(([table]) => console.log(`     - ${table}`));

  // Try to create tables using Supabase SQL endpoint
  console.log('\n🚀 محاولة إنشاء الجداول عبر Supabase REST API...');

  // The REST API doesn't support DDL directly, so we need to use the SQL endpoint
  // Let's try using the Supabase Management API or RPC

  // Approach: Use supabase-js admin client to run raw SQL via rpc
  // But Supabase doesn't allow raw SQL via REST API by default.
  // We need to use the PostgreSQL connection string.
  
  console.log('\n⚠️ REST API لا يدعم DDL مباشرة.');
  console.log('📝 سيتم إنشاء ملف SQL يمكنك تنفيذه في Supabase Dashboard.\n');

  // Generate the SQL
  const migrationSQL = generateMigrationSQL(missing.map(([t]) => t));
  console.log('━'.repeat(60));
  console.log(migrationSQL);
  console.log('━'.repeat(60));

  // Try direct pg connection if available
  try {
    const { Client } = await import('pg');
    console.log('\n🔌 وجدت مكتبة pg، محاولة الاتصال المباشر...');

    const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    
    const configs = [
      {
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        user: `postgres.${projectRef}`,
        password: SERVICE_KEY,
      },
      {
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: `postgres.${projectRef}`,
        password: SERVICE_KEY,
      },
      {
        host: 'db.nssmnftpcnkrcbtzjpuf.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: SERVICE_KEY,
      },
    ];

    for (const config of configs) {
      const client = new Client({
        ...config,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      });

      try {
        await client.connect();
        console.log(`  ✅ متصل بـ ${config.host}:${config.port}`);

        // Run each statement separately
        const statements = migrationSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        let success = 0;
        let failures = 0;

        for (const stmt of statements) {
          try {
            await client.query(stmt + ';');
            success++;
            console.log(`  ✅ ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
          } catch (e) {
            failures++;
            const msg = e.message?.substring(0, 80) || 'Unknown error';
            console.log(`  ❌ ${stmt.substring(0, 40).replace(/\n/g, ' ')}... — ${msg}`);
          }
        }

        await client.end();
        console.log(`\n📊 النتائج: ${success} نجح، ${failures} فشل`);
        
        if (success > 0) {
          console.log('\n✅ تم تنفيذ الـ migration بنجاح!');
          
          // Verify
          console.log('\n🔍 التحقق من الجداول...');
          for (const check of checks) {
            try {
              const res = await fetch(
                `${SUPABASE_URL}/rest/v1/${check.table}?${check.query}&limit=1`,
                {
                  headers: {
                    apikey: SERVICE_KEY,
                    Authorization: `Bearer ${SERVICE_KEY}`,
                  },
                }
              );
              console.log(`  ${res.ok ? '✅' : '❌'} ${check.table}: ${res.ok ? 'موجود' : 'غير موجود'}`);
            } catch {
              console.log(`  ⚠️ ${check.table}: تعذر التحقق`);
            }
          }
        }
        
        return;
      } catch (err) {
        try { await client.end(); } catch {}
        console.log(`  ⚠️ فشل الاتصال بـ ${config.host}:${config.port} — ${err.message?.substring(0, 60)}`);
      }
    }
  } catch (err) {
    console.log('  ⚠️ مكتبة pg غير متاحة');
  }

  console.log('\n📌 يرجى تنفيذ SQL أعلاه يدوياً في Supabase Dashboard → SQL Editor');
}

function generateMigrationSQL(missingTables) {
  const parts = [];

  if (missingTables.includes('contact_messages')) {
    parts.push(`
-- ══════════════════════════════════════════════════════════════
-- TABLE: contact_messages (رسائل التواصل)
-- ══════════════════════════════════════════════════════════════
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

CREATE POLICY "contact_messages_insert_public" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_admin_read" ON public.contact_messages
  FOR SELECT USING (public.is_admin());

GRANT ALL ON public.contact_messages TO anon, authenticated`);
  }

  if (missingTables.includes('coupons')) {
    parts.push(`
-- ══════════════════════════════════════════════════════════════
-- TABLE: coupons (أكواد الخصم)
-- ══════════════════════════════════════════════════════════════
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

CREATE POLICY "coupons_admin_all" ON public.coupons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT ALL ON public.coupons TO anon, authenticated;

INSERT INTO public.coupons (code, discount_value, min_order_amount, max_uses, is_active, valid_from, valid_until)
VALUES
  ('WELCOME10', 10.00, 1000, 100, true, NOW(), NOW() + INTERVAL '6 months'),
  ('VIP20', 20.00, 5000, 50, true, NOW(), NOW() + INTERVAL '3 months')
ON CONFLICT (code) DO NOTHING`);
  }

  if (missingTables.includes('orders')) {
    parts.push(`
-- ══════════════════════════════════════════════════════════════
-- MIGRATION: Add chat-based ordering columns to orders
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS street VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS landmark VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(500);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status)`);
  }

  if (missingTables.includes('order_items')) {
    parts.push(`
-- ══════════════════════════════════════════════════════════════
-- TABLE: order_items (بنود الطلب)
-- ══════════════════════════════════════════════════════════════
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

CREATE POLICY "order_items_read_own" ON public.order_items
  FOR SELECT USING (order_id IN (SELECT order_id FROM public.orders WHERE user_id = public.current_user_id()));

CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (order_id IN (SELECT order_id FROM public.orders WHERE user_id = public.current_user_id()));

CREATE POLICY "order_items_admin_read" ON public.order_items
  FOR SELECT USING (public.is_admin());

GRANT ALL ON public.order_items TO anon, authenticated`);
  }

  return parts.join('\n\n');
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
