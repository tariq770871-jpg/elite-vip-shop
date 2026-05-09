-- ============================================================
-- FULL MIGRATION: All missing tables and columns
-- Project: ELITE VIP SHOP (nssmnftpcnkrcbtzjpuf)
-- Generated: Auto-detection of missing database objects
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 0. Ensure uuid extension is available
-- ══════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════════
-- 1. ALTER: Add chat-based ordering columns to orders table
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
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ══════════════════════════════════════════════════════════════
-- 2. TABLE: profiles (ملفات المستخدمين)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(30),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_read_own') THEN
    CREATE POLICY "profiles_read_own" ON public.profiles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON public.profiles
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
    CREATE POLICY "profiles_insert_own" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_admin_all') THEN
    CREATE POLICY "profiles_admin_all" ON public.profiles
      FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
  END IF;
END $$;

GRANT ALL ON public.profiles TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- 3. TABLE: wishlists (المفضلات)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.wishlists (
  wishlist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON public.wishlists(product_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishlists' AND policyname = 'wishlists_read_own') THEN
    CREATE POLICY "wishlists_read_own" ON public.wishlists
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishlists' AND policyname = 'wishlists_insert_own') THEN
    CREATE POLICY "wishlists_insert_own" ON public.wishlists
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishlists' AND policyname = 'wishlists_delete_own') THEN
    CREATE POLICY "wishlists_delete_own" ON public.wishlists
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT ALL ON public.wishlists TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- 4. TABLE: addresses (العناوين)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.addresses (
  address_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label VARCHAR(100) DEFAULT 'المنزل',
  recipient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  street VARCHAR(255),
  landmark VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'addresses_read_own') THEN
    CREATE POLICY "addresses_read_own" ON public.addresses
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'addresses_insert_own') THEN
    CREATE POLICY "addresses_insert_own" ON public.addresses
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'addresses_update_own') THEN
    CREATE POLICY "addresses_update_own" ON public.addresses
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'addresses_delete_own') THEN
    CREATE POLICY "addresses_delete_own" ON public.addresses
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT ALL ON public.addresses TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- 5. TABLE: shipping_rates (أسعار الشحن)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  rate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  delivery_type VARCHAR(20) DEFAULT 'delivery',
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  estimated_days INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_province ON public.shipping_rates(province);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shipping_rates' AND policyname = 'shipping_rates_read_all') THEN
    CREATE POLICY "shipping_rates_read_all" ON public.shipping_rates
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shipping_rates' AND policyname = 'shipping_rates_admin_all') THEN
    CREATE POLICY "shipping_rates_admin_all" ON public.shipping_rates
      FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
  END IF;
END $$;

GRANT ALL ON public.shipping_rates TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- 6. TABLE: payments (المدفوعات)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payments (
  payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(10) DEFAULT 'YER',
  payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
  payment_status VARCHAR(30) DEFAULT 'pending',
  transaction_ref VARCHAR(255),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'payments_read_own') THEN
    CREATE POLICY "payments_read_own" ON public.payments
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'payments_admin_all') THEN
    CREATE POLICY "payments_admin_all" ON public.payments
      FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
  END IF;
END $$;

GRANT ALL ON public.payments TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- 7. TABLE: refunds (الاستردادات)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.refunds (
  refund_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  reason TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON public.refunds(order_id);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'refunds' AND policyname = 'refunds_read_own') THEN
    CREATE POLICY "refunds_read_own" ON public.refunds
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'refunds' AND policyname = 'refunds_admin_all') THEN
    CREATE POLICY "refunds_admin_all" ON public.refunds
      FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
  END IF;
END $$;

GRANT ALL ON public.refunds TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- 8. TABLE: analytics (التحليلات)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.analytics (
  analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_entity ON public.analytics(entity_type, entity_id);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics' AND policyname = 'analytics_insert_authenticated') THEN
    CREATE POLICY "analytics_insert_authenticated" ON public.analytics
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics' AND policyname = 'analytics_admin_read') THEN
    CREATE POLICY "analytics_admin_read" ON public.analytics
      FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
  END IF;
END $$;

GRANT ALL ON public.analytics TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- 9. SEED: Admin profile for tariq770871@gmail.com
-- ══════════════════════════════════════════════════════════════
-- Note: user_id must match the actual auth.users.id for this email
-- This will be set correctly when the admin user logs in for the first time
-- or can be set manually via: UPDATE profiles SET is_admin = true WHERE user_id = '<actual-uuid>';

-- ══════════════════════════════════════════════════════════════
-- 10. FUNCTION: Helper to check admin status (used in RLS)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.uid();
$$;

-- ══════════════════════════════════════════════════════════════
-- 11. TRIGGER: Auto-create profile on user signup
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    FALSE
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════
-- 12. GRANT access to sequences
-- ══════════════════════════════════════════════════════════════
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
