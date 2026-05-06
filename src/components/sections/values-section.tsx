"use client";

import {
  TrustIcon,
  QualityIcon,
  SupportIcon,
  InnovationIcon,
  HeartIcon,
} from "@/components/icons";

export function ValuesSection() {
  return (
    <div>
      {/* Header */}
      <section className="section-gradient-products py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="section-title-3d mb-6">
              <span className="title-icon">
                <HeartIcon className="size-6" />
              </span>
              قيم الموقع
            </div>
            <p className="max-w-2xl text-muted-foreground text-base md:text-lg">
              المبادئ التي نلتزم بها في كل تعامل وكل خدمة نقدمها — لأن ثقتك هي أغلى ما نملك
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <TrustIcon className="size-8" />, title: "الثقة والشفافية", desc: "نتعامل بشفافية كاملة في كل تفاصيل منتجاتنا وأسعارنا وخدماتنا. لا إخفاء ولا تضليل — ما تراه هو ما تحصل عليه بالضبط." },
              { icon: <QualityIcon className="size-8" />, title: "الجودة الفائقة", desc: "نختار منتجاتنا بعناية فائقة ونراجع كل خدمة قبل تقديمها. هدفنا أن يحصل كل عميل على تجربة تفوق توقعاته." },
              { icon: <SupportIcon className="size-8" />, title: "دعم متواصل", desc: "فريق الدعم متاح عبر واتساب وتيليجرام للإجابة على استفساراتك ومساعدتك في أي وقت. رضاكم هو أولويتنا القصوى." },
              { icon: <InnovationIcon className="size-8" />, title: "الابتكار المستمر", desc: "نسعى دائماً لتقديم أحدث المنتجات والأدوات والتقنيات. نحدّث محتوانا باستمرار لنكون دائماً في الطليعة." },
            ].map((item, i) => (
              <div key={i} className="card-3d p-6 text-center">
                <div className="icon-box mx-auto mb-5" style={{ width: "64px", height: "64px", borderRadius: "18px" }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-gold-gradient">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
