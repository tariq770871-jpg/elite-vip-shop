const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://nssmnftpcnkrcbtzjpuf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cA-v6NV8vwpaNefAgXmUNA_cQ-iIJuG';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Tables we expect to exist after schema creation
const EXPECTED_TABLES = [
  'roles', 'users', 'categories', 'products', 'apps', 
  'ai_tools', 'academy_courses', 'earning_methods',
  'carts', 'cart_items', 'orders', 'order_items',
  'notifications', 'reviews', 'site_settings'
];

// Expected row counts for seed data
const EXPECTED_COUNTS = {
  roles: 4,
  categories: 7,
  products: 12,
  apps: 6,
  ai_tools: 6,
  academy_courses: 4,
  earning_methods: 4,
  site_settings: 8
};

function log(emoji, msg) {
  console.log(`  ${emoji} ${msg}`);
}

function divider() {
  console.log('\n' + '─'.repeat(60));
}

async function verifyTables() {
  divider();
  console.log('🔍 PHASE 1: TABLE EXISTENCE VERIFICATION');
  divider();
  
  let results = {};
  for (const table of EXPECTED_TABLES) {
    try {
      const { data, error, count, status } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error && error.code === '42P01') {
        log('❌', `${table} - TABLE NOT FOUND`);
        results[table] = { exists: false };
      } else if (error) {
        log('⚠️', `${table} - ${error.code}: ${error.message.substring(0, 60)}`);
        results[table] = { exists: false, error: error.message };
      } else {
        log('✅', `${table} - EXISTS (${count ?? 0} rows)`);
        results[table] = { exists: true, count };
      }
    } catch (e) {
      log('❌', `${table} - ERROR: ${e.message.substring(0, 60)}`);
      results[table] = { exists: false, error: e.message };
    }
  }
  
  const existing = Object.values(results).filter(r => r.exists).length;
  const missing = Object.values(results).filter(r => !r.exists).length;
  
  divider();
  console.log(`📊 Phase 1 Result: ${existing} exist, ${missing} missing`);
  
  return { results, missing, existing };
}

async function verifySeedData() {
  divider();
  console.log('🔍 PHASE 2: SEED DATA VERIFICATION');
  divider();
  
  let allGood = true;
  for (const [table, expected] of Object.entries(EXPECTED_COUNTS)) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        log('❌', `${table} - QUERY ERROR`);
        allGood = false;
      } else if (count >= expected) {
        log('✅', `${table} - ${count}/${expected} rows (OK)`);
      } else if (count > 0) {
        log('⚠️', `${table} - ${count}/${expected} rows (PARTIAL)`);
        allGood = false;
      } else {
        log('❌', `${table} - 0/${expected} rows (EMPTY)`);
        allGood = false;
      }
    } catch (e) {
      log('❌', `${table} - ${e.message.substring(0, 60)}`);
      allGood = false;
    }
  }
  
  divider();
  console.log(`📊 Phase 2 Result: ${allGood ? 'ALL SEED DATA OK' : 'SOME DATA MISSING'}`);
  
  return allGood;
}

async function verifyProductCategories() {
  divider();
  console.log('🔍 PHASE 3: DATA INTEGRITY CHECK');
  divider();
  
  // Check products have categories
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('product_id, name, category_id, categories(name)')
    .not('category_id', 'is', null)
    .limit(5);
  
  if (pErr) {
    log('⚠️', `Products-Categories join: ${pErr.message.substring(0, 60)}`);
  } else {
    log('✅', `Products-Categories join: ${products?.length ?? 0} products with categories`);
    if (products && products.length > 0) {
      log('  📋', `Sample: ${products[0].name} → ${products[0].categories?.name}`);
    }
  }
  
  // Check users have roles
  const { data: users, error: uErr } = await supabase
    .from('users')
    .select('user_id, name, roles(role_name)');
  
  if (uErr) {
    log('⚠️', `Users-Roles join: ${uErr.message.substring(0, 60)}`);
  } else {
    log('✅', `Users-Roles join: ${users?.length ?? 0} users with roles`);
    if (users && users.length > 0) {
      log('  📋', `Sample: ${users[0].name} → ${users[0].roles?.role_name}`);
    }
  }
  
  // Test full-text search on products (if gin index was created)
  const { data: searchResult, error: sErr } = await supabase
    .from('products')
    .select('name, price')
    .ilike('name', '%بلوتوث%')
    .limit(3);
  
  if (sErr) {
    log('⚠️', `Product search: ${sErr.message.substring(0, 60)}`);
  } else {
    log('✅', `Product search ('بلوتوث'): ${searchResult?.length ?? 0} results`);
    searchResult?.forEach(r => log('  📋', `  → ${r.name} - ${r.price} ر.ي`));
  }
  
  divider();
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('═'.repeat(60));
  console.log('  ELITE VIP SHOP - DATABASE VERIFICATION PROTOCOL');
  console.log('  Precision Technical Verification');
  console.log('═'.repeat(60));
  
  const { missing } = await verifyTables();
  const seedOk = await verifySeedData();
  await verifyProductCategories();
  
  divider();
  console.log('═'.repeat(60));
  if (missing === 0 && seedOk) {
    console.log('  ✅ ALL CHECKS PASSED - DATABASE READY');
  } else if (missing > 0) {
    console.log(`  ❌ ${missing} TABLE(S) MISSING`);
    console.log('  → Run the SQL schema in Supabase Dashboard > SQL Editor');
    console.log('  → File: scripts/supabase-schema.sql');
  } else {
    console.log('  ⚠️  TABLES EXIST BUT SEED DATA INCOMPLETE');
    console.log('  → Run the seed SQL in Supabase Dashboard > SQL Editor');
    console.log('  → File: scripts/seed-data.sql');
  }
  console.log('═'.repeat(60));
}

main().catch(console.error);
