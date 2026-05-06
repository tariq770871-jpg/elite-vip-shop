"use client";

import { TargetIcon, StarIcon, DiamondIcon } from "@/components/icons";
import { Shield, Users, Zap, Award, TrendingUp, Globe } from "lucide-react";
import { useEffect } from "react";

export function AboutSection() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <section className="section-gradient-products py-12 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="section-title-3d mb-4">
            <span className="title-icon">
              <StarIcon className="size-6" />
            </span>
            من نحن
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            تعرف على قصة Elite VIP Shop ورؤيتنا لمستقبل التسوق الإلكتروني في العالم العربي
          </p>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gold-gradient" />
        </div>

        {/* Main Story */}
        <div className="prose prose-lg mx-auto mb-12 max-w-3xl">
          <div className="card-3d p-6 md:p-8 space-y-6">
            <p className="text-muted-foreground leading-8 text-base">
              مرحباً بكم في <span className="text-gold-gradient font-bold">Elite VIP Shop - متجر النخبة</span> — وجهتكم الإلكترونية المتميزة التي تجمع بين الجودة العالية والأسعار المنافسة والخدمة الاستثنائية. نحن فريق من الشغوفين بالتقنية والتجارة الإلكترونية، نسعى لتقديم أفضل المنتجات والخدمات الرقمية لعملائنا الكرام في جميع أنحاء العالم العربي وخارجه. بدأنا رحلتنا بحلم واضح: أن نكون الوجهة الأولى والأكثر ثقة لكل من يبحث عن التميز في عالم التسوق الرقمي، وأن نثبت أن التسوق الإلكتروني العربي يمكن أن يوفر تجربة لا تقل جودة عن أفضل المتاجر العالمية.
            </p>
            <p className="text-muted-foreground leading-8 text-base">
              ما يميزنا عن غيرنا هو حرصنا الشديد على اختيار منتجاتنا بعناية فائقة وضمان جودتها قبل تقديمها لعملائنا. نحن لا نكتفي بعرض أي منتج، بل نقوم بتقييمه واختباره شخصياً من قبل فريقنا المتخصص للتأكد من أنه يلبي أعلى المعايير. فريقنا يعمل على مدار الساعة للبحث عن أحدث المنتجات وأفضل العروض في الأسواق العالمية والإقليمية، ونقيم علاقات مباشرة مع الموردين والمطورين لضمان حصولكم على أفضل الأسعار مع الحفاظ على أعلى مستويات الجودة.
            </p>
            <p className="text-muted-foreground leading-8 text-base">
              نؤمن في Elite VIP Shop بأن العميل هو محور كل ما نقوم به. لذلك نحرص على تقديم خدمة عملاء متميزة تتسم بالاحترافية والسرعة والصدق. نوفر لكم قنوات تواصل متعددة للرد على استفساراتكم وحل مشاكلكم في أسرع وقت ممكن. كذلك نحرص على تحديث محتوانا المجاني بشكل مستمر — من تطبيقات مجانية وأدوات ذكاء اصطناعي إلى دورات تعليمية شاملة — لنكون مرجعاً شاملاً وموثوقاً لكل ما يحتاجه المستخدم العربي في عالم التقنية.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { number: "+1000", label: "عميل سعيد", icon: <Users className="size-5" /> },
            { number: "+500", label: "منتج متوفر", icon: <Zap className="size-5" /> },
            { number: "+50", label: "دورة تدريبية", icon: <Award className="size-5" /> },
            { number: "24/7", label: "دعم فني", icon: <Shield className="size-5" /> },
          ].map((stat) => (
            <div key={stat.label} className="card-3d flex flex-col items-center p-6 text-center">
              <div className="mb-2 text-primary">{stat.icon}</div>
              <p className="text-2xl font-black text-gold-gradient">{stat.number}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Vision, Mission, Values Cards */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-amber-500">
              <TargetIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">رؤيتنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              أن نكون المنصة الرائدة والأكثر ثقة في التجارة الإلكترونية العربية، ونكون الخيار الأول لكل باحث عن الجودة والتميز والابتكار في المنتجات والخدمات الرقمية. نطمح لبناء مجتمع رقمي عربي مزدهر يستفيد من أحدث التقنيات والمنتجات العالمية.
            </p>
          </div>

          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-yellow-500">
              <StarIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">مهمتنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              تقديم منتجات وخدمات رقمية عالية الجودة بأسعار منافسة وشفافة، مع التزام تام بمعايير الخدمة المتميزة ورضا العملاء في كل خطوة من خطوات رحلة التسوق. نسعى لتمكين المستخدم العربي من الوصول لأفضل الأدوات والموارد الرقمية بسهولة وأمان.
            </p>
          </div>

          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-purple-500">
              <DiamondIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">قيمنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              الشفافية المطلقة في التعامل، الجودة الفائقة في المنتجات، الابتكار المستمر في الخدمات، الأمان والحماية لبيانات عملائنا، والالتزام بتقديم تجربة تسوق آمنة وموثوقة ومميزة لكل عملائنا دون استثناء.
            </p>
          </div>
        </div>

        {/* What makes us different */}
        <div className="mx-auto mt-12 max-w-4xl">
          <h2 className="mb-6 text-center text-xl font-bold">ما يميزنا</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: <Shield className="size-5 text-green-500" />,
                title: "ضمان الجودة",
                desc: "نختبر كل منتج شخصياً قبل عرضه لضمان جودته وتوافقه مع المواصفات المعلنة.",
              },
              {
                icon: <TrendingUp className="size-5 text-blue-500" />,
                title: "أسعار تنافسية",
                desc: "نتفاوض مباشرة مع الموردين لنقدم لكم أفضل الأسعار دون المساس بالجودة.",
              },
              {
                icon: <Zap className="size-5 text-amber-500" />,
                title: "توصيل سريع",
                desc: "نعمل مع أفضل شركات الشحن لضمان وصول طلباتكم بأسرع وقت ممكن.",
              },
              {
                icon: <Globe className="size-5 text-purple-500" />,
                title: "وصول عالمي",
                desc: "نخدم عملاءنا في جميع أنحاء العالم العربي مع خطط توسع مستمرة.",
              },
            ].map((item) => (
              <div key={item.title} className="card-3d flex items-start gap-4 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  {item.icon}
                </div>
                <div>
                  <h3 className="mb-1 font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
