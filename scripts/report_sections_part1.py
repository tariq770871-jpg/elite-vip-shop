# -*- coding: utf-8 -*-
"""
Elite VIP Shop Report — Content Sections
Part 2 of generate_project_report.py
Imported by the main script.
"""

from reportlab.platypus import (
    Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether,
    HRFlowable, ListFlowable, ListItem
)
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT

from generate_project_report import (
    STYLES, CONTENT_W, ACCENT_GOLD, CARD_BG, BORDER, TEXT_PRIMARY,
    TEXT_MUTED, HEADER_FILL, TEXT_LIGHT, SUCCESS, WARNING, DANGER, INFO,
    PAGE_W, SECTION_BG_DARK,
    GoldDivider, StatCard, stat_row, callout, code_block, code_block_split, data_table,
    heading, body_para, bullet_list, ar, ar_para,
)


# ═══════════════════════════════════════════════════════════════════
#  Section 1: Executive Summary (القسم الأول — الملخص التنفيذي)
# ═══════════════════════════════════════════════════════════════════
def section_executive_summary(story):
    heading("الملخص التنفيذي", level=1, story=story, toc_level=0)

    body_para(
        "هذا التقرير يوثّق منصة <b>Elite VIP Shop</b> (متجر النخبة) — منصة تجارة "
        "إلكترونية يمنية متكاملة تعمل بإصدارها الحالي <b>v0.2.0</b>، ومبنية على "
        "تقنيات حديثة تشمل Next.js 16 (App Router)، React 19، TypeScript 5، "
        "Supabase (قاعدة بيانات + مصادقة)، و Telegram Bot للإشعارات الإدارية. "
        "تم تصميم المنصة لخدمة السوق اليمني مع دعم كامل للغة العربية واتجاه RTL، "
        "ودمج وسائل دفع محلية مثل جيب وجوالي وسلطيف.",
        story
    )

    body_para(
        "تم خلال دورة التطوير الحالية إجراء <b>تدقيق أمني وجودة شامل</b> نتج عنه "
        "إصلاح <b>182 مشكلة</b> موزّعة على عشر مجموعات عمل: 136 مشكلة أُصلحت في "
        "المجموعات 1-9، ثم 46 مشكلة إضافية في الجولة الثالثة من المجموعة العاشرة. "
        "تشمل الإصلاحات أخطاء أمنية حرجة (إزالة نجاحات وهمية في APIs)، استبدال "
        "جميع أنواع <font face='Mono'>any</font> بأنواع TypeScript صحيحة، مركزية "
        "الثوابت والقيم المصلّبة، وتوحيد الأنماط المتكررة في دوال مشتركة.",
        story
    )

    heading("المؤشرات الرئيسية", level=2, story=story, toc_level=1)
    story.append(stat_row([
        ("182", "إجمالي المشاكل المُصلَحة"),
        ("10", "مجموعات العمل"),
        ("14", "نقاط API"),
        ("22+", "ملفات معدّلة"),
    ]))
    story.append(Spacer(1, 8*mm))

    heading("التقنيات الأساسية", level=2, story=story, toc_level=1)
    tech_data = [
        ["Next.js 16", "إطار العمل الأساسي", "App Router + Server Components"],
        ["React 19", "مكتبة الواجهة", "Concurrent features + Actions"],
        ["TypeScript 5", "لغة البرمجة", "Static typing + strict mode"],
        ["Supabase", "قاعدة البيانات + المصادقة", "PostgreSQL + Auth + RLS"],
        ["Tailwind CSS 4", "التصميم", "Utility-first + JIT"],
        ["Zustand 5", "إدارة الحالة", "Client state + persist"],
        ["Zod 4", "التحقق من البيانات", "Schema validation"],
    ]
    story.append(data_table(
        ["التقنية", "الدور", "الملاحظات"],
        tech_data,
        col_widths=[42*mm, 55*mm, CONTENT_W - 97*mm]
    ))
    story.append(Spacer(1, 6*mm))

    callout(
        "ملاحظة للذكاء الاصطناعي المحلِّل",
        "هذا التقرير مصمَّم خصيصاً ليكون غنياً بالمعلومات التقنية الدقيقة "
        "(أسماء ملفات، مسارات API، بنية الجداول، أكواد فعلية) بحيث يمكن "
        "لأداة الذكاء الاصطناعي تحليل البنية المعمارية، اكتشاف الأنماط، "
        "اقتراح تحسينات، أو توليد توثيق إضافي بناءً على المحتوى.",
        kind="gold"
    )
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 2: Project Overview (نظرة عامة على المشروع)
# ═══════════════════════════════════════════════════════════════════
def section_project_overview(story):
    heading("نظرة عامة على المشروع", level=1, story=story, toc_level=0)

    heading("الهدف والرسالة", level=2, story=story, toc_level=1)
    body_para(
        "تأسست منصة Elite VIP Shop بهدف توفير <b>وجهة يمنية موحّدة</b> للتجارة "
        "الإلكترونية والخدمات الرقمية، تجمع تحت سقف واحد بين المتجر التقليدي "
        "للمنتجات المادية، وسوق التطبيقات والأدوات الرقمية، والخدمات المهنية "
        "مثل التسويق الرقمي وتصميم المواقع، بالإضافة إلى محتوى تعليمي مدفوع "
        "يتعلق بالتداول والربح من الإنترنت. تستهدف المنصة بشكل رئيسي المستخدم "
        "العربي في اليمن والخليج، مع التركيز على تجربة استخدام سلسة عبر "
        "الهاتف المحمول ودعم كامل للغة العربية واتجاه RTL.",
        story
    )

    body_para(
        "تتميز المنصة بدمجها لـ <b>وسائل دفع محلية</b> لم تكن مدعومة عادةً في "
        "المنصات العالمية، مثل محفظة جيب (Jeeb)، جوالي (Jawaly)، ايزي فلوسك "
        "(Easy Fulusk)، وسلطيف (Saltef)، إلى جانب الحوالات البنكية المحلية. "
        "كما تتكامل مع واتساب وتيليجرام لتسهيل التواصل المباشر مع العملاء "
        "وإرسال إشعارات الطلبات للإدارة في الوقت الفعلي.",
        story
    )

    heading("الجمهور المستهدف ونموذج الأدوار", level=2, story=story, toc_level=1)
    body_para(
        "تعتمد المنصة نموذج أدوار متدرّج الصلاحيات يتكون من خمسة مستويات، "
        "يبدأ من الزائر غير المسجّل وينتهي بمالك المنصة. كل دور له صلاحيات "
        "مختلفة في الوصول للصفحات، نقاط API، وعمليات قاعدة البيانات، مع "
        "تطبيق ذلك على مستويين: الـ <font face='Mono'>middleware</font> "
        "(حماية المسارات) ونقاط API (التحقق من الإذن قبل التنفيذ).",
        story
    )

    roles_data = [
        ["visitor", "زائر", "تصفّح المنتجات، البحث، قراءة المدونة", "لا"],
        ["user", "مستخدم مسجّل", "كل ما سبق + سلة، قائمة أمنيات، طلبات، ملف", "نعم"],
        ["seller", "بائع", "إضافة منتجات، استلام طلبات منتجاته، تقارير المبيعات", "نعم"],
        ["admin", "مدير", "إدارة المستخدمين، الطلبات، المنتجات، الكوبونات", "نعم"],
        ["owner", "مالك", "كل صلاحيات المدير + الوصول الكامل للوحة التحكم", "نعم"],
    ]
    story.append(data_table(
        ["الدور (role_name)", "الاسم", "الصلاحيات الرئيسية", "مطلوب تسجيل دخول"],
        roles_data,
        col_widths=[30*mm, 22*mm, CONTENT_W - 95*mm, 23*mm]
    ))
    story.append(Spacer(1, 6*mm))

    heading("الميزات الرئيسية", level=2, story=story, toc_level=1)
    bullet_list([
        ("متجر منتجات متكامل", "تصفّح حسب الفئات، بحث، فلترة، تفاصيل المنتج، مراجعات، أسعار مخفّضة، حالات توفر"),
        ("سلة تسوّق ذكية", "إضافة/حذف، تعديل الكمية، حساب السعر الفعلي مع الخصومات، كوبونات تخفيض"),
        ("نظام طلبات متقدم", "طلب عبر الموقع أو واتساب، اختيار التوصيل أو الاستلام، عناوين تفصيلية (محافظة/مديرية/شارع/معلم)"),
        ("نظام مصادقة كامل", "تسجيل، دخول، استعادة كلمة المرور، أدوار متعددة، حماية middleware"),
        ("لوحة تحكم إدارية", "إدارة المنتجات، الطلبات، المستخدمين، الكوبونات، إحصائيات سريعة"),
        ("PWA قابل للتثبيت", "Service Worker، manifest.json، صفحة أوفلاين، أيقونات متعددة الأحجام"),
        ("مدونة محتوى", "6 مقالات ثابتة (تسويق رقمي، تجارة إلكترونية، ربح، تداول، AI، تصميم)"),
        ("تحسين محركات البحث", "بيانات منظمة JSON-LD،sitemap.xml، robots.ts، Open Graph، metadata ديناميكي"),
        ("إشعارات تيليجرام", "إرسال تلقائي لإشعار عند كل طلب جديد إلى قناة الإدارة"),
        ("تعدد وسائل الدفع", "7 خيارات دفع محلية وعالمية مع أسماء عربية موحّدة"),
    ], story=story)
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 3: Tech Stack (البنية التقنية)
# ═══════════════════════════════════════════════════════════════════
def section_tech_stack(story):
    heading("البنية التقنية والتقنيات", level=1, story=story, toc_level=0)

    body_para(
        "بُنيت المنصة على مجموعة تقنيات حديثة ومختارة بعناية لضمان الأداء، "
        "الأمان، وسهولة الصيانة. يعتمد الاختيار على مبدأ <b>البساطة العملية</b> "
        "— استخدام أقل عدد ممكن من المكتبات مع تحقيق أقصى استفادة من كل واحدة. "
        "كل تقنية لها دور محدد وواضح، ولا توجد تداخلات وظيفية بين المكتبات.",
        story
    )

    heading("التقنيات الأساسية (Dependencies)", level=2, story=story, toc_level=1)
    deps_data = [
        ["next ^16.1.1", "إطار العمل", "App Router, Server Components, Route Handlers, SSG/ISR"],
        ["react ^19.0.0", "الواجهة", "Hooks, Concurrent Features, Server Actions"],
        ["typescript ^5", "اللغة", "Strict typing, generics, utility types"],
        ["@supabase/ssr ^0.10.3", "المصادقة SSR", "إدارة الجلسات عبر cookies"],
        ["@supabase/supabase-js ^2.105", "عميل قاعدة البيانات", "Queries, RLS, Realtime"],
        ["tailwindcss ^4", "التصميم", "Utility classes, JIT compilation"],
        ["zustand ^5.0.6", "إدارة الحالة", "Client stores with persist middleware"],
        ["zod ^4.4.3", "التحقق", "Schema validation للنماذج وAPIs"],
        ["react-hook-form ^7.75", "النماذج", "Performance forms + resolver zod"],
        ["recharts ^2.15.4", "الرسوم البيانية", "لوحة التحكم الإدارية"],
        ["lucide-react ^0.525", "الأيقونات", "أكثر من 1000 أيقونة SVG"],
        ["@radix-ui/*", "مكوّنات UI", "30+ مكوّن accessible (dialog, dropdown, ...)"],
        ["sonner ^2.0.7", "الإشعارات", "Toast notifications"],
        ["next-themes ^0.4.6", "السمات", "Dark/Light mode switching"],
        ["vaul ^1.1.2", "Drawer", "Cart drawer, mobile menus"],
        ["isomorphic-dompurify", "الأمان", "XSS prevention في المحتوى"],
        ["class-variance-authority", "الأصناف", "Variant management للمكوّنات"],
        ["@vercel/analytics", "التحليلات", "Web Vitals tracking"],
    ]
    story.append(data_table(
        ["الحزمة", "الدور", "الاستخدام"],
        deps_data,
        col_widths=[44*mm, 28*mm, CONTENT_W - 72*mm]
    ))
    story.append(Spacer(1, 6*mm))

    heading("التقنيات المساعدة (DevDependencies)", level=2, story=story, toc_level=1)
    dev_data = [
        ["@tailwindcss/postcss ^4", "معالجة CSS", "PostCSS plugin لـ Tailwind 4"],
        ["eslint ^9 + eslint-config-next", "فحص الكود", "Linting + قواعد Next.js"],
        ["bun-types ^1.3.4", "أنواع Bun", "TypeScript definitions"],
        ["@types/react ^19 + @types/react-dom", "أنواع React", "Type safety لـ React 19"],
        ["tw-animate-css ^1.3.5", "الحركات", "CSS animations للأجزاء المتحركة"],
    ]
    story.append(data_table(
        ["الحزمة", "الدور", "الملاحظات"],
        dev_data,
        col_widths=[55*mm, 35*mm, CONTENT_W - 90*mm]
    ))
    story.append(Spacer(1, 6*mm))

    heading("إصدار Node والمكتبات", level=2, story=story, toc_level=1)
    body_para(
        "يستخدم المشروع <b>Bun</b> كمدير حزم أساسي (ملف <font face='Mono'>"
        "bun.lock</font>)، مع توافق كامل مع npm. الإصدار الحالي للمنصة هو "
        "<b>v0.2.0</b> كما هو موثّق في <font face='Mono'>package.json</font>. "
        "البناء يتم عبر <font face='Mono'>next build</font> مع نسخ الملفات "
        "الثابتة إلى مجلد <font face='Mono'>standalone</font> للنشر على Vercel.",
        story
    )

    story.extend(code_block_split(
        '// package.json — scripts section\n'
        '{\n'
        '  "scripts": {\n'
        '    "dev": "next dev -p 3000",\n'
        '    "build": "next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/",\n'
        '    "start": "NODE_ENV=production node .next/standalone/server.js",\n'
        '    "lint": "eslint ."\n'
        '  }\n'
        '}',
        max_lines=20
    ))
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 4: Project Structure (هيكل المشروع)
# ═══════════════════════════════════════════════════════════════════
def section_project_structure(story):
    heading("هيكل المشروع", level=1, story=story, toc_level=0)

    body_para(
        "يتبع المشروع بنية <b>App Router</b> القياسية في Next.js 16، مع فصل "
        "واضح بين صفحات التطبيق، نقاط API، المكوّنات، الدوال المساعدة، "
        "وإدارة الحالة. كل مجلد له مسؤولية محددة وواضحة، مما يسهّل التنقل "
        "والصيانة. تمت مركزية الثوابت والأنواع في ملفات منفصلة "
        "(<font face='Mono'>constants.ts</font> و <font face='Mono'>types/db.ts"
        "</font>) لضمان مصدر واحد للحقيقة.",
        story
    )

    heading("المجلدات الرئيسية", level=2, story=story, toc_level=1)
    structure_data = [
        ["src/app/", "الصفحات + نقاط API", "App Router: pages, layouts, route handlers"],
        ["src/app/api/", "نقاط API (14 route)", "REST endpoints للعمليات server-side"],
        ["src/app/api/admin/", "APIs الإدارة (3 routes)", "products, users, orders — محمية بـ middleware"],
        ["src/components/", "مكوّنات React", "30+ مكوّن رئيسي (navbar, footer, sections)"],
        ["src/components/ui/", "مكوّنات UI أساسية", "40+ مكوّن مبني على Radix UI"],
        ["src/components/sections/", "أقسام الصفحات", "28 قسم (home, products, cart, ...)"],
        ["src/lib/", "الدوال المساعدة", "12 ملف (auth, supabase, telegram, utils, env, ...)"],
        ["src/store/", "متاجر Zustand", "5 متاجر (auth, cart, wishlist, notifications, recently-viewed)"],
        ["src/types/", "تعريفات الأنواع", "db.ts — واجهات Supabase المركزية"],
        ["src/hooks/", "React Hooks", "use-toast, use-mobile"],
        ["public/", "الأصول الثابتة", "أيقونات، صور منتجات، manifest.json, sw.js"],
        ["scripts/", "سكريبتات الهجرة", "SQL migrations, run-migration.js"],
        ["supabase-migrations/", "ملفات SQL", "4 ملفات هجرة لقاعدة البيانات"],
        ["mini-services/telegram-bot/", "بوت تيليجرام", "منفصل عن Next.js — يعمل بشكل مستقل"],
    ]
    story.append(data_table(
        ["المسار", "الاسم", "المحتوى"],
        structure_data,
        col_widths=[55*mm, 35*mm, CONTENT_W - 90*mm]
    ))
    story.append(Spacer(1, 6*mm))

    heading("شجرة المجلدات المبسّطة", level=2, story=story, toc_level=1)
    story.extend(code_block_split(
        'elite-vip-shop/\n'
        '├── src/\n'
        '│   ├── app/\n'
        '│   │   ├── api/                    # 14 route handler\n'
        '│   │   │   ├── admin/              # 3 admin routes (محمية)\n'
        '│   │   │   ├── auth/role/\n'
        '│   │   │   ├── orders/             # GET + POST\n'
        '│   │   │   ├── coupons/\n'
        '│   │   │   ├── reviews/\n'
        '│   │   │   ├── contact/\n'
        '│   │   │   ├── notify/\n'
        '│   │   │   ├── telegram/\n'
        '│   │   │   ├── migrate/            # محظور في الإنتاج\n'
        '│   │   │   ├── migrate-db/         # محظور في الإنتاج\n'
        '│   │   │   └── health/             # فحص صحة شامل\n'
        '│   │   ├── product/[id]/           # SSG عبر generateStaticParams\n'
        '│   │   ├── blog/[slug]/            # مقالات ثابتة\n'
        '│   │   ├── dashboard/              # محمي — admin/owner فقط\n'
        '│   │   ├── orders/, cart/, profile/, wishlist/  # محمية\n'
        '│   │   ├── login/, register/, forgot-password/\n'
        '│   │   ├── offline/                # صفحة PWA أوفلاين\n'
        '│   │   ├── layout.tsx              # Root layout + metadata\n'
        '│   │   ├── page.tsx                # الصفحة الرئيسية\n'
        '│   │   ├── robots.ts               # robots.txt\n'
        '│   │   └── sitemap.ts              # sitemap.xml\n'
        '│   ├── components/\n'
        '│   │   ├── ui/                     # 40+ Radix UI components\n'
        '│   │   ├── sections/               # 28 قسم صفحة\n'
        '│   │   ├── layout-client.tsx       # Layout shell (client)\n'
        '│   │   ├── navbar.tsx, footer.tsx\n'
        '│   │   ├── cart-drawer.tsx, order-modal.tsx\n'
        '│   │   ├── admin-route.tsx, protected-route.tsx\n'
        '│   │   └── ...\n'
        '│   ├── lib/\n'
        '│   │   ├── site-config.ts          # مصدر واحد للثوابت\n'
        '│   │   ├── constants.ts            # MAX_QTY, gold colors, order statuses\n'
        '│   │   ├── env.ts                  # تحقق متغيرات البيئة\n'
        '│   │   ├── supabase.ts             # عميل المتصفح\n'
        '│   │   ├── supabase-server.ts      # عميل الخادم + service role\n'
        '│   │   ├── supabase-data.ts        # دوال queries + cache\n'
        '│   │   ├── admin-auth.ts           # verifyAdmin\n'
        '│   │   ├── api-auth.ts             # getAuthHeaders + authFetch\n'
        '│   │   ├── telegram.ts             # إشعارات تيليجرام\n'
        '│   │   ├── rate-limit.ts           # في الذاكرة rate limiter\n'
        '│   │   ├── utils.ts                # cn, escapeHtml, safeJsonLd...\n'
        '│   │   ├── mock-data.ts            # بيانات تجريبية\n'
        '│   │   └── blog-data.ts, navigation.ts\n'
        '│   ├── store/                      # Zustand stores\n'
        '│   │   ├── auth-store.ts\n'
        '│   │   ├── cart-store.ts\n'
        '│   │   ├── wishlist-store.ts\n'
        '│   │   ├── notification-store.ts\n'
        '│   │   └── recently-viewed-store.ts\n'
        '│   ├── types/db.ts                 # واجهات Supabase المركزية\n'
        '│   ├── hooks/                      # use-toast, use-mobile\n'
        '│   └── middleware.ts               # حماية المسارات\n'
        '├── public/                         # أصول ثابتة\n'
        '│   ├── icons/, products/, images/blog/\n'
        '│   ├── manifest.json, sw.js, logo.svg\n'
        '├── scripts/                        # سكريبتات الهجرة\n'
        '├── supabase-migrations/            # 4 ملفات SQL\n'
        '├── mini-services/telegram-bot/     # بوت مستقل\n'
        '├── package.json, tsconfig.json, tailwind.config.ts\n'
        '├── next.config.ts, eslint.config.mjs, components.json\n'
        '└── Caddyfile                       # reverse proxy config',
        max_lines=30
    ))
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 5: Auth & Permissions (المصادقة والصلاحيات)
# ═══════════════════════════════════════════════════════════════════
def section_auth_permissions(story):
    heading("نموذج المصادقة والصلاحيات", level=1, story=story, toc_level=0)

    body_para(
        "يعتمد نظام المصادقة في المنصة على <b>Supabase Auth</b> كخدمة أساسية، "
        "مع طبقة حماية إضافية مبنية على <font face='Mono'>middleware.ts</font> "
        "للتحقق من الجلسات وحماية المسارات الحساسة. يتم تخزين رمز الوصول "
        "(access token) في cookies عبر <font face='Mono'>@supabase/ssr</font>، "
        "ويُرسل تلقائياً مع كل طلب HTTP عبر الدالة المساعدة <font face='Mono'>"
        "authFetch()</font> الموجودة في <font face='Mono'>src/lib/api-auth.ts"
        "</font>.",
        story
    )

    heading("طبقات الحماية", level=2, story=story, toc_level=1)
    bullet_list([
        ("الطبقة 1 — Middleware", "تحديث جلسة Supabase على كل طلب + حماية /api/admin/* و /dashboard"),
        ("الطبقة 2 — verifyAdmin()", "تحقق إضافي في كل API route إدارية + فحص الدور"),
        ("الطبقة 3 — RLS Policies", "Row Level Security على مستوى قاعدة البيانات في Supabase"),
        ("الطبقة 4 — Type Safety", "أنواع TypeScript صارمة تمنع تمرير بيانات غير متوقعة"),
    ], story=story)

    heading("آلية العمل التفصيلية", level=2, story=story, toc_level=1)
    body_para(
        "عند استلام أي طلب لمسار <font face='Mono'>/api/admin/*</font>، يقوم "
        "الـ middleware بخطوات متسلسلة: استخراج رمز الوصول من header "
        "(<font face='Mono'>Authorization: Bearer ...</font>) أو من cookies، "
        "ثم التحقق منه عبر <font face='Mono'>supabaseAdmin.auth.getUser(token)"
        "</font> باستخدام service role key. بعد التحقق من صحة المستخدم، يتم "
        "الاستعلام عن جدول <font face='Mono'>profiles</font> (العمود "
        "<font face='Mono'>is_admin</font>) أولاً، فإن لم يكن admin ينتقل "
        "لجدول <font face='Mono'>users</font> مع join على جدول "
        "<font face='Mono'>roles</font> للتحقق من <font face='Mono'>role_name"
        "</font>.",
        story
    )

    callout(
        "ملاحظة مهمة حول الدور owner",
        "خلال التدقيق، اكتُشف أن الـ middleware يتحقق من 'admin' فقط بينما "
        "المكوّن <font face='Mono'>AdminRoute</font> يقبل 'admin' و 'owner'. "
        "تمّ توحيد المنطق ليقبل الـ middleware كلا الدورين، مما يضمن وصول "
        "المالك للوحة التحكم دون مشاكل.",
        kind="warning"
    )

    heading("الكود الفعلي — دالة verifyAdmin", level=2, story=story, toc_level=1)
    story.extend(code_block_split(
        '// src/lib/admin-auth.ts (مختصر)\n'
        'export async function verifyAdmin(request: Request) {\n'
        '  const { user, error: authError } = await verifyAuthToken(request);\n'
        '  if (authError || !user) {\n'
        '    return { user: null,\n'
        '      errorResponse: NextResponse.json({error: "غير مصرح"}, {status: 401}) };\n'
        '  }\n'
        '\n'
        '  const serviceClient = getSupabaseServiceClient();\n'
        '  if (!serviceClient) {\n'
        '    return { user: null,\n'
        '      errorResponse: NextResponse.json({error: "خدمة غير متاحة"}, {status: 503}) };\n'
        '  }\n'
        '\n'
        '  // 1) profiles table (new schema)\n'
        '  const { data: profile } = await serviceClient\n'
        '    .from("profiles").select("is_admin")\n'
        '    .eq("user_id", user.id).single();\n'
        '\n'
        '  if (profile?.is_admin === true) {\n'
        '    return { user, errorResponse: null };\n'
        '  }\n'
        '\n'
        '  // 2) users+roles tables (legacy schema)\n'
        '  const { data: legacyProfile } = await serviceClient\n'
        '    .from("users").select("role_id, roles(role_name)")\n'
        '    .eq("email", user.email).single();\n'
        '\n'
        '  const roleName = extractRoleName(legacyProfile?.roles);\n'
        '  if (roleName === "admin" || roleName === "owner") {\n'
        '    return { user, errorResponse: null };\n'
        '  }\n'
        '\n'
        '  return { user: null,\n'
        '    errorResponse: NextResponse.json({error: "صلاحيات غير كافية"}, {status: 403}) };\n'
        '}',
        max_lines=30
    ))

    heading("المسارات المحمية", level=2, story=story, toc_level=1)
    protected_data = [
        ["/api/admin/*", "middleware", "401 + 403", "كل APIs الإدارة"],
        ["/dashboard/*", "middleware", "redirect to /login", "لوحة التحكم الإدارية"],
        ["/orders", "verifyAuthToken", "401", "قائمة طلبات المستخدم"],
        ["/cart", "session check", "redirect", "سلة التسوّق"],
        ["/profile", "session check", "redirect", "ملف المستخدم"],
        ["/api/orders (POST)", "verifyAuthToken", "401", "إنشاء طلب جديد"],
        ["/api/auth/role", "verifyAuthToken", "401", "جلب دور المستخدم"],
    ]
    story.append(data_table(
        ["المسار", "آلية الحماية", "الاستجابة عند الفشل", "الوصف"],
        protected_data,
        col_widths=[40*mm, 35*mm, 35*mm, CONTENT_W - 110*mm]
    ))
    story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════
#  Section 6: API Routes (نقاط API)
# ═══════════════════════════════════════════════════════════════════
def section_api_routes(story):
    heading("نقاط API (API Routes)", level=1, story=story, toc_level=0)

    body_para(
        "يوفر المشروع <b>14 نقطة API</b> موزّعة على ثلاث فئات: نقاط عامة "
        "(للزوار والمستخدمين)، نقاط مصادقة (تتطلب تسجيل دخول)، ونقاط إدارية "
        "(تتطلب صلاحيات admin/owner). كل نقطة مبنية باستخدام Next.js Route "
        "Handlers (App Router) وتتبع نمطاً موحّداً للتعامل مع الأخطاء، "
        "التحقق من المدخلات، والاستجابة بصيغة JSON.",
        story
    )

    heading("نقاط API العامة", level=2, story=story, toc_level=1)
    public_apis = [
        ["/api/health", "GET", "لا", "فحص صحة شامل — يتحقق من البيئة، DB، الـ service role"],
        ["/api/contact", "POST", "rate limit", "إرسال رسالة تواصل + إشعار تيليجرام"],
        ["/api/notify", "GET", "rate limit", "جلب آخر الإشعارات (في الذاكرة)"],
        ["/api/telegram", "POST", "CORS + secret", "تكوين بوت تيليجرام"],
        ["/api/reviews", "GET", "لا", "جلب مراجعات منتج معتمدة"],
        ["/api/reviews", "POST", "verifyAuthToken", "إضافة مراجعة جديدة (تنتظر الموافقة)"],
        ["/api/coupons", "POST", "rate limit", "التحقق من صحة كوبون قبل الطلب"],
    ]
    story.append(data_table(
        ["المسار", "الطريقة", "الحماية", "الوظيفة"],
        public_apis,
        col_widths=[35*mm, 18*mm, 30*mm, CONTENT_W - 83*mm]
    ))
    story.append(Spacer(1, 5*mm))

    heading("نقاط API المصادقة", level=2, story=story, toc_level=1)
    auth_apis = [
        ["/api/auth/role", "GET", "verifyAuthToken", "جلب دور المستخدم المسجّل"],
        ["/api/orders", "GET", "verifyAuthToken", "جلب طلبات المستخدم الحالي"],
        ["/api/orders", "POST", "verifyAuthToken + rate limit", "إنشاء طلب جديد + إشعار تيليجرام"],
    ]
    story.append(data_table(
        ["المسار", "الطريقة", "الحماية", "الوظيفة"],
        auth_apis,
        col_widths=[35*mm, 18*mm, 45*mm, CONTENT_W - 98*mm]
    ))
    story.append(Spacer(1, 5*mm))

    heading("نقاط API الإدارية (محمية بـ middleware)", level=2, story=story, toc_level=1)
    admin_apis = [
        ["/api/admin/users", "GET", "جلب قائمة المستخدمين مع الأدوار"],
        ["/api/admin/users", "PATCH", "تحديث بيانات مستخدم (name, phone, role, active)"],
        ["/api/admin/users", "DELETE", "حذف مستخدم"],
        ["/api/admin/orders", "GET", "جلب كل الطلبات مع تفاصيل العميل"],
        ["/api/admin/orders", "PATCH", "تحديث حالة طلب"],
        ["/api/admin/products", "GET", "جلب كل المنتجات للإدارة"],
    ]
    story.append(data_table(
        ["المسار", "الطريقة", "الوظيفة"],
        admin_apis,
        col_widths=[55*mm, 22*mm, CONTENT_W - 77*mm]
    ))
    story.append(Spacer(1, 5*mm))

    heading("نقاط API للهجرة (محظورة في الإنتاج)", level=2, story=story, toc_level=1)
    body_para(
        "هاتان النقطتان تستخدمان لإدارة ترحيل قاعدة البيانات وتطبيق تغييرات "
        "الـ schema. تم حظرهما تماماً في بيئة الإنتاج عبر فحص "
        "<font face='Mono'>process.env.NODE_ENV === 'production'</font>، مع "
        "استجابة 403 صريحة. لا يمكن الوصول إليهما إلا في بيئة التطوير أو عبر "
        "service role key مباشرة من Supabase Studio.",
        story
    )
    migrate_apis = [
        ["/api/migrate", "POST", "Node pg client", "تطبيق هجرات SQL عبر pg مباشرة"],
        ["/api/migrate-db", "POST", "Supabase service", "تطبيق هجرات عبر Supabase JS client"],
    ]
    story.append(data_table(
        ["المسار", "الطريقة", "الطريقة", "الوصف"],
        migrate_apis,
        col_widths=[42*mm, 22*mm, 35*mm, CONTENT_W - 99*mm]
    ))
    story.append(Spacer(1, 6*mm))

    callout(
        "نمط موحّد للاستجابة بالأخطاء",
        "بعد التدقيق، تم توحيد كل نقاط API لترجع <b>خطأ 503 حقيقياً</b> عند "
        "عدم توفّر قاعدة البيانات، بدلاً من إرجاع نجاح وهمي ببيانات فارغة. "
        "هذا يضمن أن العميل يعرف بوجود مشكلة ويتعامل معها بدلاً من عرض "
        "بيانات مضلّلة. كل الأخطاء ترجع بصيغة: "
        "<font face='Mono'>{ error: \"رسالة عربية\" }</font> مع HTTP status مناسب.",
        kind="success"
    )
    story.append(PageBreak())
