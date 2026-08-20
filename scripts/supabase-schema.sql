-- ============================================================
-- ELITE VIP SHOP - SUPABASE DATABASE SCHEMA
-- Comprehensive SQL with constraints, indexes, RLS, and seed data
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLE: roles (الأدوار)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.roles (
  role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: only valid role names
  CONSTRAINT chk_role_name CHECK (role_name IN ('visitor', 'user', 'seller', 'admin'))
);

-- Index for fast role lookup
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(role_name);

-- ============================================================
-- 2. TABLE: users (المستخدمون)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash TEXT,
  avatar TEXT,
  role_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_user_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT chk_user_phone CHECK (phone IS NULL OR phone ~* '^[+]?[0-9]{7,15}$'),
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created ON public.users(created_at DESC);

-- ============================================================
-- 3. TABLE: categories (التصنيفات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_category_slug CHECK (slug ~* '^[a-z0-9-]+$')
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- ============================================================
-- 4. TABLE: products (المنتجات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  sale_price DECIMAL(12, 2) CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price < price)),
  category_id UUID,
  images TEXT[] DEFAULT '{}',
  availability BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES public.users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(availability);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('arabic', name || ' ' || COALESCE(description, '')));

-- ============================================================
-- 5. TABLE: apps (التطبيقات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.apps (
  app_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  icon VARCHAR(255),
  link TEXT,
  platform VARCHAR(50) DEFAULT 'all',
  is_free BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_app_platform CHECK (platform IN ('all', 'android', 'ios', 'web', 'windows', 'mac'))
);

CREATE INDEX IF NOT EXISTS idx_apps_active ON public.apps(is_active);
CREATE INDEX IF NOT EXISTS idx_apps_platform ON public.apps(platform);

-- ============================================================
-- 6. TABLE: ai_tools (أدوات الذكاء الاصطناعي)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_tools (
  tool_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  icon VARCHAR(255),
  link TEXT,
  category VARCHAR(100) DEFAULT 'general',
  is_free BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tools_active ON public.ai_tools(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON public.ai_tools(category);

-- ============================================================
-- 7. TABLE: academy_courses (دورات الأكاديمية)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.academy_courses (
  course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  icon VARCHAR(255),
  level VARCHAR(50) DEFAULT 'beginner',
  duration_hours INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_course_level CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all'))
);

CREATE INDEX IF NOT EXISTS idx_courses_active ON public.academy_courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.academy_courses(level);

-- ============================================================
-- 8. TABLE: earning_methods (طرق الربح من الإنترنت)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.earning_methods (
  method_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  icon VARCHAR(255),
  difficulty VARCHAR(50) DEFAULT 'easy',
  estimated_income TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_earning_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert'))
);

CREATE INDEX IF NOT EXISTS idx_earning_active ON public.earning_methods(is_active);

-- ============================================================
-- 9. TABLE: carts (السلات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carts (
  cart_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uc_cart_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);

-- ============================================================
-- 10. TABLE: cart_items (عناصر السلة)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  cart_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_cartitem_cart FOREIGN KEY (cart_id) REFERENCES public.carts(cart_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uc_cart_product UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cartitems_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cartitems_product ON public.cart_items(product_id);

-- ============================================================
-- 11. TABLE: orders (الطلبات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  seller_id UUID,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  total_amount DECIMAL(12, 2) DEFAULT 0 CHECK (total_amount >= 0),
  notes TEXT,
  -- Delivery & customer info columns
  delivery_type VARCHAR(20) DEFAULT 'pickup',
  customer_name VARCHAR(100),
  customer_phone VARCHAR(30),
  customer_address TEXT,
  province VARCHAR(100),
  district VARCHAR(100),
  street VARCHAR(255),
  landmark VARCHAR(255),
  -- Product snapshot columns
  product_id UUID,
  product_name_snapshot VARCHAR(255),
  unit_price DECIMAL(12, 2),
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_order_status CHECK (status IN ('new', 'pending', 'reviewing', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  CONSTRAINT chk_delivery_type CHECK (delivery_type IN ('delivery', 'pickup')),
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ============================================================
-- 12. TABLE: order_items (بنود الطلب)
-- ============================================================
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

-- ============================================================
-- 13. TABLE: notifications (الإشعارات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_notif_type CHECK (type IN ('info', 'order', 'promo', 'system', 'alert')),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================
-- 14. TABLE: reviews (التقييمات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uc_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved);
-- ── Composite index for the most frequent query: approved reviews by product ──
-- The reviews GET endpoint always queries WHERE product_id = ? AND is_approved = true
-- A composite index covers both conditions in a single index scan.
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON public.reviews(product_id, is_approved);
-- ── Index for duplicate review check (user + product) ──
-- The reviews POST endpoint checks for existing reviews by this user for this product
CREATE INDEX IF NOT EXISTS idx_reviews_user_product ON public.reviews(user_id, product_id);
-- ── Index for orders seller_id lookups ──
-- Seller dashboard queries WHERE seller_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
-- ── Index for order_items product_id lookups (used by reviews purchase check) ──
CREATE INDEX IF NOT EXISTS idx_orderitems_product ON public.order_items(product_id);

-- ============================================================
-- 14b. TABLE: profiles (ملفات المستخدمين — مكمّل لـ Supabase Auth)
-- ============================================================
-- Mirrors auth.users.id as user_id (kept in sync by trg_sync_public_user).
-- The is_admin column is the authoritative source for admin role checks
-- (used by is_admin() SQL function and verifyAdmin TS function).
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(30),
  is_admin BOOLEAN DEFAULT FALSE,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: keep profiles.updated_at fresh
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Index for profiles user_id lookups (used by auth role check) ──
-- Note: PK already indexes user_id, but kept for explicit documentation
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- ── RLS for profiles ──
-- Users can read their own profile; admins can read all
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_self_read ON public.profiles;
CREATE POLICY profiles_self_read
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND is_admin = (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()));
-- Prevent privilege escalation via self-update — is_admin can only be set by another admin
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 15. TABLE: site_settings (إعدادات الموقع)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  type VARCHAR(30) DEFAULT 'string',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.site_settings(key);

-- ============================================================
-- 16. TABLE: contact_messages (رسائل التواصل)
-- ============================================================
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

-- ============================================================
-- 17. TABLE: coupons (أكواد الخصم)
-- ============================================================
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

-- ============================================================
-- FUNCTION: increment_coupon_usage(p_code) — atomic, gated by max_uses
-- ============================================================
-- Called from src/app/api/orders/route.ts after a successful order insert.
-- SECURITY DEFINER lets any authenticated caller invoke it safely; the
-- WHERE clause guarantees only valid+active+under-limit coupons increment.
DROP FUNCTION IF EXISTS public.increment_coupon_usage(p_code VARCHAR);
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_code VARCHAR)
RETURNS TABLE(success BOOLEAN, new_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  UPDATE public.coupons
     SET used_count = used_count + 1
   WHERE code = UPPER(p_code)
     AND is_active = TRUE
     AND (max_uses IS NULL OR used_count < max_uses)
     AND (valid_from  IS NULL OR valid_from  <= NOW())
     AND (valid_until IS NULL OR valid_until >= NOW())
  RETURNING used_count INTO v_new_count;

  IF v_new_count IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER;
  ELSE
    RETURN QUERY SELECT TRUE, v_new_count;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.increment_coupon_usage(VARCHAR) FROM PUBLIC, ANON;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(VARCHAR) TO AUTHENTICATED;

-- ============================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_apps_updated BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_ai_tools_updated BEFORE UPDATE ON public.ai_tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_academy_updated BEFORE UPDATE ON public.academy_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_earning_updated BEFORE UPDATE ON public.earning_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_carts_updated BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Security Hardening
-- ============================================================
-- Enable RLS on ALL tables and define fine-grained access policies.
-- This ensures that even if the anon key is compromised, data access
-- is restricted at the database level.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- Helper function: Check if the current user is an admin
--
-- Resolution order (must match verifyAdmin in src/lib/admin-auth.ts):
--   1. profiles.is_admin = true  (new schema — preferred)
--   2. legacy users/roles join  (role_name = 'admin' OR 'owner')
--
-- Both paths checked with OR — keeps behavior consistent with the TS layer.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_auth_uid UUID := auth.uid();
  v_legacy_role VARCHAR(50);
BEGIN
  IF v_auth_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Path 1: profiles.is_admin (new schema)
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = v_auth_uid AND is_admin = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  -- Path 2: legacy users/roles join (admin OR owner)
  SELECT r.role_name INTO v_legacy_role
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.role_id
  WHERE u.email = auth.jwt() ->> 'email'
  LIMIT 1;

  RETURN v_legacy_role IN ('admin', 'owner');
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Get the user_id for the currently authenticated user
--
-- IMPORTANT: Returns auth.uid() directly — this is what the API layer stores
-- in orders.user_id, reviews.user_id, etc. The auth.users.id and public.users.user_id
-- are kept in sync by the trg_sync_public_user trigger (see below).
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ══════════════════════════════════════════════════════════════
-- 1. RLS: roles
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_public_read" ON public.roles
  FOR SELECT USING (true);

CREATE POLICY "roles_admin_write" ON public.roles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 2. RLS: users
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ⚠️ SECURITY: The previous `users_public_read FOR SELECT USING (true)`
-- policy exposed password_hash, email, and phone to anon API consumers.
-- It has been REMOVED in migration 008_rls_security_hardening.sql.
--
-- Replacement strategy:
--   1. `users_self_read` — users can read ONLY their own row
--   2. `users_admin_read` — admins can read all rows
--   3. `public.users_public_view` — a VIEW exposing only safe columns
--      (user_id, name, avatar, is_active, created_at, role_id)
--      granted to anon+authenticated for reviewer names etc.
--
-- Direct table access for anon is REVOKED.

CREATE POLICY "users_self_read" ON public.users
  FOR SELECT USING (user_id = public.current_user_id());

CREATE POLICY "users_admin_read" ON public.users
  FOR SELECT USING (public.is_admin());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

-- Only admins can insert/delete users
CREATE POLICY "users_admin_insert" ON public.users
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "users_admin_delete" ON public.users
  FOR DELETE USING (public.is_admin());

-- Safe public view (no password_hash, no email, no phone)
CREATE OR REPLACE VIEW public.users_public_view AS
  SELECT
    user_id,
    name,
    avatar_url,
    is_active,
    created_at,
    role_id
  FROM public.users
  WHERE is_active = true;

GRANT SELECT ON public.users_public_view TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- 3. RLS: categories
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories_admin_write" ON public.categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 4. RLS: products
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can read available products
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

-- Sellers can insert their own products
CREATE POLICY "products_seller_insert" ON public.products
  FOR INSERT WITH CHECK (
    public.is_admin() OR seller_id = public.current_user_id()
  );

-- Sellers can update their own products; admins can update any
CREATE POLICY "products_seller_update" ON public.products
  FOR UPDATE USING (
    public.is_admin() OR seller_id = public.current_user_id()
  )
  WITH CHECK (
    public.is_admin() OR seller_id = public.current_user_id()
  );

-- Only admins can delete products
CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 5. RLS: apps
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apps_public_read" ON public.apps
  FOR SELECT USING (true);

CREATE POLICY "apps_admin_write" ON public.apps
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 6. RLS: ai_tools
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_tools_public_read" ON public.ai_tools
  FOR SELECT USING (true);

CREATE POLICY "ai_tools_admin_write" ON public.ai_tools
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 7. RLS: academy_courses
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "academy_courses_public_read" ON public.academy_courses
  FOR SELECT USING (true);

CREATE POLICY "academy_courses_admin_write" ON public.academy_courses
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 8. RLS: earning_methods
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.earning_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "earning_methods_public_read" ON public.earning_methods
  FOR SELECT USING (true);

CREATE POLICY "earning_methods_admin_write" ON public.earning_methods
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 9. RLS: carts — Users can only access their own cart
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carts_read_own" ON public.carts
  FOR SELECT USING (user_id = public.current_user_id());

CREATE POLICY "carts_insert_own" ON public.carts
  FOR INSERT WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "carts_update_own" ON public.carts
  FOR UPDATE USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "carts_delete_own" ON public.carts
  FOR DELETE USING (user_id = public.current_user_id());

-- Admins can read all carts
CREATE POLICY "carts_admin_read" ON public.carts
  FOR SELECT USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 10. RLS: cart_items — Users can only access items in their own cart
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can read items in their own cart (via cart → user_id join)
CREATE POLICY "cart_items_read_own" ON public.cart_items
  FOR SELECT USING (
    cart_id IN (
      SELECT cart_id FROM public.carts WHERE user_id = public.current_user_id()
    )
  );

CREATE POLICY "cart_items_insert_own" ON public.cart_items
  FOR INSERT WITH CHECK (
    cart_id IN (
      SELECT cart_id FROM public.carts WHERE user_id = public.current_user_id()
    )
  );

CREATE POLICY "cart_items_update_own" ON public.cart_items
  FOR UPDATE USING (
    cart_id IN (
      SELECT cart_id FROM public.carts WHERE user_id = public.current_user_id()
    )
  );

CREATE POLICY "cart_items_delete_own" ON public.cart_items
  FOR DELETE USING (
    cart_id IN (
      SELECT cart_id FROM public.carts WHERE user_id = public.current_user_id()
    )
  );

-- Admins can read all cart items
CREATE POLICY "cart_items_admin_read" ON public.cart_items
  FOR SELECT USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 11. RLS: orders — Users can only read/write their own orders
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_read_own" ON public.orders
  FOR SELECT USING (user_id = public.current_user_id());

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (user_id = public.current_user_id());

-- Users can update only their own orders (e.g., cancel)
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

-- Admins can read and update all orders
CREATE POLICY "orders_admin_read" ON public.orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 12. RLS: order_items — Follows order ownership
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can read items from their own orders
CREATE POLICY "order_items_read_own" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT order_id FROM public.orders WHERE user_id = public.current_user_id()
    )
  );

-- Users can insert items into their own orders
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT order_id FROM public.orders WHERE user_id = public.current_user_id()
    )
  );

-- Admins can read all order items
CREATE POLICY "order_items_admin_read" ON public.order_items
  FOR SELECT USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 13. RLS: notifications — Users can only read/write their own
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_own" ON public.notifications
  FOR SELECT USING (user_id = public.current_user_id());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (user_id = public.current_user_id());

-- Admins can insert and read all notifications (for sending alerts)
CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "notifications_admin_read" ON public.notifications
  FOR SELECT USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 14. RLS: reviews
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (is_approved = true);

-- Authenticated users can insert their own reviews
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (user_id = public.current_user_id());

-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own" ON public.reviews
  FOR DELETE USING (user_id = public.current_user_id());

-- Admins can read all reviews (including unapproved) and approve them
CREATE POLICY "reviews_admin_all" ON public.reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 15. RLS: site_settings
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read ONLY non-secret settings (e.g., site_name, logo_url).
-- Secrets (telegram_bot_token, smtp_password, etc.) are admin-only.
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (type <> 'secret');

-- Only admins can read secret settings (telegram_bot_token, etc.)
CREATE POLICY "site_settings_secret_admin_read" ON public.site_settings
  FOR SELECT USING (type = 'secret' AND public.is_admin());

-- Only admins can modify settings
CREATE POLICY "site_settings_admin_write" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 16. RLS: contact_messages
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert contact messages (public contact form)
CREATE POLICY "contact_messages_insert_public" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Only admins can read contact messages (contains PII)
CREATE POLICY "contact_messages_admin_read" ON public.contact_messages
  FOR SELECT USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- 17. RLS: coupons
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write coupons (sensitive business data)
CREATE POLICY "coupons_admin_all" ON public.coupons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- SEED DATA — بيانات أولية
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- أدوار المستخدمين (visitor, user, seller, admin)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.roles (role_name, description) VALUES
  ('visitor', 'زائر — تصفح فقط'),
  ('user', 'مستخدم — تسوق وطلبات'),
  ('seller', 'بائع — إضافة منتجات'),
  ('admin', 'مدير — تحكم كامل')
ON CONFLICT (role_name) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- المدير: tariq770871@gmail.com — ترقيته لأدمن تلقائياً عند التسجيل
-- + مزامنة auth.users.id → public.users.user_id (يحل مشكلة FK في orders)
-- ──────────────────────────────────────────────────────────────

-- ──────────────────────────────────────────────────────────────
-- 1) Sync trigger: when a new auth.users row is inserted (Supabase Auth signup),
--    mirror it into public.users with user_id = auth.users.id.
--    This makes the FK constraint fk_order_user (orders.user_id → public.users.user_id)
--    satisfiable for orders placed by authenticated users.
--
--    Without this trigger, the API inserts orders.user_id = auth.users.id,
--    but public.users.user_id is a separate random UUID → FK violation.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public_users()
RETURNS TRIGGER AS $$
DECLARE
  v_user_role VARCHAR(50) := 'user';
  v_admin_role_id UUID;
  v_existing_count INTEGER;
BEGIN
  -- Don't re-insert if a row with the same email already exists
  SELECT COUNT(*) INTO v_existing_count FROM public.users WHERE email = NEW.email;
  IF v_existing_count > 0 THEN
    -- Update the existing row's user_id to match auth.users.id (FK integrity)
    UPDATE public.users
    SET user_id = NEW.id, name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), name)
    WHERE email = NEW.email;
    RETURN NEW;
  END IF;

  -- Auto-promote the very first registered user to admin (bootstrap admin)
  -- AND auto-promote tariq770871@gmail.com explicitly (owner email)
  IF NEW.email = 'tariq770871@gmail.com' THEN
    v_user_role := 'admin';
  ELSEIF (SELECT COUNT(*) FROM public.users) = 0 THEN
    v_user_role := 'admin';
  END IF;

  SELECT role_id INTO v_admin_role_id
  FROM public.roles
  WHERE role_name = v_user_role
  LIMIT 1;

  -- Fallback to 'user' role if not found
  IF v_admin_role_id IS NULL THEN
    SELECT role_id INTO v_admin_role_id FROM public.roles WHERE role_name = 'user' LIMIT 1;
  END IF;

  INSERT INTO public.users (
    user_id,
    name,
    email,
    phone,
    role_id,
    is_active
  ) VALUES (
    NEW.id,  -- CRITICAL: use auth.users.id, not a fresh random UUID
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    v_admin_role_id,
    TRUE
  )
  ON CONFLICT (email) DO UPDATE
    SET user_id = NEW.id,
        name = EXCLUDED.name,
        phone = COALESCE(EXCLUDED.phone, public.users.phone);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger on public.users (was dead code — never fired for Supabase Auth signups)
DROP TRIGGER IF EXISTS trg_auto_admin ON public.users;

-- Attach trigger to auth.users (Supabase Auth's internal table — fires on real signups)
DROP TRIGGER IF EXISTS trg_sync_public_user ON auth.users;
CREATE TRIGGER trg_sync_public_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_public_users();

-- Keep the old function name as a no-op alias for backward compatibility
-- (in case any code references it). The new function supersedes it.
CREATE OR REPLACE FUNCTION public.auto_promote_first_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Intentionally empty — superseded by sync_auth_user_to_public_users.
  -- Kept only to avoid breaking references in old migration files.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
