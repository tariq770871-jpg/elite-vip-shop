/**
 * Full Database Migration Script
 * 
 * Creates ALL missing tables, columns, policies, and functions.
 * Uses direct PostgreSQL connection via pg driver.
 * 
 * Usage:
 *   1. Add SUPABASE_DB_PASSWORD to .env file
 *   2. Run: node scripts/run-full-migration.js
 */

const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Force IPv4 for DNS resolution
dns.setDefaultResultOrder('ipv4first');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nssmnftpcnkrcbtzjpuf.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REDACTED_SUPABASE_SECRET';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '';
const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(icon, color, msg) {
  console.log(`  ${color}${icon}${RESET} ${msg}`);
}

async function checkTableState() {
  const { createClient } = require('@supabase/supabase-js');
  const client = createClient(SUPABASE_URL, SERVICE_KEY);

  const tables = [
    'products', 'orders', 'order_items', 'coupons', 'contact_messages',
    'profiles', 'categories', 'reviews', 'wishlists', 'notifications',
    'addresses', 'shipping_rates', 'payments', 'refunds', 'analytics'
  ];

  const state = {};
  console.log(`\n${CYAN}${BOLD}═══ فحص حالة قاعدة البيانات ═══${RESET}\n`);

  for (const table of tables) {
    const { data, error } = await client.from(table).select('*').limit(1);
    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('not found in the schema')) {
        state[table] = 'MISSING';
        log('❌', RED, `${table}: غير موجود`);
      } else {
        state[table] = 'COLUMNS_MISSING';
        log('⚠️ ', YELLOW, `${table}: موجود لكن ينقصه أعمدة — ${error.message.substring(0, 50)}`);
      }
    } else {
      state[table] = 'OK';
      log('✅', GREEN, `${table}: موجود (${data.length} صف)`);
    }
  }

  // Check orders columns specifically
  const { error: ordersError } = await client
    .from('orders')
    .select('order_id, delivery_type, customer_name, customer_phone, province')
    .limit(1);
  
  if (ordersError && state['orders'] !== 'MISSING') {
    state['orders'] = 'COLUMNS_MISSING';
    log('⚠️ ', YELLOW, 'orders: ينقصه أعمدة الطلب بالدردشة');
  }

  return state;
}

async function runMigrationWithPg() {
  if (!DB_PASSWORD) {
    console.log(`\n${RED}${BOLD}❌ كلمة مرور قاعدة البيانات غير موجودة!${RESET}`);
    console.log(`\n${YELLOW}أضف SUPABASE_DB_PASSWORD إلى ملف .env:${RESET}`);
    console.log(`  ${CYAN}SUPABASE_DB_PASSWORD=your_password_here${RESET}`);
    console.log(`\n${YELLOW}للحصول على كلمة المرور:${RESET}`);
    console.log(`  1. افتح Supabase Dashboard`);
    console.log(`  2. اذهب إلى Settings → Database`);
    console.log(`  3. انسخ كلمة المرور أو أعد تعيينها`);
    return false;
  }

  const { Client } = require('pg');

  // Read the full migration SQL
  const sqlPath = path.join(__dirname, 'migration-full.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  const connectionConfigs = [
    {
      name: 'Pooler Transaction (6543)',
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: `postgres.${PROJECT_REF}`,
      password: DB_PASSWORD,
    },
    {
      name: 'Pooler Session (5432)',
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: `postgres.${PROJECT_REF}`,
      password: DB_PASSWORD,
    },
  ];

  for (const config of connectionConfigs) {
    const client = new Client({
      ...config,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      query_timeout: 30000,
    });

    try {
      console.log(`\n${CYAN}🔌 محاولة الاتصال: ${config.name}...${RESET}`);
      await client.connect();
      console.log(`${GREEN}✅ متصل بنجاح!${RESET}`);

      console.log(`\n${CYAN}${BOLD}═══ تنفيذ المهاجرة ═══${RESET}\n`);

      let success = 0;
      let skipped = 0;
      let failed = 0;

      for (const stmt of statements) {
        // Skip comment-only lines
        const cleanStmt = stmt.replace(/--.*$/gm, '').trim();
        if (!cleanStmt) { skipped++; continue; }

        try {
          await client.query(stmt + ';');
          success++;
          const preview = cleanStmt.substring(0, 70).replace(/\n/g, ' ');
          log('✅', GREEN, preview + (cleanStmt.length > 70 ? '...' : ''));
        } catch (e) {
          const msg = e.message || 'Unknown error';
          // Check if it's a harmless "already exists" error
          if (msg.includes('already exists') || msg.includes('already has')) {
            skipped++;
            const preview = cleanStmt.substring(0, 50).replace(/\n/g, ' ');
            log('⏭️ ', YELLOW, `${preview}... (موجود مسبقاً)`);
          } else {
            failed++;
            const preview = cleanStmt.substring(0, 40).replace(/\n/g, ' ');
            log('❌', RED, `${preview}... — ${msg.substring(0, 60)}`);
          }
        }
      }

      await client.end();

      console.log(`\n${BOLD}═══ النتائج ═══${RESET}`);
      console.log(`  ${GREEN}نجح: ${success}${RESET}`);
      console.log(`  ${YELLOW}تم تخطيه (موجود مسبقاً): ${skipped}${RESET}`);
      console.log(`  ${RED}فشل: ${failed}${RESET}`);

      return success > 0 || skipped > 0;
    } catch (err) {
      try { await client.end(); } catch {}
      const msg = err.message?.substring(0, 100) || 'Unknown error';
      log('❌', RED, `فشل الاتصال: ${msg}`);
    }
  }

  console.log(`\n${RED}${BOLD}❌ فشل الاتصال بجميع الخوادم${RESET}`);
  return false;
}

async function verifyMigration() {
  const { createClient } = require('@supabase/supabase-js');
  const client = createClient(SUPABASE_URL, SERVICE_KEY);

  const tables = [
    'products', 'orders', 'order_items', 'coupons', 'contact_messages',
    'profiles', 'categories', 'reviews', 'wishlists', 'notifications',
    'addresses', 'shipping_rates', 'payments', 'refunds', 'analytics'
  ];

  console.log(`\n${CYAN}${BOLD}═══ التحقق من النتيجة ═══${RESET}\n`);

  let allOk = true;
  for (const table of tables) {
    const { data, error } = await client.from(table).select('*').limit(1);
    if (error) {
      log('❌', RED, `${table}: ${error.message.substring(0, 50)}`);
      allOk = false;
    } else {
      log('✅', GREEN, `${table}: موجود`);
    }
  }

  // Check orders columns
  const { error: ordersError } = await client
    .from('orders')
    .select('order_id, delivery_type, customer_name, customer_phone, province, district, street')
    .limit(1);
  
  if (ordersError) {
    log('⚠️ ', YELLOW, `orders: أعمدة مفقودة — ${ordersError.message.substring(0, 50)}`);
    allOk = false;
  } else {
    log('✅', GREEN, 'orders: جميع الأعمدة موجودة');
  }

  return allOk;
}

async function main() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════╗`);
  console.log(`║   ELITE VIP SHOP — Full Database Migration   ║`);
  console.log(`╚══════════════════════════════════════════════╝${RESET}`);

  // Step 1: Check current state
  const state = await checkTableState();
  const missingCount = Object.values(state).filter(v => v === 'MISSING' || v === 'COLUMNS_MISSING').length;

  if (missingCount === 0) {
    console.log(`\n${GREEN}${BOLD}✅ جميع الجداول والأعمدة موجودة! لا حاجة للمهاجرة.${RESET}`);
    return;
  }

  console.log(`\n${YELLOW}${BOLD}⚠️  ${missingCount} عنصر يحتاج مهاجرة${RESET}`);

  // Step 2: Run migration
  const migrated = await runMigrationWithPg();

  if (!migrated) {
    console.log(`\n${YELLOW}${BOLD}📌 تعذر التنفيذ التلقائي.${RESET}`);
    console.log(`${YELLOW}يرجى نسخ محتوى scripts/migration-full.sql`);
    console.log(`ولصقه في Supabase Dashboard → SQL Editor → Run${RESET}`);
    return;
  }

  // Step 3: Verify
  const allOk = await verifyMigration();

  if (allOk) {
    console.log(`\n${GREEN}${BOLD}═══════════════════════════════════════════${RESET}`);
    console.log(`${GREEN}${BOLD}  ✅ تمت المهاجرة بنجاح! قاعدة البيانات جاهزة.${RESET}`);
    console.log(`${GREEN}${BOLD}═══════════════════════════════════════════${RESET}`);
  } else {
    console.log(`\n${YELLOW}${BOLD}⚠️  بعض العناصر لم تُنشأ. تحقق من الأخطاء أعلاه.${RESET}`);
  }
}

main().catch(err => {
  console.error(`${RED}Fatal error:${RESET}`, err);
  process.exit(1);
});
