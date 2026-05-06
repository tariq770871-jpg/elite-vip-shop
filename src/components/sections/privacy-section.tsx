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
            آخر تحديث: 7 مايو 2026
          </p>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gold-gradient" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">1. مقدمة</h2>
            <p className="leading-8 text-muted-foreground">
              نرحب بكم في <span className="font-semibold text-foreground">Elite VIP Shop - متجر النخبة</span>. نحن نحترم خصوصيتكم ونلتزم بحماية بياناتكم الشخصية وفقاً لأعلى المعايير الدولية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية وتخزين المعلومات التي نحصل عليها من خلال استخدامكم لموقعنا الإلكتروني وتطبيقاتنا وخدماتنا. باستخدامكم لموقعنا أو التسجيل في خدماتنا، فإنكم توافقون على الممارسات الموضحة في هذه السياسة. نوصي بقراءة هذه السياسة بعناية لتتعرف على كيفية تعاملنا مع معلوماتكم الشخصية، حيث نعمل على تحديثها بشكل دوري لتتناسب مع أحدث التطورات والمعايير القانونية.
            </p>
          </div>

          {/* Section 2 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">2. المعلومات التي نجمعها</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              قد نقوم بجمع الأنواع التالية من المعلومات لتقديم خدماتنا وتحسين تجربتكم:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7"><strong className="text-foreground">المعلومات الشخصية:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف، عنوان التوصيل، ومعلومات الحساب عند إنشاء حساب أو إجراء عملية شراء. نطلب هذه المعلومات فقط عند الضرورة لتقديم الخدمة المطلوبة ولن نطلب منكم بيانات لا علاقة لها بخدماتنا.</li>
              <li className="leading-7"><strong className="text-foreground">معلومات الدفع:</strong> لا نخزن بيانات الدفع المالية مباشرة على خوادمنا، حيث تتم عمليات الدفع عبر بوابات دفع آمنة ومعتمدة عالمياً تلتزم بمعايير PCI DSS لحماية البيانات المالية. نحتفظ فقط بسجل العمليات لغرض تتبع الطلبات وتقديم الدعم.</li>
              <li className="leading-7"><strong className="text-foreground">معلومات الاستخدام:</strong> عنوان IP، نوع المتصفح ونسخته، نظام التشغيل، صفحات التصفح، ومدة الزيارة، ونسبة التحويل، لتحسين تجربة المستخدم وتطوير الموقع وتقديم محتوى أكثر ملاءمة لاهتماماتكم.</li>
              <li className="leading-7"><strong className="text-foreground">ملفات تعريف الارتباط (الكوكيز):</strong> نستخدم ملفات الكوكيز الضرورية لتشغيل الموقع بشكل صحيح، بالإضافة إلى كوكيز تحليلية لفهم كيفية استخدام الموقع، وكوكيز تفضيلات لتذكر إعداداتكم كاللغة والوضع المظلم. يمكنكم التحكم في إعدادات الكوكيز من متصفحكم.</li>
              <li className="leading-7"><strong className="text-foreground">موقعك الجغرافي:</strong> قد نجمع بيانات الموقع التقريبي لتحسين تجربة التوصيل وتخصيص المحتوى والعروض حسب منطقتكم، وذلك باستخدام عنوان IP أو خدمات الموقع المعتمدة.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">3. كيف نستخدم معلوماتكم</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              نستخدم المعلومات المجمعة للأغراض التالية وبشكل مشروع وقانوني:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">معالجة الطلبات وتنفيذ عمليات الشراء وتوصيل المنتجات والخدمات المطلوبة في الوقت المحدد وبأعلى جودة.</li>
              <li className="leading-7">تحسين موقعنا وتطبيقاتنا وتجربة التسوق بناءً على تفضيلاتكم وسلوك التصفح لضمان تجربة سلسة ومريحة.</li>
              <li className="leading-7">إرسال إشعارات حول حالة الطلبات وتحديثات الشحن والعروض الحصرية والتحديثات الجديدة التي تهمكم، مع إمكانية إلغاء الاشتراك في أي وقت.</li>
              <li className="leading-7">تقديم الدعم الفني المتميز والإجابة على استفساراتكم وحل المشاكل التي تواجهونها بأسرع وقت ممكن.</li>
              <li className="leading-7">تحليل أنماط الاستخدام وتطوير خدماتنا ومنتجاتنا وتحسين أداء الموقع وتجربة المستخدم بشكل مستمر.</li>
              <li className="leading-7">منع الاحتيال وحماية أمان الموقع وبيانات المستخدمين من خلال أنظمة مراقبة متطورة.</li>
              <li className="leading-7">الامتثال للمتطلبات القانونية والتنظيمية المعمول بها في الدول التي نقدم خدماتنا فيها.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">4. حماية المعلومات</h2>
            <p className="leading-8 text-muted-foreground">
              نتخذ إجراءات أمنية متقدمة وشاملة لحماية معلوماتكم الشخصية من الوصول غير المصرح به أو التعديل أو الإفشاء أو الإتلاف أو الفقدان. نستخدم تقنيات التشفير المتقدمة (SSL/TLS) لتأمين نقل البيانات بين متصفحكم وخوادمنا، ونحرص على تحديث أنظمتنا الأمنية بشكل دوري لمواكبة أحدث التهديدات. يتم تخزين البيانات على خوادم محمية بجدران حماية متعددة الطبقات، مع إجراء نسخ احتياطية منتظمة. ومع ذلك، لا يمكن لأي نظام على الإنترنت أن يكون آمناً بنسبة 100%، لذا ننصحكم بالحفاظ على سرية بيانات تسجيل الدخول الخاصة بكم واستخدام كلمات مرور قوية وتفعيل خاصية المصادقة الثنائية عند توفرها.
            </p>
          </div>

          {/* Section 5 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">5. مشاركة المعلومات مع الأطراف الثالثة</h2>
            <p className="leading-8 text-muted-foreground">
              لا نقوم ببيع أو تأجير أو تداول معلوماتكم الشخصية مع أطراف ثالثة تحت أي ظرف. نشارك المعلومات فقط في الحالات التالية: عند الضرورة لتنفيذ الخدمات مثل شركات الشحن الموثوقة التي تتقيد بمعايير صارمة لحماية البيانات، أو استجابة للمتطلبات القانونية وأوامر الجهات القضائية المختصة، أو لحماية حقوقنا وملكيتنا الفكرية وسلامة المستخدمين، أو بموافقتكم الصريحة والمكتوبة. نتعاون فقط مع شركات وخدمات موثوقة تلتزم بأعلى معايير حماية البيانات وتوقع اتفاقيات حماية معلومات ملزمة قانونياً.
            </p>
          </div>

          {/* Section 6 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">6. حقوقكم</h2>
            <p className="mb-3 leading-8 text-muted-foreground">
              نؤمن بحقكم الكامل في التحكم ببياناتكم الشخصية. يحق لكم:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7"><strong className="text-foreground">الوصول:</strong> طلب الحصول على نسخة من جميع بياناتكم الشخصية المخزنة لدينا.</li>
              <li className="leading-7"><strong className="text-foreground">التصحيح:</strong> طلب تصحيح أي بيانات غير دقيقة أو غير مكتملة.</li>
              <li className="leading-7"><strong className="text-foreground">الحذف:</strong> طلب حذف بياناتكم الشخصية من أنظمتنا، مع مراعاة أي متطلبات قانونية تحتم الاحتفاظ ببعض البيانات.</li>
              <li className="leading-7"><strong className="text-foreground">النقل:</strong> طلب نقل بياناتكم إلى مزود خدمة آخر بصيغة قابلة للقراءة آلياً.</li>
              <li className="leading-7"><strong className="text-foreground">الاعتراض:</strong> الاعتراض على معالجة بياناتكم لأغراض تسويقية أو ل reasons مشروعة.</li>
              <li className="leading-7"><strong className="text-foreground">إلغاء الاشتراك:</strong> الانسحاب من تلقي الرسائل التسويقية عبر النقر على رابط إلغاء الاشتراك في أي رسالة أو من إعدادات الحساب.</li>
            </ul>
            <p className="mt-3 leading-8 text-muted-foreground">
              لتفعيل أي من هذه الحقوق، يرجى التواصل معنا عبر صفحة اتصل بنا أو عبر البريد الإلكتروني <span className="font-semibold text-foreground" dir="ltr">tariq770871@gmail.com</span> وسنقوم بالاستجابة خلال 30 يوماً كحد أقصى.
            </p>
          </div>

          {/* Section 7 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">7. الاحتفاظ بالبيانات</h2>
            <p className="leading-8 text-muted-foreground">
              نحتفظ بمعلوماتكم الشخصية فقط طالما كان ذلك ضرورياً لتحقيق الأغراض الموضحة في هذه السياسة، أو وفقاً لمتطلبات قانونية محددة. عند حذف حسابكم، نقوم بإزالة بياناتكم الشخصية من أنظمتنا النشطة خلال فترة معقولة، مع الاحتفاظ ببعض البيانات المجهولة لأغراض تحليلية وإحصائية. يتم تخزين بيانات المعاملات لفترة لا تقل عن سنتين وفقاً للمتطلبات المحاسبية والقانونية المعمول بها.
            </p>
          </div>

          {/* Section 8 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">8. الأطفال</h2>
            <p className="leading-8 text-muted-foreground">
              خدماتنا ليست موجهة للأطفال دون سن 18 عاماً، ولا نقوم عمداً بجمع بيانات شخصية من أي شخص يقل عمره عن 18 عاماً. إذا اكتشفنا أننا قد جمعنا بيانات شخصية لطفل دون هذا السن بشكل غير مقصود، فسنتخذ خطوات فورية لحذف تلك المعلومات من أنظمتنا. إذا كنت ولي أمر وتعتقد أن طفلك قدم لنا بيانات شخصية، يرجى التواصل معنا فوراً.
            </p>
          </div>

          {/* Section 9 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">9. التحديثات على هذه السياسة</h2>
            <p className="leading-8 text-muted-foreground">
              نحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ &quot;آخر تحديث&quot; في أعلى الصفحة. في حالة إجراء تغييرات جوهرية، سنقوم بإشعاركم عبر البريد الإلكتروني أو من خلال إشعار بارز على الموقع. ننصحكم بمراجعة هذه السياسة بشكل دوري للبقاء على اطلاع بأي تحديثات.
            </p>
          </div>

          {/* Section 10 */}
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">10. التواصل معنا</h2>
            <p className="leading-8 text-muted-foreground">
              إذا كان لديكم أي أسئلة أو استفسارات أو مخاوف حول سياسة الخصوصية هذه أو ممارسات حماية البيانات لدينا، يسعدنا التواصل معكم عبر الطرق التالية:
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
