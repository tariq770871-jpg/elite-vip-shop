export function PrivacySection() {
  return (
    <section className="section-gradient-apps py-12 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="section-title-3d mb-4">
            <span className="title-icon">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            سياسة الخصوصية
          </div>
          <p className="text-sm text-muted-foreground">
            آخر تحديث: مايو 2026
          </p>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gold-gradient" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">1. مقدمة</h2>
            <p className="leading-8 text-muted-foreground">
              نرحب بكم في <span className="font-semibold text-foreground">Elite VIP Shop</span>. نحن نحترم خصوصيتكم ونلتزم بحماية بياناتكم الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي نحصل عليها من خلال استخدامكم لموقعنا الإلكتروني وخدماتنا. باستخدامكم لموقعنا، فإنكم توافقون على الممارسات الموضحة في هذه السياسة.
            </p>
          </div>

          {/* Section 2 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">2. المعلومات التي نجمعها</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              قد نقوم بجمع الأنواع التالية من المعلومات:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7"><strong className="text-foreground">المعلومات الشخصية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، عنوان التوصيل عند إنشاء حساب أو إجراء عملية شراء.</li>
              <li className="leading-7"><strong className="text-foreground">معلومات الدفع:</strong> لا نخزن بيانات الدفع المالية مباشرة، حيث تتم عمليات الدفع عبر بوابات دفع آمنة ومعتمدة.</li>
              <li className="leading-7"><strong className="text-foreground">معلومات الاستخدام:</strong> عنوان IP، نوع المتصفح، صفحات التصفح، ومدة الزيارة لتحسين تجربة المستخدم.</li>
              <li className="leading-7"><strong className="text-foreground">ملفات تعريف الارتباط:</strong> نستخدم ملفات الكوكيز لتحسين أداء الموقع وتخصيص المحتوى.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">3. كيف نستخدم معلوماتكم</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              نستخدم المعلومات المجمعة للأغراض التالية:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">معالجة الطلبات وتوصيل المنتجات والخدمات المطلوبة.</li>
              <li className="leading-7">تحسين موقعنا وتجربة التسوق بناءً على تفضيلاتكم.</li>
              <li className="leading-7">إرسال إشعارات حول الطلبات والعروض والتحديثات الجديدة.</li>
              <li className="leading-7">تقديم الدعم الفني والإجابة على استفساراتكم.</li>
              <li className="leading-7">تحليل أنماط الاستخدام لتطوير خدماتنا ومنتجاتنا.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">4. حماية المعلومات</h2>
            <p className="leading-8 text-muted-foreground">
              نتخذ إجراءات أمنية مناسبة لحماية معلوماتكم الشخصية من الوصول غير المصرح به أو التعديل أو الإفشاء أو الإتلاف. نستخدم تقنيات التشفير المتقدمة ونحرص على تحديث أنظمتنا الأمنية بشكل دوري. ومع ذلك، لا يمكن لأي نظام على الإنترنت أن يكون آمناً بنسبة 100%، لذا ننصحكم بالحفاظ على سرية بيانات تسجيل الدخول الخاصة بكم.
            </p>
          </div>

          {/* Section 5 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">5. مشاركة المعلومات مع الأطراف الثالثة</h2>
            <p className="leading-8 text-muted-foreground">
              لا نقوم ببيع أو تأجير أو مشاركة معلوماتكم الشخصية مع أطراف ثالثة إلا في الحالات التالية: عند الضرورة لتنفيذ الخدمات (مثل شركات الشحن)، أو استجابة للمتطلبات القانونية، أو بموافقتكم الصريحة. نتعاون فقط مع شركات موثوقة تتقيد بمعايير صارمة لحماية البيانات.
            </p>
          </div>

          {/* Section 6 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">6. حقوقكم</h2>
            <p className="leading-8 text-muted-foreground">
              يحق لكم طلب الوصول إلى بياناتكم الشخصية وتصحيحها أو حذفها في أي وقت. يمكنكم أيضاً الانسحاب من تلقي الرسائل التسويقية عبر النقر على رابط إلغاء الاشتراك في أي رسالة. لتفعيل أي من هذه الحقوق، يرجى التواصل معنا عبر صفحة اتصل بنا.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
