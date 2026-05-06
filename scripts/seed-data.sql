-- ============================================================
-- ELITE VIP SHOP - SEED DATA
-- Initial data for roles, categories, products, apps, etc.
-- ============================================================

-- ============================================================
-- 1. ROLES (الأدوار)
-- ============================================================
INSERT INTO public.roles (role_id, role_name, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'مدير النظام - صلاحيات كاملة'),
  ('a0000000-0000-0000-0000-000000000002', 'seller', 'بائع - إضافة وإدارة المنتجات'),
  ('a0000000-0000-0000-0000-000000000003', 'user', 'مستخدم عادي - تسوق وشراء'),
  ('a0000000-0000-0000-0000-000000000004', 'visitor', 'زائر - تصفح فقط')
ON CONFLICT (role_id) DO UPDATE SET description = EXCLUDED.description;

-- ============================================================
-- 2. CATEGORIES (التصنيفات)
-- ============================================================
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('إلكترونيات', 'electronics', 'Monitor', 1),
  ('برامج وتطبيقات', 'software-apps', 'Code', 2),
  ('خدمات رقمية', 'digital-services', 'Globe', 3),
  ('ملابس وإكسسوارات', 'fashion', 'Shirt', 4),
  ('أدوات ومعدات', 'tools', 'Wrench', 5),
  ('كتب ودورات', 'books-courses', 'BookOpen', 6),
  ('أخرى', 'other', 'Package', 7)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 3. ADMIN USER (مدير النظام)
-- ============================================================
INSERT INTO public.users (user_id, name, email, role_id, is_active) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'مدير النخبة', 'admin@elitevip.com', 'a0000000-0000-0000-0000-000000000001', TRUE)
ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================
-- 4. PRODUCTS (المنتجات - 12 منتج)
-- ============================================================
INSERT INTO public.products (product_id, name, description, price, sale_price, category_id, availability, is_featured, sort_order) VALUES
  ('p0000001-0000-0000-0000-000000000001', 
   'سماعة بلوتوث فاخرة Elite Pro', 
   'سماعة لاسلكية بتقنية بلوتوث 5.3، صوت نقي مع إلغاء الضوضاء النشط، بطارية تدوم حتى 30 ساعة، تصميم أنيق ومريح.', 
   2500, 1899, 
   (SELECT category_id FROM public.categories WHERE slug = 'electronics'), 
   TRUE, TRUE, 1),

  ('p0000002-0000-0000-0000-000000000002', 
   'ساعة ذكية VIP Series X', 
   'ساعة ذكية بشاشة AMOLED، مراقبة صحية متقدمة، مقاومة للماء، تتبع GPS مدمج، بطارية تدوم 7 أيام.', 
   3500, NULL, 
   (SELECT category_id FROM public.categories WHERE slug = 'electronics'), 
   TRUE, TRUE, 2),

  ('p0000003-0000-0000-0000-000000000003', 
   'كورس التداول الاحترافي', 
   'دورة شاملة في تداول العملات والعملات الرقمية، تشمل أكثر من 50 درس فيديو، استراتيجيات متقدمة، ودعم مباشر.', 
   500, 299, 
   (SELECT category_id FROM public.categories WHERE slug = 'books-courses'), 
   TRUE, TRUE, 3),

  ('p0000004-0000-0000-0000-000000000004', 
   'بور شارجر سريع 65W', 
   'شاحن بور ديليفري سريع 65 واط، يدعم جميع الأجهزة، مع حماية متقدمة من الحرارة والتفريغ الزائد.', 
   450, 350, 
   (SELECT category_id FROM public.categories WHERE slug = 'electronics'), 
   TRUE, FALSE, 4),

  ('p0000005-0000-0000-0000-000000000005', 
   'اشتراك VPN Premium - سنة كاملة', 
   'اشتراك VPN سنة كامل، اتصال سريع ومستقر، أكثر من 50 دولة، لا سجلات، دعم جميع الأجهزة.', 
   1200, 799, 
   (SELECT category_id FROM public.categories WHERE slug = 'software-apps'), 
   TRUE, TRUE, 5),

  ('p0000006-0000-0000-0000-000000000006', 
   'حقيبة جلد طبيعي فاخرة', 
   'حقيبة من الجلد الطبيعي بتصميم كلاسيكي، مناسبة للعمل والسفر، مقاومة للماء، مع حماية للاب توب حتى 15 بوصة.', 
   1800, NULL, 
   (SELECT category_id FROM public.categories WHERE slug = 'fashion'), 
   TRUE, FALSE, 6),

  ('p0000007-0000-0000-0000-000000000007', 
   'ماوس لاسلكي ميكانيكي للجيمرز', 
   'ماوس ألعاب لاسلكي بمستشعر دقة 16000 DPI، أزرار قابلة للبرمجة، وزن قابل للتعديل، إضاءة RGB.', 
   650, 499, 
   (SELECT category_id FROM public.categories WHERE slug = 'electronics'), 
   TRUE, FALSE, 7),

  ('p0000008-0000-0000-0000-000000000008', 
   'حزمة أدوات التصميم الاحترافية', 
   'مجموعة كاملة من أدوات التصميم تشمل فرش مخصصة، قوالب، خطوط، وأيقونات للاستخدام التجاري.', 
   350, NULL, 
   (SELECT category_id FROM public.categories WHERE slug = 'software-apps'), 
   TRUE, FALSE, 8),

  ('p0000009-0000-0000-0000-000000000009', 
   'نظارات حماية للشاشات', 
   'نظارات بفلتر الأزرق لحماية العينين من إشعاع الشاشات، إطار خفيف ومريح للارتداء الطويل.', 
   280, NULL, 
   (SELECT category_id FROM public.categories WHERE slug = 'electronics'), 
   TRUE, FALSE, 9),

  ('p000000a-0000-0000-0000-000000000001', 
   'كتاب أسرار الربح من الإنترنت', 
   'دليل شامل يغطي أكثر من 20 طريقة مجربة للربح من الإنترنت، مع أمثلة حقيقية وخطط عمل مفصلة.', 
   150, 89, 
   (SELECT category_id FROM public.categories WHERE slug = 'books-courses'), 
   TRUE, FALSE, 10),

  ('p000000b-0000-0000-0000-000000000001', 
   'طقم أدوات متعددة الاستخدام', 
   'طقم 42 قطعة أدوات يدوية متعددة الاستخدامات، مصنوعة من الفولاذ المقاوم للصدأ، بحقيبة حمل متينة.', 
   890, 650, 
   (SELECT category_id FROM public.categories WHERE slug = 'tools'), 
   TRUE, FALSE, 11),

  ('p000000c-0000-0000-0000-000000000001', 
   'باور بانك 20000mAh', 
   'بطارية خارجية سعة 20000 مللي أمبير، شحن سريع 22.5W، يمكن شحن جهازين في نفس الوقت، شاشة LED.', 
   550, 399, 
   (SELECT category_id FROM public.categories WHERE slug = 'electronics'), 
   TRUE, TRUE, 12)
ON CONFLICT (product_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  category_id = EXCLUDED.category_id,
  availability = EXCLUDED.availability,
  is_featured = EXCLUDED.is_featured;

-- ============================================================
-- 5. APPS (التطبيقات - 6 تطبيقات)
-- ============================================================
INSERT INTO public.apps (app_id, title, description, platform, is_free, sort_order) VALUES
  ('app-0001-0000-0000-0000-0000000001', 'تطبيق إدارة المهام الذكية', 'تطبيق متقدم لإدارة المهام اليومية مع ذكاء اصطناعي لترتيب الأولويات وتذكيرات ذكية.', 'all', TRUE, 1),
  ('app-0002-0000-0000-0000-0000000002', 'محرر الصور الاحترافي', 'محرر صور قوي بفلتر احترافية وأدوات تعديل متقدمة، يعمل بدون إنترنت.', 'all', TRUE, 2),
  ('app-0003-0000-0000-0000-0000000003', 'تطبيق تعلم اللغات', 'تطبيق تفاعلي لتعلم اللغات بطريقة ممتعة مع دروس يومية وممارسة المحادثة.', 'all', TRUE, 3),
  ('app-0004-0000-0000-0000-0000000004', 'ماسح PDF متقدم', 'تطبيق لمسح المستندات وتحويلها إلى PDF عالي الجودة مع التعرف على النصوص OCR.', 'all', TRUE, 4),
  ('app-0005-0000-0000-0000-0000000005', 'تطبيق اللياقة البدنية', 'برنامج تمارين شخصي مع متتبع للتمارين والسعرات والماء، يشمل فيديوهات تعليمية.', 'all', TRUE, 5),
  ('app-0006-0000-0000-0000-0000000006', 'تطبيق الميزانية الشخصية', 'تطبيق لتنظيم المصاريف والميزانية مع رسوم بيانية وتقارير مفصلة.', 'all', TRUE, 6)
ON CONFLICT (app_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- ============================================================
-- 6. AI TOOLS (أدوات الذكاء الاصطناعي - 6 أدوات)
-- ============================================================
INSERT INTO public.ai_tools (tool_id, title, description, link, is_free, sort_order) VALUES
  ('ai-0001-0000-0000-0000-0000000001', 'ChatGPT - مساعد ذكي', 'أقوى مساعد ذكاء اصطناعي للدردشة والكتابة، يساعد في المحتوى والأكواد والأفكار.', 'https://chat.openai.com', TRUE, 1),
  ('ai-0002-0000-0000-0000-0000000002', 'Midjourney - توليد الصور', 'أداة لإنشاء صور فنية مذهلة باستخدام الذكاء الاصطناعي من وصف نصي.', 'https://midjourney.com', FALSE, 2),
  ('ai-0003-0000-0000-0000-0000000003', 'Canva AI - التصميم الذكي', 'منصة تصميم مجانية مع أدوات ذكاء اصطناعي لإنشاء تصاميم احترافية بسهولة.', 'https://canva.com', TRUE, 3),
  ('ai-0004-0000-0000-0000-0000000004', 'Gamma AI - عروض تقديمية', 'إنشاء عروض تقديمية ومواقع ويب احترافية بالذكاء الاصطناعي في ثوانٍ.', 'https://gamma.app', TRUE, 4),
  ('ai-0005-0000-0000-0000-0000000005', 'Notion AI - إدارة المعرفة', 'أداة متكاملة لإدارة الملاحظات والمشاريع مع مساعد ذكاء اصطناعي مدمج.', 'https://notion.so', TRUE, 5),
  ('ai-0006-0000-0000-0000-0000000006', 'ElevenLabs - توليد الأصوات', 'تحويل النص إلى كلام بشري طبيعي بأصوات متعددة اللغات.', 'https://elevenlabs.io', TRUE, 6)
ON CONFLICT (tool_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, link = EXCLUDED.link;

-- ============================================================
-- 7. ACADEMY COURSES (دورات الأكاديمية - 4 دورات)
-- ============================================================
INSERT INTO public.academy_courses (course_id, title, description, level, is_free, sort_order) VALUES
  ('acad-001-0000-0000-0000-0000000001', 'أساسيات التداول في الأسواق المالية', 'تعلم أساسيات التحليل الفني والأساسي، فهم الشموع اليابانية، وتحديد نقاط الدخول والخروج.', 'beginner', TRUE, 1),
  ('acad-002-0000-0000-0000-0000000002', 'تداول العملات الرقمية للمبتدئين', 'دليل شامل لفهم العملات الرقمية، البلوكتشين، وبدء التداول بأمان.', 'beginner', TRUE, 2),
  ('acad-003-0000-0000-0000-0000000003', 'إدارة المخاطر والرأس المال', 'تعلم كيفية حماية رأس المال، تحديد حجم الصفقة، واستراتيجيات إدارة المخاطر.', 'intermediate', TRUE, 3),
  ('acad-004-0000-0000-0000-0000000004', 'التحليل النفسي للمتداول', 'فهم سيكولوجية التداول، التحكم في المشاعر، وبناء الانضباط التجاري.', 'advanced', TRUE, 4)
ON CONFLICT (course_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- ============================================================
-- 8. EARNING METHODS (طرق الربح - 4 طرق)
-- ============================================================
INSERT INTO public.earning_methods (method_id, title, description, difficulty, sort_order) VALUES
  ('earn-001-0000-0000-0000-0000000001', 'التسويق بالعمولة (Affiliate Marketing)', 'ربح العمولات من الترويج لمنتجات وخدمات الآخرين عبر الإنترنت.', 'easy', 1),
  ('earn-002-0000-0000-0000-0000000002', 'صناعة المحتوى واليوتيوب', 'إنشاء محتوى فيديو جذاب على يوتيوب والربح من الإعلانات والرعايات.', 'medium', 2),
  ('earn-003-0000-0000-0000-0000000003', 'البيع أونلاين (التجارة الإلكترونية)', 'افتتاح متجر إلكتروني وبيع المنتجات محلياً وعالمياً عبر المنصات.', 'medium', 3),
  ('earn-004-0000-0000-0000-0000000004', 'العمل الحر (Freelancing)', 'تقديم خدماتك المهنية عبر منصات العمل الحر مثل التصميم والبرمجة والكتابة.', 'easy', 4)
ON CONFLICT (method_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- ============================================================
-- 9. SITE SETTINGS (إعدادات الموقع)
-- ============================================================
INSERT INTO public.site_settings (key, value, type) VALUES
  ('site_name', 'ELITE VIP SHOP', 'string'),
  ('site_description', 'متجر النخبة الإلكتروني المتكامل', 'string'),
  ('currency', 'ر.ي', 'string'),
  ('whatsapp_number', '967782138587', 'string'),
  ('telegram_link', 't.me/tariq77087', 'string'),
  ('email_contact', 'tariq770871@gmail.com', 'string'),
  ('facebook_link', 'https://www.facebook.com/share/1Gr8vRUE4M/', 'string'),
  ('order_prefix', 'ORD', 'string')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;
