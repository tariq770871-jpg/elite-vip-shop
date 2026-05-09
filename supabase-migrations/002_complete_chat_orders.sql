-- =============================================================
-- Migration 002: Complete Chat-Based Order System
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. Add product snapshot columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price DECIMAL(12, 2);

-- 2. Ensure delivery columns exist (from migration 001)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS street VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS landmark VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID;

-- 3. Update status constraint to include 'pending' and 'processing'
-- First drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_order_status;
-- Add the new constraint with updated status values
ALTER TABLE orders ADD CONSTRAINT chk_order_status
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- 4. Update default status from 'new' to 'pending'
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';

-- 5. Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_type ON orders(delivery_type);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- 6. Add RLS policy for sellers to read their own orders
-- (Sellers can see orders where seller_id = their user_id)
CREATE POLICY "orders_seller_read" ON public.orders
  FOR SELECT USING (
    seller_id = public.current_user_id()
  );

-- 7. Add foreign key for seller_id
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_order_seller;
ALTER TABLE orders ADD CONSTRAINT fk_order_seller
  FOREIGN KEY (seller_id) REFERENCES public.users(user_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. Add foreign key for product_id
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_order_product;
ALTER TABLE orders ADD CONSTRAINT fk_order_product
  FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 9. Verify the migration
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
