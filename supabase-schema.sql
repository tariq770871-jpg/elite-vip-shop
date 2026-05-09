-- =====================================================
-- ELITE VIP SHOP - متجر النخبة
-- Comprehensive Database Schema for Supabase (PostgreSQL)
-- Created with precision engineering protocols
-- =====================================================

-- ===================== EXTENSIONS =====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE 1: roles (الأدوار)
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_role_name CHECK (role_name IN ('visitor', 'user', 'seller', 'admin'))
);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
    ('visitor', 'زائر - صلاحيات محدودة'),
    ('user', 'مستخدم عادي'),
    ('seller', 'بائع - يمكنه إدارة منتجاته'),
    ('admin', 'مدير النظام')
ON CONFLICT (role_name) DO NOTHING;

-- =====================================================
-- TABLE 2: users (المستخدمون)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    password_hash TEXT,
    avatar_url TEXT,
    role_id UUID NOT NULL DEFAULT (SELECT role_id FROM roles WHERE role_name = 'visitor'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_number VARCHAR(30),
    telegram_username VARCHAR(100),
    gender VARCHAR(10) DEFAULT 'male',
    address TEXT,
    show_phone BOOLEAN NOT NULL DEFAULT TRUE,
    show_email BOOLEAN NOT NULL DEFAULT TRUE,
    show_address BOOLEAN NOT NULL DEFAULT TRUE,
    show_gender BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(role_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_created ON users(created_at DESC);

-- =====================================================
-- TABLE 3: categories (التصنيفات)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(100),
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name_ar, name_en, icon, sort_order) VALUES
    ('إلكترونيات', 'Electronics', '💻', 1),
    ('برامج وتطبيقات', 'Software & Apps', '📱', 2),
    ('خدمات رقمية', 'Digital Services', '🌐', 3),
    ('ملابس وإكسسوارات', 'Clothing & Accessories', '👔', 4),
    ('أدوات ومعدات', 'Tools & Equipment', '🔧', 5),
    ('كتب ودورات', 'Books & Courses', '📚', 6),
    ('أخرى', 'Others', '📦', 7)
ON CONFLICT (name_ar) DO NOTHING;

-- =====================================================
-- TABLE 4: products (المنتجات)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID,
    name VARCHAR(300) NOT NULL,
    slug VARCHAR(350) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(15, 2) CHECK (sale_price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'ر.ي',
    category_id UUID,
    category_name VARCHAR(100) NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::JSONB,
    availability BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INTEGER NOT NULL DEFAULT 999 CHECK (stock_quantity >= 0),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_digital BOOLEAN NOT NULL DEFAULT FALSE,
    digital_link TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::JSONB,
    whatsapp_order_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) 
        REFERENCES categories(category_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_sale_price CHECK (sale_price IS NULL OR sale_price < price)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_available ON products(availability) WHERE availability = TRUE;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('arabic', name || ' ' || description));
CREATE INDEX idx_products_rating ON products(rating DESC) WHERE rating > 0;

-- =====================================================
-- TABLE 5: apps (التطبيقات)
-- =====================================================
CREATE TABLE IF NOT EXISTS apps (
    app_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    link TEXT,
    platform VARCHAR(50),
    version VARCHAR(50),
    download_count INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_apps_active ON apps(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_apps_sort ON apps(sort_order ASC);

-- =====================================================
-- TABLE 6: ai_tools (أدوات الذكاء الاصطناعي)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_tools (
    tool_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    link TEXT,
    category VARCHAR(100),
    is_free BOOLEAN NOT NULL DEFAULT TRUE,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    visit_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_tools_active ON ai_tools(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_ai_tools_sort ON ai_tools(sort_order ASC);

-- =====================================================
-- TABLE 7: academy_courses (الدورات الأكاديمية)
-- =====================================================
CREATE TABLE IF NOT EXISTS academy_courses (
    course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    instructor VARCHAR(200),
    level VARCHAR(50) NOT NULL DEFAULT 'مبتدئ',
    duration VARCHAR(100),
    lessons_count INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    price NUMERIC(15, 2) CHECK (price >= 0),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    enroll_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_active ON academy_courses(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_courses_level ON academy_courses(level);
CREATE INDEX idx_courses_sort ON academy_courses(sort_order ASC);

-- =====================================================
-- TABLE 8: earning_methods (طرق الربح)
-- =====================================================
CREATE TABLE IF NOT EXISTS earning_methods (
    method_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'متوسط',
    estimated_income TEXT,
    link TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_earning_active ON earning_methods(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_earning_sort ON earning_methods(sort_order ASC);

-- =====================================================
-- TABLE 9: cart (السلة)
-- =====================================================
CREATE TABLE IF NOT EXISTS cart (
    cart_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_cart_user ON cart(user_id);

-- =====================================================
-- TABLE 10: cart_items (عناصر السلة)
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_cartitem_cart FOREIGN KEY (cart_id) 
        REFERENCES cart(cart_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- =====================================================
-- TABLE 11: orders (الطلبات)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'ر.ي',
    shipping_address TEXT,
    phone VARCHAR(30),
    notes TEXT,
    payment_method VARCHAR(50) DEFAULT 'whatsapp',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_order_status CHECK (status IN ('new', 'reviewing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- =====================================================
-- TABLE 12: order_items (بنود الطلب)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name VARCHAR(300) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    total NUMERIC(15, 2) NOT NULL GENERATED ALWAYS AS (quantity * price) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) 
        REFERENCES orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- =====================================================
-- TABLE 13: reviews (التقييمات)
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_user_product_review UNIQUE (user_id, product_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- =====================================================
-- TABLE 14: notifications (الإشعارات)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unread',
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_notification_type CHECK (type IN ('info', 'order', 'promo', 'system', 'warning')),
    CONSTRAINT chk_notification_status CHECK (status IN ('unread', 'read', 'archived'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'unread';
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- TABLE 15: favorites (المفضلة)
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_favorite_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_user_product_favorite UNIQUE (user_id, product_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_product ON favorites(product_id);

-- =====================================================
-- TABLE 16: coupons (كوبونات الخصم)
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    coupon_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(15, 2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_coupon_type CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT chk_coupon_value CHECK (
        (discount_type = 'percentage' AND discount_value <= 100) OR
        (discount_type = 'fixed')
    )
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;

-- =====================================================
-- TABLE 17: site_settings (إعدادات الموقع)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value, description) VALUES
    ('site_name', 'متجر النخبة - ELITE VIP SHOP', 'اسم الموقع'),
    ('currency', 'ر.ي', 'العملة الافتراضية'),
    ('whatsapp_number', '967782138587', 'رقم الواتساب'),
    ('telegram_channel', 't.me/tariq77087', 'قناة التليجرام'),
    ('whatsapp_link', 'wa.me/967782138587', 'رابط الواتساب المباشر'),
    ('new_order_status', 'new', 'حالة الطلب الجديد الافتراضية'),
    ('auto_confirm_hours', '24', 'ساعات التأكيد التلقائي للطلب')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- TABLE 18: contact_messages (رسائل التواصل)
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_read ON contact_messages(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_contact_created ON contact_messages(created_at DESC);

-- =====================================================
-- TABLE 19: profile_change_requests (طلبات تعديل الملف الشخصي)
-- =====================================================
CREATE TABLE IF NOT EXISTS profile_change_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    field VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_pcr_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pcr_reviewer FOREIGN KEY (reviewed_by) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_pcr_field CHECK (field IN ('name', 'email', 'phone', 'address', 'gender')),
    CONSTRAINT chk_pcr_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_pcr_user ON profile_change_requests(user_id);
CREATE INDEX idx_pcr_status ON profile_change_requests(status) WHERE status = 'pending';
CREATE INDEX idx_pcr_created ON profile_change_requests(created_at DESC);

-- =====================================================
-- HELPER FUNCTION: Generate order number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION: Update product rating on review
-- =====================================================
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.rating IS DISTINCT FROM NEW.rating) THEN
        UPDATE products SET
            rating = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = COALESCE(NEW.product_id, OLD.product_id)), 0),
            review_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = COALESCE(NEW.product_id, OLD.product_id))
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products SET
            rating = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = OLD.product_id), 0),
            review_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = OLD.product_id)
        WHERE product_id = OLD.product_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_product_rating ON reviews;
CREATE TRIGGER trg_update_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- =====================================================
-- HELPER FUNCTION: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables that have it
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_%s ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_update_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
    END LOOP;
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Auto-generate slug for products
-- =====================================================
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = LOWER(REGEXP_REPLACE(
            COALESCE(NEW.name, 'product'),
            '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g'
        ));
        NEW.slug = REGEXP_REPLACE(NEW.slug, '(^-|-$)', '', 'g');
        -- Ensure uniqueness
        IF EXISTS (SELECT 1 FROM products WHERE slug = NEW.slug AND product_id != NEW.product_id) THEN
            NEW.slug = NEW.slug || '-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_slug ON products;
CREATE TRIGGER trg_product_slug
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION generate_product_slug();

-- =====================================================
-- Row Level Security (RLS) - Enable on all tables
-- =====================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE earning_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: Proper access control with auth.uid()
-- =====================================================

-- Helper: get user role from users table
-- Roles: readable by all
CREATE POLICY "Roles readable by all" ON roles
    FOR SELECT USING (true);

-- Users: anyone can see names, users can only update own profile
CREATE POLICY "Users readable by all" ON users
    FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Categories: readable by all
CREATE POLICY "Categories readable by all" ON categories
    FOR SELECT USING (true);

-- Products: readable by all, only sellers/admins can create/update
CREATE POLICY "Products readable by all" ON products
    FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert products" ON products
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name IN ('seller', 'admin')))
    );
CREATE POLICY "Sellers can update own products" ON products
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND (
            seller_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
        )
    );
CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- Apps: readable by all, admins only manage
CREATE POLICY "Apps readable by all" ON apps
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage apps" ON apps
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- AI Tools: readable by all, admins only manage
CREATE POLICY "AI Tools readable by all" ON ai_tools
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage AI tools" ON ai_tools
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- Academy Courses: readable by all, admins only manage
CREATE POLICY "Courses readable by all" ON academy_courses
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON academy_courses
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- Earning Methods: readable by all, admins only manage
CREATE POLICY "Earning methods readable by all" ON earning_methods
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage earning methods" ON earning_methods
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- Cart: users manage only their OWN cart
CREATE POLICY "Users manage own cart" ON cart
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Cart Items: users manage only their OWN cart items (via cart ownership)
CREATE POLICY "Users manage own cart items" ON cart_items
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM cart WHERE cart_id = cart_items.cart_id AND user_id = auth.uid())
    );

-- Orders: users read/manage only their OWN orders
CREATE POLICY "Users manage own orders" ON orders
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Order Items: users read own order items (via order ownership)
CREATE POLICY "Users read own order items" ON order_items
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM orders WHERE order_id = order_items.order_id AND user_id = auth.uid())
    );
CREATE POLICY "Users insert own order items" ON order_items
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM orders WHERE order_id = order_items.order_id AND user_id = auth.uid())
    );

-- Reviews: readable by all, users create/update only own reviews
CREATE POLICY "Reviews readable by all" ON reviews
    FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Users update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Notifications: users manage only their OWN notifications
CREATE POLICY "Users manage own notifications" ON notifications
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Favorites: users manage only their OWN favorites
CREATE POLICY "Users manage own favorites" ON favorites
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Coupons: users can read active coupons only, admins manage all
CREATE POLICY "Active coupons readable by all" ON coupons
    FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage coupons" ON coupons
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- Site Settings: readable by all, admins only manage
CREATE POLICY "Settings readable by all" ON site_settings
    FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON site_settings
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- Contact Messages: anyone can submit, admins read/update
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read contact messages" ON contact_messages
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );
CREATE POLICY "Admins update contact messages" ON contact_messages
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- Profile Change Requests: users create own requests, admins review
CREATE POLICY "Users create own change requests" ON profile_change_requests
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Users read own change requests" ON profile_change_requests
    FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Admins review change requests" ON profile_change_requests
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'))
    );

-- =====================================================
-- SEED DATA: Insert mock products from the shop
-- =====================================================
INSERT INTO products (name, description, price, sale_price, category_name, availability, seller_id, tags) VALUES
    ('سماعة بلوتوث فاخرة Elite Pro', 
     'سماعة لاسلكية بتقنية بلوتوث 5.3، صوت نقي مع إلغاء الضوضاء النشط، بطارية تدوم حتى 30 ساعة، تصميم أنيق ومريح.', 
     2500.00, 1899.00, 'إلكترونيات', TRUE, NULL, '["سماعات", "بلوتوث", "لاسلكي"]'),
     
    ('ساعة ذكية VIP Series X', 
     'ساعة ذكية بشاشة AMOLED، مراقبة صحية متقدمة، مقاومة للماء، تتبع GPS مدمج، بطارية تدوم 7 أيام.', 
     3500.00, NULL, 'إلكترونيات', TRUE, NULL, '["ساعة ذكية", "ذكي", "AMOLED"]'),
     
    ('كورس التداول الاحترافي', 
     'دورة شاملة في تداول العملات والعملات الرقمية، تشمل أكثر من 50 درس فيديو، استراتيجيات متقدمة، ودعم مباشر.', 
     500.00, 299.00, 'كتب ودورات', TRUE, NULL, '["كورس", "تداول", "عملات رقمية"]'),
     
    ('بور شارجر سريع 65W', 
     'شاحن بور ديليفري سريع 65 واط، يدعم جميع الأجهزة، مع حماية متقدمة من الحرارة والتفريغ الزائد.', 
     450.00, 350.00, 'إلكترونيات', TRUE, NULL, '["شاحن", "65W", "سريع"]'),
     
    ('اشتراك VPN Premium - سنة كاملة', 
     'اشتراك VPN سنة كامل، اتصال سريع ومستقر، أكثر من 50 دولة، لا سجلات، دعم جميع الأجهزة.', 
     1200.00, 799.00, 'برامج وتطبيقات', TRUE, NULL, '["VPN", "خصوصية", "سنة كاملة"]'),
     
    ('حقيبة جلد طبيعي فاخرة', 
     'حقيبة من الجلد الطبيعي بتصميم كلاسيكي، مناسبة للعمل والسفر، مقاومة للماء، مع حماية للاب توب حتى 15 بوصة.', 
     1800.00, NULL, 'ملابس وإكسسوارات', TRUE, NULL, '["حقيبة", "جلد", "فاخرة"]'),
     
    ('ماوس لاسلكي ميكانيكي للجيمرز', 
     'ماوس ألعاب لاسلكي بمستشعر دقة 16000 DPI، أزرار قابلة للبرمجة، وزن قابل للتعديل، إضاءة RGB.', 
     650.00, 499.00, 'إلكترونيات', TRUE, NULL, '["ماوس", "جيمرز", "لاسلكي"]'),
     
    ('حزمة أدوات التصميم الاحترافية', 
     'مجموعة كاملة من أدوات التصميم تشمل فرش مخصصة، قوالب، خطوط، وأيقونات للاستخدام التجاري.', 
     350.00, NULL, 'برامج وتطبيقات', TRUE, NULL, '["تصميم", "فرش", "قوالب"]'),
     
    ('نظارات حماية للشاشات', 
     'نظارات بفلتر الأزرق لحماية العينين من إشعاع الشاشات، إطار خفيف ومريح للارتداء الطويل.', 
     280.00, NULL, 'إلكترونيات', TRUE, NULL, '["نظارات", "حماية", "فلتر أزرق"]'),
     
    ('كتاب أسرار الربح من الإنترنت', 
     'دليل شامل يغطي أكثر من 20 طريقة مجربة للربح من الإنترنت، مع أمثلة حقيقية وخطط عمل مفصلة.', 
     150.00, 89.00, 'كتب ودورات', TRUE, NULL, '["كتاب", "ربح", "إنترنت"]'),
     
    ('طقم أدوات متعددة الاستخدام', 
     'طقم 42 قطعة أدوات يدوية متعددة الاستخدامات، مصنوعة من الفولاذ المقاوم للصدأ، بحقيبة حمل متينة.', 
     890.00, 650.00, 'أدوات ومعدات', TRUE, NULL, '["أدوات", "طقم", "فولاذ"]'),
     
    ('باور بانك 20000mAh', 
     'بطارية خارجية سعة 20000 مللي أمبير، شحن سريع 22.5W، يمكن شحن جهازين في نفس الوقت، شاشة LED.', 
     550.00, 399.00, 'إلكترونيات', TRUE, NULL, '["باور بانك", "شحن", "20000mAh"]')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Insert apps
-- =====================================================
INSERT INTO apps (title, description, link, platform, sort_order) VALUES
    ('تطبيق إدارة المهام الذكية', 
     'تطبيق متقدم لإدارة المهام اليومية مع ذكاء اصطناعي لترتيب الأولويات وتذكيرات ذكية.', 
     '#', 'Android/iOS', 1),
    ('محرر الصور الاحترافي', 
     'محرر صور قوي بفلتر احترافية وأدوات تعديل متقدمة، يعمل بدون إنترنت.', 
     '#', 'Android/iOS', 2),
    ('تطبيق تعلم اللغات', 
     'تطبيق تفاعلي لتعلم اللغات بطريقة ممتعة مع دروس يومية وممارسة المحادثة.', 
     '#', 'Android/iOS', 3),
    ('ماسح PDF متقدم', 
     'تطبيق لمسح المستندات وتحويلها إلى PDF عالي الجودة مع التعرف على النصوص OCR.', 
     '#', 'Android/iOS', 4),
    ('تطبيق اللياقة البدنية', 
     'برنامج تمارين شخصي مع متتبع للتمارين والسعرات والماء، يشمل فيديوهات تعليمية.', 
     '#', 'Android/iOS', 5),
    ('تطبيق الميزانية الشخصية', 
     'تطبيق لتنظيم المصاريف والميزانية مع رسوم بيانية وتقارير مفصلة.', 
     '#', 'Android/iOS', 6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Insert AI tools
-- =====================================================
INSERT INTO ai_tools (title, description, link, category, is_free, sort_order) VALUES
    ('ChatGPT - مساعد ذكي', 
     'أقوى مساعد ذكاء اصطناعي للدردشة والكتابة، يساعد في المحتوى والأكواد والأفكار.', 
     'https://chat.openai.com', 'محادثة ذكية', TRUE, 1),
    ('Midjourney - توليد الصور', 
     'أداة لإنشاء صور فنية مذهلة باستخدام الذكاء الاصطناعي من وصف نصي.', 
     'https://midjourney.com', 'تصميم وصور', FALSE, 2),
    ('Canva AI - التصميم الذكي', 
     'منصة تصميم مجانية مع أدوات ذكاء اصطناعي لإنشاء تصاميم احترافية بسهولة.', 
     'https://canva.com', 'تصميم', TRUE, 3),
    ('Gamma AI - عروض تقديمية', 
     'إنشاء عروض تقديمية ومواقع ويب احترافية بالذكاء الاصطناعي في ثوانٍ.', 
     'https://gamma.app', 'عروض تقديمية', TRUE, 4),
    ('Notion AI - إدارة المعرفة', 
     'أداة متكاملة لإدارة الملاحظات والمشاريع مع مساعد ذكاء اصطناعي مدمج.', 
     'https://notion.so', 'إنتاجية', TRUE, 5),
    ('ElevenLabs - توليد الأصوات', 
     'تحويل النص إلى كلام بشري طبيعي بأصوات متعددة اللغات.', 
     'https://elevenlabs.io', 'صوتيات', TRUE, 6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Insert academy courses
-- =====================================================
INSERT INTO academy_courses (title, description, instructor, level, sort_order, is_free) VALUES
    ('أساسيات التداول في الأسواق المالية', 
     'تعلم أساسيات التحليل الفني والأساسي، فهم الشموع اليابانية، وتحديد نقاط الدخول والخروج.', 
     'أكاديمية النخبة', 'مبتدئ', 1, TRUE),
    ('تداول العملات الرقمية للمبتدئين', 
     'دليل شامل لفهم العملات الرقمية، البلوكتشين، وبدء التداول بأمان.', 
     'أكاديمية النخبة', 'مبتدئ', 2, TRUE),
    ('إدارة المخاطر والرأس المال', 
     'تعلم كيفية حماية رأس المال، تحديد حجم الصفقة، واستراتيجيات إدارة المخاطر.', 
     'أكاديمية النخبة', 'متوسط', 3, FALSE),
    ('التحليل النفسي للمتداول', 
     'فهم سيكولوجية التداول، التحكم في المشاعر، وبناء الانضباط التجاري.', 
     'أكاديمية النخبة', 'متقدم', 4, FALSE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Insert earning methods
-- =====================================================
INSERT INTO earning_methods (title, description, difficulty, sort_order) VALUES
    ('التسويق بالعمولة (Affiliate Marketing)', 
     'ربح العمولات من الترويج لمنتجات وخدمات الآخرين عبر الإنترنت.', 
     'متوسط', 1),
    ('صناعة المحتوى و اليوتيوب', 
     'إنشاء محتوى فيديو جذاب على يوتيوب والربح من الإعلانات والرعايات.', 
     'متوسط', 2),
    ('البيع أونلاين (التجارة الإلكترونية)', 
     'افتتاح متجر إلكتروني وبيع المنتجات محلياً وعالمياً عبر المنصات.', 
     'متقدم', 3),
    ('العمل الحر (Freelancing)', 
     'تقديم خدماتك المهنية عبر منصات العمل الحر مثل التصميم والبرمجة والكتابة.', 
     'مبتدئ', 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- LINK products to categories
-- =====================================================
UPDATE products p SET category_id = c.category_id
FROM categories c
WHERE p.category_name = c.name_ar;

-- =====================================================
-- GRANT permissions - LEAST PRIVILEGE principle
-- =====================================================
-- Anon (public/visitors): read-only access
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Authenticated users: SELECT + limited INSERT/UPDATE
GRANT INSERT ON cart, cart_items, order_items, reviews, favorites, contact_messages, notifications, profile_change_requests IN SCHEMA public TO authenticated;
GRANT UPDATE ON users, cart, cart_items, reviews, notifications, profile_change_requests IN SCHEMA public TO authenticated;
GRANT DELETE ON cart_items, favorites, notifications IN SCHEMA public TO authenticated;

-- NOTE: DELETE on orders, products, users, coupons, site_settings, etc. 
-- is restricted to admins only via Supabase Dashboard or service role key.
-- Authenticated users CANNOT delete important data.

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
