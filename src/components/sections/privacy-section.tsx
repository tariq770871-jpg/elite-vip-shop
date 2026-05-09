import { Shield, Lock, Eye, Cookie, UserCheck, Phone, Scale, Database, Globe, MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/967782138587";
const LAST_UPDATED = "7 يوليو 2025";

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-3d p-6 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="icon-box">
          <Icon className="size-5 text-gold" />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function PrivacySection() {
  return (
    <section className="section-gradient-apps py-12 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="section-title-3d mb-4">
            <span className="title-icon">
              <Shield className="size-5" />
            </span>
            سياسة الخصوصية
          </div>
          <p className="text-sm text-muted-foreground">
            آخر تحديث: {LAST_UPDATED}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            موقعنا: <span className="font-medium text-foreground" dir="ltr">https://elite-vip-shop.vercel.app</span>
          </p>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gold-gradient" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1: Introduction */}
          <SectionCard icon={Globe} title="1. مقدمة">
            <p className="leading-8 text-muted-foreground">
              نرحب بكم في <span className="font-semibold text-foreground">Elite VIP Shop - متجر النخبة</span> {"("}
              <span className="font-medium text-foreground" dir="ltr">https://elite-vip-shop.vercel.app</span>
              {")"}. نحن نحترم خصوصيتكم ونلتزم بحماية بياناتكم الشخصية وفقاً لأعلى المعايير الدولية لحماية البيانات. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية وتخزين المعلومات التي نحصل عليها من خلال استخدامكم لموقعنا الإلكتروني وتطبيقاتنا وخدماتنا.
            </p>
            <p className="mt-3 leading-8 text-muted-foreground">
              باستخدامكم لموقعنا أو التسجيل في خدماتنا، فإنكم توافقون على الممارسات الموضحة في هذه السياسة. نوصي بقراءة هذه السياسة بعناية لتتعرف على كيفية تعاملنا مع معلوماتكم الشخصية، حيث نعمل على تحديثها بشكل دوري لتتناسب مع أحدث التطورات والمعايير القانونية.
            </p>
          </SectionCard>

          {/* Section 2: Information We Collect */}
          <SectionCard icon={Database} title="2. المعلومات التي نجمعها">
            <p className="mb-3 leading-8 text-muted-foreground">
              قد نقوم بجمع الأنواع التالية من المعلومات لتقديم خدماتنا وتحسين تجربتكم:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">
                <strong className="text-foreground">المعلومات الشخصية:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف، عنوان التوصيل، ومعلومات الحساب عند إنشاء حساب أو إجراء عملية شراء. نطلب هذه المعلومات فقط عند الضرورة لتقديم الخدمة المطلوبة ولن نطلب منكم بيانات لا علاقة لها بخدماتنا.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">معلومات الدفع:</strong> لا نخزن بيانات الدفع المالية مباشرة على خوادمنا، حيث تتم عمليات الدفع عبر بوابات دفع آمنة ومعتمدة عالمياً تلتزم بمعايير PCI DSS لحماية البيانات المالية. نحتفظ فقط بسجل العمليات لغرض تتبع الطلبات وتقديم الدعم.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">معلومات الاستخدام:</strong> عنوان IP، نوع المتصفح ونسخته، نظام التشغيل، صفحات التصفح، ومدة الزيارة لتحسين تجربة المستخدم وتطوير الموقع وتقديم محتوى أكثر ملاءمة لاهتماماتكم.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">موقعك الجغرافي:</strong> قد نجمع بيانات الموقع التقريبي لتحسين تجربة التوصيل وتخصيص المحتوى والعروض حسب منطقتكم، وذلك باستخدام عنوان IP أو خدمات الموقع المعتمدة.
              </li>
            </ul>
          </SectionCard>

          {/* Section 3: How We Use Information */}
          <SectionCard icon={Eye} title="3. كيف نستخدم المعلومات">
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
          </SectionCard>

          {/* Section 4: Information Sharing */}
          <SectionCard icon={Scale} title="4. مشاركة المعلومات">
            <p className="leading-8 text-muted-foreground">
              لا نقوم ببيع أو تأجير أو تداول معلوماتكم الشخصية مع أطراف ثالثة تحت أي ظرف. نشارك المعلومات فقط في الحالات التالية:
            </p>
            <ul className="ms-4 mt-3 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">عند الضرورة لتنفيذ الخدمات مثل شركات الشحن الموثوقة التي تتقيد بمعايير صارمة لحماية البيانات.</li>
              <li className="leading-7">استجابة للمتطلبات القانونية وأوامر الجهات القضائية المختصة.</li>
              <li className="leading-7">حماية حقوقنا وملكيتنا الفكرية وسلامة المستخدمين.</li>
              <li className="leading-7">بموافقتكم الصريحة والمكتوبة.</li>
            </ul>
            <p className="mt-3 leading-8 text-muted-foreground">
              نتعاون فقط مع شركات وخدمات موثوقة تلتزم بأعلى معايير حماية البيانات وتوقع اتفاقيات حماية معلومات ملزمة قانونياً.
            </p>
          </SectionCard>

          {/* Section 5: Cookies */}
          <SectionCard icon={Cookie} title="5. ملفات تعريف الارتباط (الكوكيز)">
            <p className="mb-3 leading-8 text-muted-foreground">
              نستخدم ملفات تعريف الارتباط (الكوكيز) لتحسين تجربتكم على موقعنا. الأنواع المستخدمة تشمل:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">
                <strong className="text-foreground">كوكيز ضرورية:</strong> ضرورية لتشغيل الموقع بشكل صحيح، مثل تسجيل الدخول وسلة التسوق.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">كوكيز تحليلية:</strong> تساعدنا على فهم كيفية استخدام الموقع وتحسين أدائه (مثل Google Analytics).
              </li>
              <li className="leading-7">
                <strong className="text-foreground">كوكيز تفضيلات:</strong> لتذكر إعداداتكم مثل اللغة والوضع المظلم.
              </li>
            </ul>
            <p className="mt-3 leading-8 text-muted-foreground">
              يمكنكم التحكم في إعدادات الكوكيز من متصفحكم أو من خلال شريط موافقة الكوكيز على الموقع عند الزيارة الأولى.
            </p>
          </SectionCard>

          {/* Section 6: Data Protection */}
          <SectionCard icon={Lock} title="6. حماية المعلومات">
            <p className="leading-8 text-muted-foreground">
              نتخذ إجراءات أمنية متقدمة وشاملة لحماية معلوماتكم الشخصية من الوصول غير المصرح به أو التعديل أو الإفشاء أو الإتلاف أو الفقدان. نستخدم تقنيات التشفير المتقدمة (SSL/TLS) لتأمين نقل البيانات بين متصفحكم وخوادمنا، ونحرص على تحديث أنظمتنا الأمنية بشكل دوري لمواكبة أحدث التهديدات. يتم تخزين البيانات على خوادم محمية بجدران حماية متعددة الطبقات، مع إجراء نسخ احتياطية منتظمة.
            </p>
            <p className="mt-3 leading-8 text-muted-foreground">
              ننصحكم بالحفاظ على سرية بيانات تسجيل الدخول الخاصة بكم واستخدام كلمات مرور قوية وتفعيل خاصية المصادقة الثنائية عند توفرها.
            </p>
          </SectionCard>

          {/* Section 7: Your Rights */}
          <SectionCard icon={UserCheck} title="7. حقوقك">
            <p className="mb-3 leading-8 text-muted-foreground">
              نؤمن بحقكم الكامل في التحكم ببياناتكم الشخصية. يحق لكم:
            </p>
            <ul className="ms-4 list-disc space-y-2 text-muted-foreground">
              <li className="leading-7">
                <strong className="text-foreground">الوصول:</strong> طلب الحصول على نسخة من جميع بياناتكم الشخصية المخزنة لدينا.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">التصحيح:</strong> طلب تصحيح أي بيانات غير دقيقة أو غير مكتملة.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">الحذف:</strong> طلب حذف بياناتكم الشخصية من أنظمتنا، مع مراعاة أي متطلبات قانونية تحتم الاحتفاظ ببعض البيانات.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">النقل:</strong> طلب نقل بياناتكم إلى مزود خدمة آخر بصيغة قابلة للقراءة آلياً.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">الاعتراض:</strong> الاعتراض على معالجة بياناتكم لأغراض تسويقية.
              </li>
              <li className="leading-7">
                <strong className="text-foreground">إلغاء الاشتراك:</strong> الانسحاب من تلقي الرسائل التسويقية عبر النقر على رابط إلغاء الاشتراك في أي رسالة أو من إعدادات الحساب.
              </li>
            </ul>
            <p className="mt-3 leading-8 text-muted-foreground">
              لتفعيل أي من هذه الحقوق، يرجى التواصل معنا عبر واتساب أو صفحة اتصل بنا وسنقوم بالاستجابة خلال 30 يوماً كحد أقصى.
            </p>
          </SectionCard>

          {/* Section 8: Data Retention */}
          <SectionCard icon={Database} title="8. الاحتفاظ بالبيانات">
            <p className="leading-8 text-muted-foreground">
              نحتفظ بمعلوماتكم الشخصية فقط طالما كان ذلك ضرورياً لتحقيق الأغراض الموضحة في هذه السياسة، أو وفقاً لمتطلبات قانونية محددة. عند حذف حسابكم، نقوم بإزالة بياناتكم الشخصية من أنظمتنا النشطة خلال فترة معقولة، مع الاحتفاظ ببعض البيانات المجهولة لأغراض تحليلية وإحصائية. يتم تخزين بيانات المعاملات لفترة لا تقل عن سنتين وفقاً للمتطلبات المحاسبية والقانونية المعمول بها.
            </p>
          </SectionCard>

          {/* Section 9: Policy Updates */}
          <SectionCard icon={Scale} title="9. التحديثات على هذه السياسة">
            <p className="leading-8 text-muted-foreground">
              نحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ &quot;آخر تحديث&quot; في أعلى الصفحة. في حالة إجراء تغييرات جوهرية، سنقوم بإشعاركم عبر البريد الإلكتروني أو من خلال إشعار بارز على الموقع. ننصحكم بمراجعة هذه السياسة بشكل دوري للبقاء على اطلاع بأي تحديثات.
            </p>
          </SectionCard>

          {/* Section 10: Contact */}
          <SectionCard icon={Phone} title="10. جهات الاتصال">
            <p className="leading-8 text-muted-foreground">
              إذا كان لديكم أي أسئلة أو استفسارات أو مخاوف حول سياسة الخصوصية هذه أو ممارسات حماية البيانات لدينا، يسعدنا التواصل معكم عبر الطرق التالية:
            </p>
            <ul className="ms-4 mt-3 list-disc space-y-3 text-muted-foreground">
              <li className="leading-7">
                واتساب (الطريقة الأساسية للتواصل):{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  <MessageCircle className="size-4" />
                  <span dir="ltr">+967 782 138 587</span>
                </a>
              </li>
              <li className="leading-7">
                البريد الإلكتروني:{" "}
                <span className="font-semibold text-foreground" dir="ltr">tariq770871@gmail.com</span>
              </li>
              <li className="leading-7">
                تيليجرام:{" "}
                <span className="font-semibold text-foreground" dir="ltr">@tariq77087</span>
              </li>
            </ul>
          </SectionCard>
        </div>

        {/* CTA Footer */}
        <div className="mt-8 card-3d p-6 text-center">
          <p className="mb-4 leading-8 text-muted-foreground">
            هل لديك استفسار حول خصوصيتك؟ تواصل معنا مباشرة عبر واتساب وسنرد عليك في أسرع وقت.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d-whatsapp inline-flex items-center gap-2"
          >
            <MessageCircle className="size-5" />
            تواصل معنا عبر واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
