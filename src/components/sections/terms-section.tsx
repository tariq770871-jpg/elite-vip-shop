export function TermsSection() {
  return (
    <section className="section-gradient-ai py-12 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="section-title-3d mb-4">
            <span className="title-icon">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M16 6H8l-2 5h12l-2-5z"/><path d="M16 18H8l-2-5h12l-2 5z"/><path d="M8 3v3"/><path d="M16 3v3"/><path d="M3 21h18"/></svg>
            </span>
            الشروط والأحكام
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
            <h2 className="mb-4 text-xl font-bold">1. المقدمة والأحكام العامة</h2>
            <p className="leading-8 text-muted-foreground">
              مرحباً بكم في <span className="font-semibold text-foreground">Elite VIP Shop</span>. باستخدامكم لموقعنا الإلكتروني وخدماتنا، فإنكم توافقون على الالتزام بهذه الشروط والأحكام. يُرجى قراءتها بعناية قبل المتابعة. تحتفظ الإدارة بالحق في تعديل هذه الشروط في أي وقت دون إشعار مسبق، ويعتبر استمراركم في استخدام الموقع موافقة ضمنية على أي تعديلات جديدة.
            </p>
          </div>

          {/* Section 2 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">2. حسابات المستخدمين</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              للاستفادة من جميع خدماتنا، قد يُطلب منكم إنشاء حساب شخصي. عند إنشاء حساب، يجب عليكم:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">تقديم معلومات صحيحة ودقيقة وكاملة.</li>
              <li className="leading-7">الحفاظ على سرية بيانات الدخول وعدم مشاركتها مع الآخرين.</li>
              <li className="leading-7">إبلاغنا فوراً في حالة الاشتباه بوجود استخدام غير مصرح به لحسابكم.</li>
              <li className="leading-7">عدم استخدام الموقع لأي أغراض غير قانونية أو مضللة.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">3. المنتجات والأسعار</h2>
            <p className="leading-8 text-muted-foreground">
              نبذل قصارى جهدنا لعرض المنتجات وأسعارها بدقة. ومع ذلك، قد تحدث أخطاء عرض أو أسعار غير صحيحة. في هذه الحالة، نحتفظ بالحق في إلغاء أي طلب يحتوي على خطأ في السعر وإبلاغ العميل فوراً. الأسعار المعروضة تشمل الضريبة المضافة، وقد تختلف رسوم الشحن حسب منطقة التوصيل.
            </p>
          </div>

          {/* Section 4 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">4. الملكية الفكرية</h2>
            <p className="leading-8 text-muted-foreground">
              جميع المحتويات المعروضة على الموقع — بما في ذلك التصاميم والشعارات والنصوص والصور والأيقونات — هي ملكية فكرية خاصة بـ Elite VIP Shop ومحمية بموجب قوانين حقوق الملكية الفكرية. يُمنع نسخ أو إعادة استخدام أو توزيع أي محتوى من الموقع دون إذن كتابي مسبق من الإدارة.
            </p>
          </div>

          {/* Section 5 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">5. المسؤولية المحدودة</h2>
            <p className="leading-8 text-muted-foreground">
              لا يتحمل الموقع أي مسؤولية عن أضرار غير مباشرة أو عرضية أو تبعية ناتجة عن استخدام الموقع أو عدم القدرة على استخدامه. استخدامكم للموقع يكون على مسؤوليتكم الشخصية بالكامل. لا نضمن أن الموقع سيعمل بشكل مستمر أو خالٍ من الأخطاء أو الأعطال التقنية.
            </p>
          </div>

          {/* Section 6 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">6. القانون الحاكم</h2>
            <p className="leading-8 text-muted-foreground">
              تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين المعمول بها. في حالة نشوء أي نزاع يتعلق باستخدام الموقع، يتم حله بالطرق الودية أولاً، وفي حالة تعذر ذلك، يتم اللجوء إلى القضاء المختص. نحن نرحب بحل أي نزاعات أو شكاوى من خلال صفحة اتصل بنا قبل اتخاذ أي إجراءات قانونية.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
