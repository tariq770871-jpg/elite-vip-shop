# -*- coding: utf-8 -*-
"""
Elite VIP Shop Report — Content Sections (Part 2)
Sections 7-12: Database, Integrations, Audit, Recommendations, Env vars
"""

from reportlab.platypus import Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import mm

from generate_project_report import (
    STYLES, CONTENT_W, ACCENT_GOLD, CARD_BG, BORDER, TEXT_PRIMARY,
    TEXT_MUTED, HEADER_FILL, TEXT_LIGHT, SUCCESS, WARNING, DANGER, INFO,
    SECTION_BG_DARK,
    GoldDivider, callout, code_block, code_block_split, data_table,
    heading, body_para, bullet_list, ar, ar_para,
)
from report_sections_part1 import (
    stat_row,
)


# ═══════════════════════════════════════════════════════════════════
#  Section 7: Database Schema (قاعدة البيانات)
# ═══════════════════════════════════════════════════════════════════
def section_database(story):
    heading("قاعدة البيانات (Supabase Schema)", level=1, story=story, toc_level=0)

    body_para(
        "تعتمد المنصة على <b>Supabase</b> كخدمة قاعدة بيانات مبنية على "
        "PostgreSQL، مع تفعيل <b>Row Level Security (RLS)</b> على الجداول "
        "الحساسة لضمان أن المستخدمين لا يمكنهم الوصول إلا لبياناتهم الخاصة. "
        "يتم تخزين الـ schema الكامل في ملف <font face='Mono'>scripts/"
        "supabase-schema.sql</font> (824 سطر)، مع 4 ملفات هجرة إضافية في "
        "مجلد <font face='Mono'>supabase-migrations/</font>.",
        story
    )

    heading("الجداول الرئيسية", level=2, story=story, toc_level=1)
    tables_data = [
        ["roles", "UUID", "role_id, role_name, description", "visitor, user, seller, admin"],
        ["users", "UUID", "user_id, name, email, phone, role_id, is_active", "جدول legacy — قبل profiles"],
        ["profiles", "UUID", "user_id, is_admin", "Schema جديد — يربط بـ auth.users"],
        ["categories", "UUID", "category_id, name, slug, icon, sort_order", "تصنيفات المنتجات"],
        ["products", "UUID", "product_id, seller_id, name, price, sale_price, images, availability", "الفهرس الرئيسي"],
        ["orders", "UUID", "order_id, order_number, user_id, status, total_amount, notes", "الطلبات"],
        ["order_items", "UUID", "order_id, product_name, quantity, price, product_id", "عناصر الطلب"],
        ["reviews", "UUID", "review_id, product_id, user_id, rating, comment, is_approved", "مراجعات المنتجات"],
        ["coupons", "VARCHAR", "code, discount_value, min_order_amount, max_uses, used_count", "كوبونات الخصم"],
        ["apps", "UUID", "app_id, title, description, link", "تطبيقات رقمية"],
        ["tools", "UUID", "tool_id, title, description, link", "أدوات AI"],
        ["courses", "UUID", "course_id, title, description", "دورات تدريبية"],
        ["methods", "UUID", "method_id, title, description", "طرق الربح"],
        ["blog_posts", "UUID", "slug, title, content, image, category", "مدونة المحتوى"],
    ]
    story.append(data_table(
        ["اسم الجدول", "PK type", "أهم الأعمدة", "الوصف"],
        tables_data,
        col_widths=[28*mm, 18*mm, CONTENT_W - 105*mm, 33*mm]
    ))
    story.append(Spacer(1, 5*mm))

    heading("أعمدة الترحيل الإضافية على جدول orders", level=2, story=story, toc_level=1)
    body_para(
        "خلال التطوير، تمت إضافة أعمدة جديدة لجدول <font face='Mono'>orders"
        "</font> لدعم نظام الطلبات المبني على المحادثة (chat-based ordering). "
        "تم توحيد قائمة الأعمدة في ثابت <font face='Mono'>ORDERS_MIGRATION_COLUMNS"
        "</font> داخل <font face='Mono'>src/lib/constants.ts</font>، لاستخدامها "
        "في كل من <font face='Mono'>/api/migrate</font> و <font face='Mono'>"
        "/api/migrate-db</font> ومنع الانحراف بين النقطتين.",
        story
    )

    story.extend(code_block_split(
        '// src/lib/constants.ts (مختصر)\n'
        'export const ORDERS_MIGRATION_COLUMNS = [\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT \'pickup\'",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS province VARCHAR(100)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS district VARCHAR(100)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS street VARCHAR(255)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS landmark VARCHAR(255)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(500)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2)",\n'
        '  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",\n'
        '] as const;',
        max_lines=20
    ))

    heading("الفهارس والأداء", level=2, story=story, toc_level=1)
    body_para(
        "تم إنشاء فهارس B-tree على الأعمدة المستخدمة بكثرة في الاستعلامات "
        "(email, role_id, category_id, seller_id, availability, is_featured, "
        "price, created_at). كما تم إنشاء فهرس GIN على جدول المنتجات لدعم "
        "البحث النصي العربي عبر <font face='Mono'>to_tsvector('arabic', ...)"
        "</font>. توجد فهارس إضافية على جدول الطلبات لحالة الطلب و seller_id.",
        story
    )

    heading("قيود السلامة (Constraints)", level=2, story=story, toc_level=1)
    bullet_list([
        ("CHECK على roles.role_name", "يقبل فقط: visitor, user, seller, admin"),
        ("CHECK على users.email", "صيغة بريد إلكتروني صحيحة عبر regex"),
        ("CHECK على users.phone", "إن وُجد، يجب أن يطابق ^[+]?[0-9]{7,15}$"),
        ("CHECK على products.price", "يجب أن يكون >= 0"),
        ("CHECK على products.sale_price", "إن وُجد، يجب أن يكون >= 0 وأقل من price"),
        ("FOREIGN KEY", "كل العلاقات مع ON DELETE SET NULL أو RESTRICT حسب الأهمية"),
    ], story=story)

    story.append(callout(
        "إصلاح أمني — ssl: rejectUnauthorized",
        "في ملف <font face='Mono'>api/migrate/route.ts</font>، كان الإعداد "
        "<font face='Mono'>ssl: { rejectUnauthorized: false }</font> مما يسمح "
        "بهجمات man-in-the-middle. تم تغييره إلى <font face='Mono'>true</font> "
        "لضمان التحقق من شهادة Supabase SSL.",
        kind="danger"
    ))
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 8: Third-party Integrations (التكاملات)
# ═══════════════════════════════════════════════════════════════════
def section_integrations(story):
    heading("تكامل الطرف الثالث", level=1, story=story, toc_level=0)

    body_para(
        "تعتمد المنصة على عدد من الخدمات الخارجية لتقديم تجربة متكاملة، "
        "كل منها له دور محدد وواضح. تم توثيق متغيرات البيئة اللازمة لكل "
        "تكامل في ملف <font face='Mono'>.env.example</font>، مع التحقق منها "
        "عند بدء التشغيل عبر <font face='Mono'>src/lib/env.ts</font>.",
        story
    )

    heading("Supabase (قاعدة بيانات + مصادقة + RLS)", level=2, story=story, toc_level=1)
    body_para(
        "العمود الفقري للمنصة. يستخدم لكل من قاعدة البيانات (PostgreSQL)، "
        "نظام المصادقة (Auth)، والتخزين (Storage). يتم إنشاء عميلين منفصلين: "
        "<b>عميل المتصفح</b> عبر <font face='Mono'>@supabase/ssr</font> "
        "(يستخدم anon key آمنة للنشر)، و<b>عميل الخادم</b> عبر "
        "<font face='Mono'>@supabase/supabase-js</font> مع service role key "
        "(للعمليات الإدارية التي تتجاوز RLS).",
        story
    )

    heading("Telegram Bot (إشعارات الإدارة)", level=2, story=story, toc_level=1)
    body_para(
        "تكامل مزدوج: من جهة الخادم (Next.js) يرسل إشعاراً فورياً إلى قناة "
        "الإدارة عند إنشاء طلب جديد، عبر <font face='Mono'>src/lib/telegram.ts"
        "</font> باستخدام Telegram Bot API. ومن جهة أخرى، يوجد بوت مستقل "
        "في <font face='Mono'>mini-services/telegram-bot/</font> يعمل بـ "
        "Bun ويوفر أوامر تفاعلية للإدارة. تم تقييد CORS في البوت عبر "
        "<font face='Mono'>ALLOWED_ORIGINS</font> بدلاً من <font face='Mono'>"
        "*</font>، مع إضافة مصادقة لنقطة <font face='Mono'>/configure</font>.",
        story
    )

    story.extend(code_block_split(
        '// src/lib/telegram.ts (نمط الإشعار)\n'
        'export async function sendOrderNotification(order) {\n'
        '  const botToken = process.env.TELEGRAM_BOT_TOKEN;\n'
        '  const chatId = process.env.TELEGRAM_CHAT_ID;\n'
        '  if (!botToken || !chatId) {\n'
        '    console.warn("Telegram env vars not set");\n'
        '    return null;\n'
        '  }\n'
        '\n'
        '  const timestamp = formatAdenTimestamp(); // Asia/Aden\n'
        '  const message = buildOrderMessage(order, timestamp);\n'
        '\n'
        '  const res = await fetch(\n'
        '    `https://api.telegram.org/bot${botToken}/sendMessage`, {\n'
        '      method: "POST",\n'
        '      headers: {"Content-Type": "application/json"},\n'
        '      body: JSON.stringify({\n'
        '        chat_id: chatId,\n'
        '        text: message,\n'
        '        parse_mode: "HTML",\n'
        '      }),\n'
        '    }\n'
        '  );\n'
        '  return res.ok;\n'
        '}',
        max_lines=25
    ))

    heading("WhatsApp (تواصل العملاء)", level=2, story=story, toc_level=1)
    body_para(
        "يُستخدم WhatsApp كقناة تواصل أساسية مع العملاء، سواء للاستفسار أو "
        "لإتمام الطلبات خارج المنصة. الرقم موحّد في <font face='Mono'>"
        "src/lib/site-config.ts</font> كـ <font face='Mono'>WHATSAPP_NUMBER"
        "</font>، ويُستخرج منه رابط <font face='Mono'>wa.me</font> تلقائياً. "
        "تتوفر دالتان مساعدتان: <font face='Mono'>getWhatsAppOrderLink()"
        "</font> و <font face='Mono'>getWhatsAppServiceLink()</font> لبناء "
        "روابط مع رسائل جاهزة.",
        story
    )

    heading("Vercel Analytics + Google Analytics 4", level=2, story=story, toc_level=1)
    body_para(
        "تم تكامل <b>Vercel Analytics</b> افتراضياً لتتبّع Web Vitals بدون "
        "إعداد إضافي. أما <b>Google Analytics 4</b> فيُفعّل فقط عند تعيين "
        "<font face='Mono'>NEXT_PUBLIC_GA_MEASUREMENT_ID</font> — تمت إزالة "
        "المعرّف المصلّب السابق <font face='Mono'>G-GB8NMT2G45</font> لأسباب "
        "خصوصية. الـ GA4 script يُحمّل بـ <font face='Mono'>strategy="
        "\"afterInteractive\"</font> لتجنّب تأخير التحميل الأولي.",
        story
    )

    heading("Google Search Console", level=2, story=story, toc_level=1)
    body_para(
        "يتم إضافة وسوم التحقق عبر <font face='Mono'>NEXT_PUBLIC_GSC_VERIFICATION"
        "</font> فقط عند تعيينها، مع ترك القيمة فارغة افتراضياً بدلاً من "
        "إظهار وسم فارغ. هذا يضمن نظافة الـ HTML عند عدم الحاجة للتحقق.",
        story
    )

    heading("Service Worker (PWA)", level=2, story=story, toc_level=1)
    body_para(
        "ملف <font face='Mono'>public/sw.js</font> يوفّر إمكانات PWA الأساسية: "
        "precache للأصول الحرجة (manifest, offline page)، استراتيجية "
        "stale-while-revalidate للصفحات، و cache-first للأصول الثابتة. "
        "الإصدار الحالي <font face='Mono'>CACHE_NAME = v3</font>، ويتم تحديث "
        "الـ SW كل ساعة عبر فحص دوري في <font face='Mono'>layout-client.tsx"
        "</font> مع تنظيف الـ interval عند إلغاء تحميل المكوّن.",
        story
    )

    heading("جدول التكاملات", level=2, story=story, toc_level=1)
    integrations_data = [
        ["Supabase", "DB + Auth + RLS + Storage", "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY", "إلزامي"],
        ["Telegram Bot API", "إشعارات الإدارة", "TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID", "اختياري"],
        ["WhatsApp (wa.me)", "تواصل العملاء", "NEXT_PUBLIC_WHATSAPP_NUMBER", "اختياري"],
        ["Vercel Analytics", "Web Vitals", "تلقائي عبر @vercel/analytics", "تلقائي"],
        ["Google Analytics 4", "تحليلات المستخدم", "NEXT_PUBLIC_GA_MEASUREMENT_ID", "اختياري"],
        ["Google Search Console", "التحقق من الملكية", "NEXT_PUBLIC_GSC_VERIFICATION", "اختياري"],
        ["Service Worker (PWA)", "Offline + caching", "بدون إعداد", "تلقائي"],
    ]
    story.append(data_table(
        ["الخدمة", "الدور", "متغيرات البيئة", "الحالة"],
        integrations_data,
        col_widths=[35*mm, 35*mm, CONTENT_W - 105*mm, 20*mm]
    ))
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 9: Security & Quality Audit (تقرير التدقيق)
# ═══════════════════════════════════════════════════════════════════
def section_audit_report(story):
    heading("تقرير تدقيق الأمان والجودة", level=1, story=story, toc_level=0)

    body_para(
        "تم خلال دورة التطوير إجراء <b>تدقيق شامل</b> على كامل قاعدة الكود، "
        "انتهى بإصلاح <b>182 مشكلة</b> موزّعة على عشر مجموعات عمل منفصلة. "
        "كل مجموعة ركّزت على جانب محدد (الأمان، الأداء، PWA، SEO، جودة الكود)، "
        "مع التحقق من نجاح البناء (<font face='Mono'>tsc --noEmit</font> + "
        "<font face='Mono'>next build</font>) بعد كل مجموعة.",
        story
    )

    heading("ملخص المجموعات العشر", level=2, story=story, toc_level=1)
    groups_data = [
        ["1-6", "الأمان، الأداء، API، DB", "94", "تم الإصلاح في الجلسات السابقة"],
        ["7", "الإعدادات والبيئة", "12", "مركزية SITE_URL، .env.example، /api/health"],
        ["8", "PWA و Service Worker و Hydration", "10", "إصلاح hydration mismatch، تحسين SW"],
        ["9", "SEO والوسوم الوصفية", "12", "مركزية metadata، SSG للمنتجات، JSON-LD"],
        ["10 (الجولة 1)", "جودة الكود", "10", "مركزية الروابط، استبدال any"],
        ["10 (الجولة 2)", "جودة الكود", "25", "مركزية utilities، إزالة التكرار"],
        ["10 (الجولة 3)", "إصلاح شامل مستقبلي", "46", "الفئات السبع المفصّلة أدناه"],
    ]
    story.append(data_table(
        ["المجموعة", "الموضوع", "عدد المشاكل", "أبرز الإنجازات"],
        groups_data,
        col_widths=[28*mm, 50*mm, 22*mm, CONTENT_W - 100*mm]
    ))
    story.append(Spacer(1, 6*mm))

    heading("تفصيل الجولة الثالثة (46 مشكلة في 7 فئات)", level=2, story=story, toc_level=1)

    heading("الفئة 1 — أخطاء أمنية وتشغيلية (12 مشكلة)", level=3, story=story, toc_level=2)
    bullet_list([
        ("نجاحات وهمية في APIs", "إزالة { orderId: 'local' } و { orders: [] } و { success: true } عند فقدان DB، استبدالها بخطأ 503 صريح في 6 APIs"),
        ("صمت الأخطاء (.catch(() => {}))", "استبدال 5 حالات في search-bar, product-detail, login, register, layout-client بـ console.warn مع رسالة واضحة"),
        ("تأكيدات غير آمنة (!)", "إزالة reviews!.reduce() في reviews/route.ts وإضافة فحص null"),
        ("عدم فحص JSON", "استبدال res.json() بـ safeReadJson() في cart-drawer و testimonials-section لمنع crash عند استجابة non-JSON"),
        ("URL غير آمن", "استبدال new URL(document.referrer) بـ safeParseUrl() في layout-client لمنع crash"),
        ("الحافظة بدون فحص", "إضافة try/catch + فحص navigator.clipboard في dashboard-section.copySQL"),
    ], story=story)

    heading("الفئة 2 — استبدال أنواع any (5 مشاكل)", level=3, story=story, toc_level=2)
    bullet_list([
        ("dashboard-section.tsx", "4 استبدالات: (p: any) → SupabaseProductRow, (o: any) → SupabaseOrderRow, payload: Record<string, any> → Record<string, unknown>"),
        ("testimonials-section.tsx", "(r: any) → SupabaseReviewRow"),
        ("reviews/route.ts", "(r: any) → SupabaseReviewRow"),
        ("النتيجة", "لا يوجد أي as any متبقٍّ في المشروع"),
    ], story=story)

    heading("الفئة 3 — استخراج دوال مشتركة (6 مشاكل)", level=3, story=story, toc_level=2)
    bullet_list([
        ("formatAdenTimestamp()", "استبدال 7 تكرارات لـ toLocaleString('ar-YE', { timeZone: 'Asia/Aden' }) في telegram.ts, notify/route.ts (5 مرات), contact/route.ts"),
        ("ORDERS_MIGRATION_COLUMNS", "استخراج قائمة ALTER TABLE الموحّدة إلى constants.ts — تُستخدم في migrate/route.ts و migrate-db/route.ts"),
        ("استبدال itemsMap المكرر", "في orders-section.tsx"),
        ("توحيد تحقق الأدمن", "في admin-route.tsx و protected-route.tsx"),
    ], story=story)

    heading("الفئة 4 — أنواع TypeScript غير مكتملة (8 مشاكل)", level=3, story=story, toc_level=2)
    bullet_list([
        ("extractRoleName()", "دالة مركزية في types/db.ts — استبدلت 6 تأكيدات (roles as { role_name?: string }) في middleware, admin-auth, admin/users, auth/role"),
        ("SupabaseProductRow", "استبدال نوع inline في orders/route.ts"),
        ("OrderInsertPayload", "استبدال Record<string, unknown> في orders/route.ts"),
        ("CouponUpdatePayload + SupabaseCouponRow", "استبدال Record<string, unknown> في coupons/route.ts"),
        ("مركزية كل الأنواع", "نقل كل SupabaseXxxRow من supabase-data.ts إلى types/db.ts"),
    ], story=story)

    heading("الفئة 5 — كود ميت (5 مشاكل)", level=3, story=story, toc_level=2)
    bullet_list([
        ("announcement-banner.tsx", "حذف متغير mounted غير المستخدم"),
        ("layout-client.tsx", "إزالة كتلة if الفارغة بعد SW update"),
        ("supabase-data.ts", "حذف التعليقات الميتة عن دوال محذوفة"),
        ("notification-panel.tsx", "حذف استيراد X و useRef غير المستخدمين"),
        ("مجلد elite-vip-shop/", "نسخة كاملة من المشروع كانت موجودة كـ dead code — حُذفت بالكامل"),
    ], story=story)

    heading("الفئة 6 — أنماط غير متسقة (5 مشاكل)", level=3, story=story, toc_level=2)
    bullet_list([
        ("MAX_QUANTITY_PER_ITEM", "توحيد إلى 99 عبر cart-store, order-modal, orders API (كان 100 في بعض الأماكن)"),
        ("ترتيب فحص المصادقة", "في admin/orders/route.ts PATCH — نقل فحص المصادقة قبل تحليل الجسم (security)"),
        ("variable shadowing", "إزالة إعادة تعريف serviceClient في كتلة الكوبون بـ orders/route.ts"),
        ("extractRoleName()", "استبدال التأكيدات المكررة في middleware.ts"),
        ("تسمية متغيرات الخطأ", "توحيد getErr, patchErr, deleteErr في admin/users/route.ts"),
    ], story=story)

    heading("الفئة 7 — قيم مصلّبة (5 مشاكل)", level=3, story=story, toc_level=2)
    bullet_list([
        ("GOLD_GRADIENT_CSS + GOLD_GRADIENT_VERTICAL_CSS", "في constants.ts — استبدال التدرّج الذهبي المكرر في navbar.tsx"),
        ("THEME_COLOR", "استبدال '#d4a843' المصلّب في layout.tsx"),
        ("SEARCH_DEBOUNCE_MS + SEARCH_MAX_RESULTS", "استبدال 200 و 6 في search-bar.tsx"),
        ("ثوابت order-modal", "استبدال 300, 700, 400, 5000 بـ ORDER_MODAL_*_MS في constants.ts"),
        ("TOOLTIP_SHOW_DELAY_MS", "استبدال 3000 في floating-whatsapp.tsx"),
        ("SCROLL_TO_TOP_THRESHOLD + SW_UPDATE_INTERVAL_MS", "استبدال 400 و 60*60*1000 في layout-client.tsx"),
        ("ANNOUNCEMENT_ROTATION_MS", "استبدال 4000 في announcement-banner.tsx"),
    ], story=story)
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 10: Future Improvements (التحسينات المستقبلية)
# ═══════════════════════════════════════════════════════════════════
def section_future_improvements(story):
    heading("التحسينات المستقبلية المقترحة", level=1, story=story, toc_level=0)

    body_para(
        "هذا القسم موجَّه خصيصاً <b>لأداة الذكاء الاصطناعي</b> التي ستتلقّى "
        "التقرير — يقترح مجالات تطوير يمكن تحليلها وإضافة توصيات تفصيلية "
        "عليها. كل اقتراح مبني على فجوة حقيقية في المنصة الحالية أو فرصة "
        "لتحسين تجربة المستخدم أو الأداء أو الأمان.",
        story
    )

    heading("1. مراقبة الأداء والأخطاء", level=2, story=story, toc_level=1)
    body_para(
        "لا يوجد حالياً نظام لمراقبة الأخطاء في الإنتاج (production error "
        "tracking). تكامل <b>Sentry</b> مع Next.js سيوفر رؤية فورية للأخطاء، "
        "trace stacks، وأداء الـ Server Components. كما يمكن إضافة "
        "<b>Vercel Speed Insights</b> لقياس الأداء الفعلي لدى المستخدمين "
        "(Field Data) بدلاً من الاعتماد فقط على Lab Data.",
        story
    )

    heading("2. اختبارات آلية (Automated Testing)", level=2, story=story, toc_level=1)
    body_para(
        "المشروع لا يحتوي على أي اختبارات آلية حالياً — لا unit tests ولا "
        "integration tests ولا E2E. هذا يمثل خطراً على المدى الطويل، خصوصاً "
        "مع نمو المنصة. يُقترح إضافة <b>Vitest</b> لاختبارات الوحدات "
        "(خصوصاً للدوال في utils.ts و constants.ts)، و <b>Playwright</b> "
        "لاختبارات E2E على المسارات الحرجة: تسجيل الدخول، إنشاء طلب، "
        "إدارة المنتجات. يمكن البدء بمعدّل تغطية 60% للملفات الحرجة.",
        story
    )

    heading("3. CI/CD Pipeline", level=2, story=story, toc_level=1)
    body_para(
        "لا يوجد pipeline مؤتمت للنشر. إضافة <b>GitHub Actions</b> مع workflow "
        "يتحقق من: lint + type-check + build + tests قبل السماح بدمج PR. "
        "هذا يضمن عدم وصول كود معطوب إلى الإنتاج. يمكن أيضاً إضافة "
        "<b>Vercel Preview Deployments</b> لكل PR لمراجعة بصرية قبل الدمج.",
        story
    )

    heading("4. دعم متعدد اللغات (i18n)", level=2, story=story, toc_level=1)
    body_para(
        "المنصة عربية فقط حالياً مع تصليل locale 'ar_AR' في كل الـ metadata. "
        "إذا كان التوسع المستقبلي يشمل أسواقاً غير عربية (مثلاً إنجليزي "
        "للمغتربين)، يُقترح استخدام <b>next-intl</b> أو <b>next-i18next</b> "
        "مع فصل النصوص إلى ملفات JSON منفصلة. الـ middleware جاهز لدعم "
        "هذا عبر إضافة locale prefix في الـ URL.",
        story
    )

    heading("5. تكامل مدفوعات حقيقي", level=2, story=story, toc_level=1)
    body_para(
        "المدفوعات الحالية تعتمد على وسائل محلية (جيب، جوالي، سلطيف) "
        "بدون تكامل برمجي فعلي — يتم تسجيل الطلب وانتظار تأكيد يدوي. "
        "يمكن إضافة <b>Stripe</b> للبطاقات الدولية، أو تكامل مباشر مع "
        "محافظ جيب/جوالي عبر APIs الرسمية (إن توفّرت) لأتمتة التأكيد "
        "وتقليل الجهد اليدوي للإدارة.",
        story
    )

    heading("6. لوحة تحليلات للبائعين", level=2, story=story, toc_level=1)
    body_para(
        "دور البائع (seller) معرّف لكنه غير مستغل بالكامل. يمكن إضافة صفحة "
        "<font face='Mono'>/seller/dashboard</font> تعرض للبائع: مبيعاته، "
        "أكثر منتجاته طلباً، متوسط التقييمات، طلبات معلّقة. البيانات موجودة "
        "في قاعدة البيانات (orders + seller_id) — يلزم فقط بناء الواجهة و RLS "
        "policies لمنع البائع من رؤية بيانات بائعين آخرين.",
        story
    )

    heading("7. البحث المتقدم", level=2, story=story, toc_level=1)
    body_para(
        "البحث الحالي يستخدم <font face='Mono'>LIKE</font> بسيط في PostgreSQL "
        "مع فهرس GIN على to_tsvector('arabic', ...). للأداء الأفضل مع كميات "
        "كبيرة من المنتجات، يمكن دمج <b>Meilisearch</b> أو <b>Algolia</b> "
        "كمحرك بحث مستقل مع مزامنة تلقائية من Supabase عبر webhooks. هذه "
        "الخدمات تدعم البحث الضبابي (fuzzy search) والتصحيح الإملائي "
        "والترتيب حسب الصلة بطريقة أفضل من PostgreSQL.",
        story
    )

    heading("8. نظام المراجعات المتقدم", level=2, story=story, toc_level=1)
    body_para(
        "نظام المراجعات الحالي بسيط (rating + comment + is_approved). يمكن "
        "تطويره ليشمل: صور مرفقة من العميل، ردود البائع على المراجعات، "
        "تصنيفات فرعية (جودة، سرعة التوصيل، خدمة العملاء)، تأكيد شراء فعلي "
        "(verified buyer badge) عبر ربط المراجعة بطلب مكتمل. كل هذه الحقول "
        "يمكن إضافتها لجدول reviews بدون تغييرات جذرية.",
        story
    )

    story.append(callout(
        "تحدّيات متوقّعة",
        "أكبر تحدٍّ للمنصة في المرحلة القادمة هو <b>غياب الاختبارات الآلية</b> "
        "— أي تغيير مستقبلي يحمل خطر كسر ميزة موجودة دون اكتشاف. الأولوية "
        "القصوى يجب أن تكون لإضافة Vitest + Playwright قبل أي ميزة جديدة. "
        "ثاني تحدٍّ هو <b>عدم وجود monitoring للإنتاج</b> — الأخطاء لا "
        "تُكتشف إلا من شكاوى المستخدمين.",
        kind="warning"
    ))
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 11: Environment Variables (ملحق المتغيرات البيئية)
# ═══════════════════════════════════════════════════════════════════
def section_env_vars(story):
    heading("ملحق: المتغيرات البيئية", level=1, story=story, toc_level=0)

    body_para(
        "تم توثيق كل متغيرات البيئة في ملف <font face='Mono'>.env.example"
        "</font> مع التحقق منها عند بدء التشغيل عبر <font face='Mono'>"
        "src/lib/env.ts</font>. تنقسم المتغيرات إلى مجموعتين: <b>إلزامية</b> "
        "(required) — يجب تعيينها وإلا فشل البناء في الإنتاج، و<b>اختيارية</b> "
        "(optional) — لها قيم افتراضية آمنة. المتغيرات التي تبدأ بـ "
        "<font face='Mono'>NEXT_PUBLIC_</font> تكون متاحة في المتصفح ويجب "
        "ألا تحتوي على أسرار.",
        story
    )

    heading("المتغيرات الإلزامية", level=2, story=story, toc_level=1)
    required_vars = [
        ["NEXT_PUBLIC_SUPABASE_URL", "public", "رابط مشروع Supabase", "https://xxx.supabase.co"],
        ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "public", "مفتاح anon آمن للمتصفح", "eyJhbGciOiJIUzI1..."],
        ["SUPABASE_SERVICE_ROLE_KEY", "server", "مفتاح service role — يحظر تعريضه للمتصفح", "eyJhbGciOiJIUzI1..."],
    ]
    story.append(data_table(
        ["المتغير", "النوع", "الوصف", "مثال"],
        required_vars,
        col_widths=[55*mm, 18*mm, CONTENT_W - 113*mm, 22*mm]
    ))
    story.append(Spacer(1, 5*mm))

    heading("المتغيرات الاختيارية", level=2, story=story, toc_level=1)
    optional_vars = [
        ["NEXT_PUBLIC_SITE_URL", "public", "رابط الموقع العام للإنتاج", "https://elite-vip-shop.vercel.app"],
        ["NEXT_PUBLIC_WHATSAPP_NUMBER", "public", "رقم واتساب للتواصل", "967782138587"],
        ["NEXT_PUBLIC_TELEGRAM_LINK", "public", "رابط قناة تيليجرام", "https://t.me/tariq77087"],
        ["NEXT_PUBLIC_CONTACT_EMAIL", "public", "بريد التواصل", "tariq770871@gmail.com"],
        ["NEXT_PUBLIC_FACEBOOK_LINK", "public", "رابط فيسبوك", "https://facebook.com/..."],
        ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "public", "معرّف Google Analytics 4", "G-XXXXXXXXXX"],
        ["NEXT_PUBLIC_GSC_VERIFICATION", "public", "كود التحقق من Google Search Console", "google-site-verification=..."],
        ["TELEGRAM_BOT_TOKEN", "server", "رمز بوت تيليجرام للإشعارات", "123456:ABC-DEF..."],
        ["TELEGRAM_CHAT_ID", "server", "معرّف محادثة الإدارة في تيليجرام", "-1001234567890"],
        ["SUPABASE_DB_PASSWORD", "server", "كلمة مرور DB للاتصال المباشر بـ PostgreSQL", "********"],
    ]
    story.append(data_table(
        ["المتغير", "النوع", "الوصف", "مثال"],
        optional_vars,
        col_widths=[55*mm, 18*mm, CONTENT_W - 113*mm, 22*mm]
    ))
    story.append(Spacer(1, 6*mm))

    heading("آلية التحقق", level=2, story=story, toc_level=1)
    body_para(
        "دالة <font face='Mono'>validateEnv()</font> في <font face='Mono'>"
        "src/lib/env.ts</font> تفحص كل المتغيرات عند بدء التشغيل. في وضع "
        "التطوير تطبع تحذيرات في console للمتغيرات الإلزامية المفقودة، أما "
        "في الإنتاج فتطبع أخطاء حرجة. كما تتحقق من أن المتغيرات server-only "
        "ليست مسبوقة بـ <font face='Mono'>NEXT_PUBLIC_</font> بالخطأ (مما "
        "يكشفها للمتصفح).",
        story
    )

    story.extend(code_block_split(
        '// src/lib/env.ts (نمط التحقق)\n'
        'export function validateEnv() {\n'
        '  const missing = [];\n'
        '  const warnings = [];\n'
        '\n'
        '  for (const varDef of ENV_SCHEMA) {\n'
        '    const value = process.env[varDef.name];\n'
        '    if (!value || value === "") {\n'
        '      if (varDef.required) {\n'
        '        missing.push(varDef.name);\n'
        '      } else {\n'
        '        warnings.push(`${varDef.name} — ${varDef.description}`);\n'
        '      }\n'
        '    }\n'
        '    // Warn if server-only var has NEXT_PUBLIC_ prefix\n'
        '    if (!varDef.public && varDef.name.startsWith("NEXT_PUBLIC_")) {\n'
        '      warnings.push(`${varDef.name} is server-only but has NEXT_PUBLIC_ prefix`);\n'
        '    }\n'
        '  }\n'
        '\n'
        '  return { valid: missing.length === 0, missing, warnings };\n'
        '}',
        max_lines=22
    ))

    story.append(callout(
        "خلاصة التقرير",
        "منصة Elite VIP Shop في إصدارها v0.2.0 تعتبر <b>مستقرة وقابلة "
        "للنشر</b> بعد إصلاح 182 مشكلة عبر دورة تدقيق شاملة. البنية "
        "المعمارية سليمة، الأمان مُطبّق على ثلاث طبقات، والكود خالٍ من "
        "أي نوع any. الخطوة التالية المنطقية هي إضافة اختبارات آمية "
        "ونظام مراقبة للإنتاج لضمان الاستدامة طويلة المدى.",
        kind="success"
    ))
