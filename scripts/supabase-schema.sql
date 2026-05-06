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
  sale_price DECIMAL(12, 2) CHECK (sale_price IS NULL OR sale_price >= 0 OR sale_price < price),
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
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  total_amount DECIMAL(12, 2) DEFAULT 0 CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_order_status CHECK (status IN ('new', 'reviewing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
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
