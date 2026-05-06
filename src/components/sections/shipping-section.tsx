export function ShippingSection() {
  return (
    <section className="section-gradient-earning py-12 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="section-title-3d mb-4">
            <span className="title-icon">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </span>
            سياسة الشحن والتوصيل
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
            <h2 className="mb-4 text-xl font-bold">1. المناطق التي نخدمها</h2>
            <p className="leading-8 text-muted-foreground">
              نوفر خدمة الشحن والتوصيل لجميع مناطق اليمن والدول العربية عبر شركاء الشحن الموثوقين. نعمل على التوسع المستمر لتغطية مناطق جديدة. يمكنكم الاستفسار عن توفر الشحن لمنطقتكم من خلال التواصل معنا قبل إتمام الطلب.
            </p>
          </div>

          {/* Section 2 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">2. مدة التوصيل</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              تختلف مدة التوصيل حسب المنطقة ونوع المنتج:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7"><strong className="text-foreground">المنتجات الرقمية:</strong> يتم التسليم فوراً عبر البريد الإلكتروني أو الرسائل النصية بعد تأكيد الدفع.</li>
              <li className="leading-7"><strong className="text-foreground">المدينة الرئيسية:</strong> 2-4 أيام عمل.</li>
              <li className="leading-7"><strong className="text-foreground">المحافظات والدول العربية:</strong> 5-10 أيام عمل حسب المنطقة.</li>
              <li className="leading-7">قد تطول المدة في الأعياد والعطلات الرسمية وأوقات الذروة.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">3. رسوم الشحن</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              تُحسب رسوم الشحن بناءً على عدة عوامل:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">المنتجات الرقمية: <strong className="text-foreground">شحن مجاني</strong> — لا توجد رسوم شحن.</li>
              <li className="leading-7">المنتجات المادية: تختلف الرسوم حسب الوزن والحجم ومنطقة التوصيل وتُعرض عند إتمام الطلب.</li>
              <li className="leading-7">قد نقدم <strong className="text-foreground">شحن مجاني</strong> في العروض الخاصة أو عند تجاوز حد معين من قيمة الطلب.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">4. تتبع الطلب</h2>
            <p className="leading-8 text-muted-foreground">
              بعد شحن طلبكم، ستحصلون على رقم تتبع عبر البريد الإلكتروني أو واتساب يمكنكم استخدامه لمتابعة حالة الشحن. نتواصل معكم في كل مرحلة من مراحل الشحن لضمان وصول طلبكم بأمان. في حال مواجهة أي مشكلة في التتبع أو تأخر في التوصيل، يمكنكم التواصل معنا مباشرة وسنعمل على حل المشكلة فوراً.
            </p>
          </div>

          {/* Section 5 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">5. الاستلام والتأكد من المنتج</h2>
            <p className="leading-8 text-muted-foreground">
              عند استلام الطلب، يرجى التأكد من سلامة المنتج والتغليف قبل توقيع الاستلام. في حال ملاحظة أي تلف أو نقص في المحتويات، يرجى الإبلاغ عن ذلك فوراً أمام مندوب الشحن أو التواصل معنا خلال 48 ساعة من الاستلام. لا يمكن قبول شكاوى التلف بعد انقضاء هذه المدة.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
