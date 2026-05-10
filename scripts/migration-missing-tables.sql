-- ============================================================
-- MIGRATION: Create missing tables (contact_messages, coupons)
-- Run this against your Supabase project SQL Editor
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. TABLE: contact_messages (رسائل التواصل)
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

-- ══════════════════════════════════════════════════════════════
-- 2. TABLE: coupons (أكواد الخصم)
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

-- ══════════════════════════════════════════════════════════════
-- 3. RLS: contact_messages
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert contact messages (public contact form)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'contact_messages_insert_public'
  ) THEN
    CREATE POLICY "contact_messages_insert_public" ON public.contact_messages
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Only admins can read contact messages (contains PII)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'contact_messages_admin_read'
  ) THEN
    CREATE POLICY "contact_messages_admin_read" ON public.contact_messages
      FOR SELECT USING (public.is_admin());
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- 4. RLS: coupons
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write coupons (sensitive business data)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'coupons_admin_all'
  ) THEN
    CREATE POLICY "coupons_admin_all" ON public.coupons
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- 5. SEED: Sample coupon for testing
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.coupons (code, discount_value, min_order_amount, max_uses, is_active, valid_from, valid_until)
VALUES
  ('WELCOME10', 10.00, 1000, 100, true, NOW(), NOW() + INTERVAL '6 months'),
  ('VIP20', 20.00, 5000, 50, true, NOW(), NOW() + INTERVAL '3 months')
ON CONFLICT (code) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 6. GRANT access to anon and authenticated roles
-- ══════════════════════════════════════════════════════════════
GRANT ALL ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.coupons TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
