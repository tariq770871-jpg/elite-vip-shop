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
            آخر تحديث: 7 مايو 2026
          </p>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gold-gradient" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">1. المقدمة والأحكام العامة</h2>
            <p className="leading-8 text-muted-foreground">
              مرحباً بكم في <span className="font-semibold text-foreground">Elite VIP Shop - متجر النخبة</span>. باستخدامكم لموقعنا الإلكتروني وخدماتنا وتطبيقاتنا، فإنكم توافقون على الالتزام بهذه الشروط والأحكام بالكامل. يُرجى قراءتها بعناية تامة قبل المتابعة في استخدام أي من خدماتنا. تحتفظ الإدارة بالحق في تعديل هذه الشروط في أي وقت دون إشعار مسبق، ويعتبر استمراركم في استخدام الموقع بعد نشر أي تعديلات بمثابة موافقة ضمنية منكم على الشروط المحدثة. إذا لم توافقوا على أي من هذه الشروط، يُرجى التوقف عن استخدام الموقع والخدمات فوراً.
            </p>
          </div>

          {/* Section 2 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">2. حسابات المستخدمين</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              للاستفادة من جميع خدماتنا وخصوماتنا الحصرية، قد يُطلب منكم إنشاء حساب شخصي. عند إنشاء حساب، يجب عليكم الالتزام بالآتي:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">تقديم معلومات صحيحة ودقيقة وكاملة وقابلة للتحديث عند الطلب.</li>
              <li className="leading-7">الحفاظ على سرية بيانات الدخول وعدم مشاركة كلمة المرور أو بيانات الحساب مع أي طرف ثالث تحت أي ظرف.</li>
              <li className="leading-7">إبلاغنا فوراً في حالة الاشتباه بوجود استخدام غير مصرح به لحسابكم أو في حالة فقدان بيانات الدخول.</li>
              <li className="leading-7">عدم استخدام الموقع لأي أغراض غير قانونية أو مضللة أو مسيئة أو تتعارض مع القوانين المعمول بها.</li>
              <li className="leading-7">عدم إنشاء أكثر من حساب واحد لنفس المستخدم، وعدم محاولة التلاعب بأنظمة المكافآت والعروض.</li>
              <li className="leading-7">تحمل المسؤولية الكاملة عن جميع الأنشطة التي تتم من خلال حسابكم.</li>
            </ul>
            <p className="mt-3 leading-8 text-muted-foreground">
              نحتفظ بالحق في تعليق أو حذف أي حساب يخالف هذه الشروط دون إنذار مسبق ودون مسؤولية.
            </p>
          </div>

          {/* Section 3 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">3. المنتجات والأسعار</h2>
            <p className="leading-8 text-muted-foreground">
              نبذل قصارى جهدنا لعرض المنتجات وأسعارها بدقة وتحديثها بشكل مستمر. ومع ذلك، قد تحدث أخطاء عرض أو أسعار غير صحيحة نتيجة ظروف تقنية أو بشرية. في هذه الحالة، نحتفظ بالحق في إلغاء أي طلب يحتوي على خطأ في السعر أو المعلومات وسيتم إبلاغ العميل فوراً مع إرجاع أي مبالغ تم دفعها. الأسعار المعروضة تشمل الضريبة المضافة حسب القانون المعمول به، وقد تختلف رسوم الشحن والتوصيل حسب منطقة التوصيل وطريقة الشحن المختارة. نحتفظ بالحق في تغيير الأسعار في أي وقت دون إشعار مسبق.
            </p>
          </div>

          {/* Section 4 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">4. العمليات والمدفوعات</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              يتم التعامل مع جميع العمليات المالية وفق القواعد التالية:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">يتم تأكيد الطلب عند اكتمال عملية الدفع بنجاح واستلام إشعار التأكيد عبر البريد الإلكتروني أو الرسائل النصية.</li>
              <li className="leading-7">تقبلنا طرق الدفع المتاحة على الموقع فقط، ونحتفظ بالحق في إضافة أو إزالة أي طريقة دفع في أي وقت.</li>
              <li className="leading-7">يتم استرجاع المبالغ وفقاً لسياسة الاسترجاع المنشورة على الموقع خلال المهلة المحددة.</li>
              <li className="leading-7">أي عمليات احتيال أو محاولات دفع غير مشروعة سيتم الإبلاغ عنها للجهات المختصة وقد تؤدي إلى حظر الحساب نهائياً.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">5. الملكية الفكرية</h2>
            <p className="leading-8 text-muted-foreground">
              جميع المحتويات المعروضة على الموقع — بما في ذلك التصاميم والشعارات والعلامات التجارية والنصوص والصور والأيقونات والأكواد البرمجية ومقاطع الفيديو — هي ملكية فكرية خاصة بـ Elite VIP Shop ومحمية بموجب قوانين حقوق الملكية الفكرية المحلية والدولية. يُمنع منعاً باتاً نسخ أو إعادة استخدام أو توزيع أو تعديل أو ترجمة أي محتوى من الموقع دون إذن كتابي مسبق من الإدارة. المنتجات الرقمية المباعة تخضع لشروط الترخيص الخاصة بكل منتج، ويجب على المشتري الالتزام بها.
            </p>
          </div>

          {/* Section 6 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">6. المحتوى الم gerم من المستخدمين</h2>
            <p className="leading-8 text-muted-foreground">
              يتحمل المستخدم المسؤولية الكاملة عن أي محتوى ينشره على الموقع، بما في ذلك المراجعات والتعليقات والرسائل. يُمنع نشر أي محتوى يحتوي على إساءة أو تمييز أو تحريض أو معلومات مضللة أو محتوى مخالف للقوانين. نحتفظ بالحق في حذف أو تعديل أي محتوى مخالف دون إشعار مسبق.
            </p>
          </div>

          {/* Section 7 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">7. المسؤولية المحدودة</h2>
            <p className="leading-8 text-muted-foreground">
              لا يتحمل الموقع أي مسؤولية عن أضرار غير مباشرة أو عرضية أو تبعية أو تأديبية ناتجة عن استخدام الموقع أو عدم القدرة على استخدامه، بما في ذلك على سبيل المثال لا الحصر: فقدان الأرباح أو البيانات أو الفرص التجارية. استخدامكم للموقع يكون على مسؤوليتكم الشخصية بالكامل. لا نضمن أن الموقع سيعمل بشكل مستمر أو خالٍ من الأخطاء أو الأعطال التقنية أو الفيروسات أو البرمجيات الخبيثة. لا نتحمل مسؤولية محتوى المواقع الخارجية التي يتم التحويل إليها من موقعنا.
            </p>
          </div>

          {/* Section 8 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">8. الإنهاء والتعليق</h2>
            <p className="leading-8 text-muted-foreground">
              نحتفظ بالحق في إنهاء أو تعليق وصولكم إلى الموقع أو خدماتنا في أي وقت ودون إشعار مسبق، وذلك في حالة مخالفتكم لهذه الشروط والأحكام، أو في حالة وجود نشاط مشبوه على حسابكم، أو لأسباب تشغيلية أو قانونية. في حالة الإنهاء، تظل الأحكام المتعلقة بالملكية الفكرية وحدود المسؤولية سارية المفعول.
            </p>
          </div>

          {/* Section 9 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">9. القانون الحاكم وتسوية النزاعات</h2>
            <p className="leading-8 text-muted-foreground">
              تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين المعمول بها في نطاق اختصاصنا. في حالة نشوء أي نزاع يتعلق باستخدام الموقع أو الخدمات، يتم حله بالطرق الودية أولاً من خلال التواصل معنا عبر صفحة اتصل بنا خلال مدة أقصاها 30 يوماً. وفي حالة تعذر الوصول إلى حل ودي، يتم اللجوء إلى القضاء المختص. نحن نرحب بحل أي نزاعات أو شكاوى أو اقتراحات من خلال قنوات التواصل المتاحة قبل اتخاذ أي إجراءات قانونية.
            </p>
          </div>

          {/* Section 10 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">10. التواصل</h2>
            <p className="leading-8 text-muted-foreground">
              لأي استفسارات أو شكاوى حول هذه الشروط والأحكام، يمكنكم التواصل معنا عبر:
            </p>
            <ul className="ms-4 mt-3 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">البريد الإلكتروني: <span className="font-semibold text-foreground" dir="ltr">tariq770871@gmail.com</span></li>
              <li className="leading-7">واتساب: <span className="font-semibold text-foreground" dir="ltr">+967 782 138 587</span></li>
              <li className="leading-7">تيليجرام: <span className="font-semibold text-foreground" dir="ltr">@tariq77087</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
