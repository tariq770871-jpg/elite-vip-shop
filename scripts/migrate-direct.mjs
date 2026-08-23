import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY مطلوبان.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('🔍 Checking orders table columns...\n');

// Test if extended columns exist
const { error: orderError } = await supabase
  .from('orders')
  .select('order_id, delivery_type, customer_name, customer_phone, province, district, street, landmark, seller_id, product_id, product_name_snapshot, unit_price, quantity, total_price')
  .limit(1);

if (orderError) {
  console.log('❌ أعمدة إضافية مفقودة في جدول orders:');
  console.log(`   ${orderError.message}\n`);
  console.log('⚠️ لا يمكن إضافة أعمدة عبر REST API (يحتاج DDL).');
  console.log('📝 SQL المطلوب:');
  console.log('━'.repeat(60));
  const alterSQL = `
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
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);`;
  console.log(alterSQL.trim());
  console.log('━'.repeat(60));
} else {
  console.log('✅ جميع أعمدة orders موجودة!');
}

// Verify contact_messages
const { error: contactError } = await supabase
  .from('contact_messages')
  .select('message_id')
  .limit(1);
console.log(`\n${!contactError ? '✅' : '❌'} contact_messages: ${!contactError ? 'موجود' : contactError.message}`);

// Verify coupons
const { error: couponsError } = await supabase
  .from('coupons')
  .select('coupon_id')
  .limit(1);
console.log(`${!couponsError ? '✅' : '❌'} coupons: ${!couponsError ? 'موجود' : couponsError.message}`);

// Verify order_items
const { error: itemsError } = await supabase
  .from('order_items')
  .select('order_item_id')
  .limit(1);
console.log(`${!itemsError ? '✅' : '❌'} order_items: ${!itemsError ? 'موجود' : itemsError.message}`);

console.log('\n📋 ملخص: الجداول الأساسية موجودة ✅');
if (orderError) {
  console.log('⚠️ الأعمدة الإضافية في orders تحتاج ALTER TABLE (DDL)');
  console.log('   الكود الحالي يعمل مع fallback عند غياب الأعمدة');
}
