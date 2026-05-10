-- Migration: Add chat-based ordering columns to orders table
-- Run this in Supabase Dashboard > SQL Editor
-- Date: 2026-05-10

-- Delivery & customer info
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS street VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS landmark VARCHAR(255);

-- Seller & product snapshot
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2);

-- Add updated_at column if missing
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on seller_id for faster seller dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- RLS Policies for orders table
-- (Only apply if RLS is enabled)

-- Users can view their own orders
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view own orders'
  ) THEN
    CREATE POLICY "Users can view own orders" ON orders
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Sellers can view orders for their products
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Sellers can view their orders'
  ) THEN
    CREATE POLICY "Sellers can view their orders" ON orders
      FOR SELECT USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Users can insert their own orders
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can insert own orders'
  ) THEN
    CREATE POLICY "Users can insert own orders" ON orders
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Admin can do everything (via service role key, bypasses RLS)
