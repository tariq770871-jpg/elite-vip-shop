# دليل تشغيل Elite VIP Shop في الإنتاج

## النطاق

هذا الدليل يصف الحد الأدنى لتشغيل المتجر العربي على Vercel مع Supabase، والتحقق من النشر، وتطبيق ترحيلات قاعدة البيانات، والتعامل مع التراجع عند الحاجة. لا يحتوي الملف على أسرار أو قيم اتصال حقيقية.

## متغيرات Vercel

اضبط المتغيرات التالية في مشروع Vercel ضمن بيئات **Production** و**Preview** حسب الحاجة. يجب إدخال القيم الفعلية من لوحة Supabase أو من مالك قنوات التواصل، وعدم نسخ قيم المثال من `.env.example`.

| المتغير | النطاق | الغرض |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | عام | عنوان مشروع Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | عام | مفتاح Supabase العام مع فرض RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | خادم فقط | عمليات الخادم الموثوقة؛ لا تعرضه في المتصفح |
| `NEXT_PUBLIC_SITE_URL` | عام | canonical وOG وsitemap وفحص origin |
| `TELEGRAM_BOT_TOKEN` | خادم فقط | إشعارات Telegram الاختيارية |
| `TELEGRAM_CHAT_ID` | خادم فقط | وجهة إشعارات Telegram الاختيارية |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | عام | رقم زر WhatsApp |
| `NEXT_PUBLIC_TELEGRAM_LINK` | عام | رابط Telegram الظاهر للمستخدم |
| `NEXT_PUBLIC_CONTACT_EMAIL` | عام | بريد التواصل الظاهر للمستخدم |
| `NEXT_PUBLIC_FACEBOOK_LINK` | عام | رابط Facebook الظاهر للمستخدم |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | عام | Google Analytics الاختياري |
| `NEXT_PUBLIC_GSC_VERIFICATION` | عام | تحقق Google Search Console الاختياري |

**تنبيه:** لا تُضبط `SUPABASE_DB_PASSWORD` أو متغيرات PostgreSQL في Vercel. هذه مخصصة لأدوات الترحيل المحلية أو بيئة إدارية مؤقتة فقط.

## إعداد Supabase

تحقق من أن مشروع Supabase الصحيح هو المشروع المرتبط بالتطبيق، وأن الترحيلات من `001` إلى `011` مطبقة أو موثقة في سجل Supabase. الترحيل `011_security_performance_hardening.sql` يزيل صلاحية EXECUTE العامة عن `is_admin()`، ويعيد إنشاء سياسة قراءة الإدارة بصيغة آمنة، ويضيف فهارس المفاتيح الأجنبية الموصى بها. بعد أي ترحيل أعد تشغيل Security Advisor وPerformance Advisor واحتفظ بنسخة من النتائج.

حماية كلمات المرور المسربة عبر HaveIBeenPwned غير متاحة في خطة Supabase الحالية، ولذلك لا يُعد ظهور هذا التحذير فشلًا في النشر. البديل المجاني المطبق داخل التطبيق يفرض حدًا أدنى يبلغ 12 حرفًا في التسجيل وتغيير كلمة المرور. تُفعّل الحماية المدمجة فقط بعد توفر الخطة المناسبة، ثم يُعاد فحص Security Advisor.

## بوابة النشر

قبل الدمج، شغّل محليًا:

```bash
npm ci --ignore-scripts
npm run secret-scan
npm run lint
npm run typecheck
npm test
npm run build
VERCEL=1 npm run build
npm audit --audit-level=high
```

يوجد workflow للجودة في `.github/workflows/quality.yml` ويراقب فحص الأسرار و`npm audit` وlint وtypecheck والاختبارات وPlaywright وbuild عند كل push أو pull request إلى `main`. إذا رفض GitHub رفع workflow من عميل لا يملك صلاحية `workflows`، يجب منح token صلاحية Actions/Workflows أو رفع الملف من واجهة GitHub يدويًا؛ لا يُسمح بتجاوز هذا القيد بإيداع workflow غير معتمد. يستخدم CI `npm ci` مع lockfile الملتزم به.

## Smoke test بعد النشر

بعد أن يصبح نشر Vercel في حالة **READY**، تحقق من الصفحة الرئيسية، صفحات المنتجات والمدونة، تسجيل الدخول، عرض السلة، وواجهات `/api/health` و`/sitemap.xml` و`/robots.txt` و`/manifest.json`. شغّل `npm run test:e2e` على Desktop وMobile Chromium، وتأكد من عدم وجود overflow أفقي أو أخطاء 500. استخدم ترويسة `x-request-id` لربط طلبات الواجهة بسجلات Vercel، ولا تُجرِ طلبات شراء حقيقية أثناء smoke test.

## الترحيلات

طبّق SQL من خلال Supabase SQL Editor أو آلية ترحيل موثوقة ذات صلاحيات محدودة. ابدأ بقراءة المخطط وأخذ نسخة احتياطية، ثم طبّق ترحيلًا واحدًا في كل مرة. لا تستخدم مفتاح service role ككلمة مرور PostgreSQL؛ الاتصال المباشر يحتاج `SUPABASE_DB_HOST` و`SUPABASE_DB_PASSWORD` وبيانات الاتصال الموثقة في `.env.example`.

## التراجع والاستعادة

للتراجع عن إصدار التطبيق، استخدم صفحة Deployments في Vercel واختر آخر نشر **READY** معروف، ثم ثبّته كإنتاج. لا تُلغِ ترحيل قاعدة البيانات تلقائيًا؛ راجع أثره أولًا، واستعد من نسخة Supabase عند الضرورة. احتفظ بسجل commit ووقت النشر ونتيجة smoke test لكل إصدار.

## القيود المعروفة

محدد المعدل الحالي in-memory وbest-effort، ولذلك لا يمثل حدًا موزعًا بين جميع نسخ Vercel. عند الحاجة إلى حماية موزعة، يجب ربطه بمخزن مركزي مثل Redis/KV مع أسرار فعلية ووثائق تشغيل، وليس إضافة fallback وهمي. كما أن اكتمال روابط التواصل ووظائف الخادم في الإنتاج يعتمد على إدخال القيم الفعلية في Vercel. قبل أي تدوير لمفتاح، ألغِ الرمز القديم أولًا، ثم حدّث البيئة وأعد النشر واختبر `api/health`. لا تُعاد مفاتيح ظهرت في محادثة أو لقطة شاشة.
