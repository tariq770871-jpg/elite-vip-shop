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

تحقق من أن مشروع Supabase الصحيح هو المشروع المرتبط بالتطبيق، وأن الجداول الأساسية والسياسات وRPCs الخاصة بالترحيلات من `001` إلى `009` مطبقة. الترحيل `010_performance_foreign_key_indexes.sql` يضيف فهارس للمفاتيح الأجنبية بصورة idempotent، لكنه لا يُعد مطبقًا في الإنتاج حتى يظهر نجاحه في سجل Supabase.

فعّل **Leaked Password Protection** من إعدادات Supabase Auth. هذا إعداد خارجي لا يمكن استنتاج قيمته أو تغييره من المستودع. بعد أي ترحيل أعد تشغيل Security Advisor وPerformance Advisor واحتفظ بنسخة من النتائج.

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

يراقب GitHub Actions نفس فحوص الجودة الأساسية عند كل push أو pull request إلى `main`. يستخدم CI إصدار Node المحدد في `.nvmrc`، بينما يبقى اختبار البناء المحلي مقيدًا بإصدار Node المتوفر في بيئة المطور.

## Smoke test بعد النشر

بعد أن يصبح نشر Vercel في حالة **READY**، تحقق من الصفحة الرئيسية، صفحات المنتجات والمدونة، تسجيل الدخول، عرض السلة، إنشاء طلب اختباري غير حقيقي في بيئة Preview، وواجهات `/api/health` و`/sitemap.xml` و`/robots.txt`. تأكد من أن الروابط العامة لا تظهر كروابط فارغة وأن وظائف الخادم التي تتطلب `SUPABASE_SERVICE_ROLE_KEY` تعمل فعليًا.

## الترحيلات

طبّق SQL من خلال Supabase SQL Editor أو آلية ترحيل موثوقة ذات صلاحيات محدودة. ابدأ بقراءة المخطط وأخذ نسخة احتياطية، ثم طبّق ترحيلًا واحدًا في كل مرة. لا تستخدم مفتاح service role ككلمة مرور PostgreSQL؛ الاتصال المباشر يحتاج `SUPABASE_DB_HOST` و`SUPABASE_DB_PASSWORD` وبيانات الاتصال الموثقة في `.env.example`.

## التراجع والاستعادة

للتراجع عن إصدار التطبيق، استخدم صفحة Deployments في Vercel واختر آخر نشر **READY** معروف، ثم ثبّته كإنتاج. لا تُلغِ ترحيل قاعدة البيانات تلقائيًا؛ راجع أثره أولًا، واستعد من نسخة Supabase عند الضرورة. احتفظ بسجل commit ووقت النشر ونتيجة smoke test لكل إصدار.

## القيود المعروفة

محدد المعدل الحالي in-memory وbest-effort، ولذلك لا يمثل حدًا موزعًا بين جميع نسخ Vercel. عند الحاجة إلى حماية موزعة، يجب ربطه بمخزن مركزي مثل Redis/KV مع أسرار فعلية ووثائق تشغيل، وليس إضافة fallback وهمي. كما أن اكتمال روابط التواصل ووظائف الخادم في الإنتاج يعتمد على إدخال القيم الفعلية في Vercel.
