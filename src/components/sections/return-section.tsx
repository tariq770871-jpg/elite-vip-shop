export function ReturnSection() {
  return (
    <section className="section-gradient-academy py-12 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="section-title-3d mb-4">
            <span className="title-icon">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
            </span>
            سياسة الاسترجاع والاستبدال
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
            <h2 className="mb-4 text-xl font-bold">1. شروط الاسترجاع العامة</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              نحرص في Elite VIP Shop على رضا عملائنا الكامل عن مشترياتهم. لذلك نوفر سياسة استرجاع مرنة ضمن الشروط التالية:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">يمكنكم طلب الاسترجاع خلال <strong className="text-foreground">14 يوماً</strong> من تاريخ استلام المنتج.</li>
              <li className="leading-7">يجب أن يكون المنتج في حالته الأصلية، غير مستخدم، وبالتغليف الكامل.</li>
              <li className="leading-7">يجب تقديم إثبات الشراء (فاتورة الطلب أو إيصال الدفع).</li>
              <li className="leading-7">المنتجات الرقمية والاشتراكات لا تخضع لسياسة الاسترجاع بعد تفعيلها.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">2. شروط الاستبدال</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              يمكنكم طلب استبدال المنتج في الحالات التالية:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">وصول منتج به عيب مصنعي أو تلف عند الاستلام.</li>
              <li className="leading-7">إرسال منتج مختلف عن المطلوب (خطأ في الطلب).</li>
              <li className="leading-7">يجب الإبلاغ عن المشكلة خلال <strong className="text-foreground">48 ساعة</strong> من تاريخ الاستلام.</li>
              <li className="leading-7">يتم الاستبدال بنفس المنتج أو بمنتج مماثل في حالة عدم التوفر.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">3. المنتجات غير القابلة للاسترجاع</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              لا يمكن استرجاع أو استبدال المنتجات التالية:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">المنتجات الرقمية التي تم تنزيلها أو تفعيلها (كورسات، برامج، اشتراكات).</li>
              <li className="leading-7">المنتجات المخصصة أو المصنوعة حسب الطلب.</li>
              <li className="leading-7">المنتجات التي تم استخدامها أو فتح تغليفها.</li>
              <li className="leading-7">المنتجات التي تعرضت للتلف نتيجة سوء الاستخدام من قبل العميل.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">4. إجراءات الاسترجاع</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              لطلب استرجاع أو استبدال، يرجى اتباع الخطوات التالية:
            </p>
            <ol className="ms-4 list-decimal space-y-2 text-muted-foreground">
              <li className="leading-7">تواصلوا معنا عبر صفحة اتصل بنا أو واتساب مع ذكر رقم الطلب وسبب الاسترجاع.</li>
              <li className="leading-7">سيتم مراجعة الطلب والرد عليكم خلال 24-48 ساعة عمل.</li>
              <li className="leading-7">في حال القبول، يتم إرجاع المنتج مع جميع الملحقات والتغليف الأصلي.</li>
              <li className="leading-7">بعد فحص المنتج والتأكد من مطابقته للشروط، يتم استرداد المبلغ خلال 3-7 أيام عمل.</li>
            </ol>
          </div>

          {/* Section 5 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">5. استرداد المبلغ</h2>
            <p className="leading-8 text-muted-foreground">
              يتم استرداد المبلغ بنفس طريقة الدفع الأصلية المستخدمة عند الشراء. في حالة الدفع عبر التحويل البنكي أو المحافظ الإلكترونية، يتم التحويل إلى الحساب نفسه. قد تختلف مدة الاسترداد حسب طريقة الدفع وجهة الدفع. في حالة وجود أي استفسار حول عملية الاسترداد، يمكنكم التواصل مع فريق الدعم في أي وقت.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
