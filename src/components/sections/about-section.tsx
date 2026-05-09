"use client";

import { TargetIcon, StarIcon, DiamondIcon } from "@/components/icons";
import { Shield, Zap, TrendingUp, Globe } from "lucide-react";
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
              مرحباً بكم في <span className="text-gold-gradient font-bold">Elite VIP Shop - متجر النخبة</span>. نحن منصة إلكترونية تجمع بين متجر للمنتجات، قسم للتطبيقات والأدوات المفيدة، وخدمات رقمية متنوعة. نعمل على توفير منتجات وخدمات عالية الجودة بأسعار مناسبة لعملائنا في العالم العربي. جميع الطلبات تتم عبر واتساب مباشرة لضمان تواصل سهل وسريع بيننا وبين عملائنا.
            </p>
            <p className="text-muted-foreground leading-8 text-base">
              في قسم التطبيقات والأدوات، نقدم روابط تحميل من المصادر الرسمية مثل Google Play، لضمان حصولكم على التطبيقات بأمان. نحرص على انتقاء التطبيقات والأدوات المفيدة التي تساعدكم في تحسين الإنتاجية وتسهيل حياتكم الرقمية.
            </p>
            <p className="text-muted-foreground leading-8 text-base">
              نؤمن بأهمية الشفافية والصدق في التعامل مع عملائنا. لذلك نوفر معلومات واضحة عن كل منتج وخدمة نقدمها، مع إمكانية التواصل المباشر عبر واتساب لأي استفسار. هدفنا أن نكون منصة موثوقة تقدم قيمة حقيقية لكل زائر.
            </p>
          </div>
        </div>

        {/* Vision, Mission, Values Cards */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-amber-500">
              <TargetIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">رؤيتنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              أن نكون منصة موثوقة تقدم منتجات وخدمات رقمية بجودة عالية وأسعار مناسبة.
            </p>
          </div>

          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-yellow-500">
              <StarIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">مهمتنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              توفير تجربة تسوق آمنة وشفافة عبر واتساب، مع تقديم تطبيقات وأدوات من المصادر الرسمية.
            </p>
          </div>

          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-purple-500">
              <DiamondIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">قيمنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              الشفافية في العروض والأسعار، جودة المنتجات، سرعة التواصل عبر واتساب، واحترام خصوصية العملاء.
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
                title: "روابط رسمية للتطبيقات",
                desc: "جميع روابط التطبيقات تؤدي إلى المتاجر الرسمية مثل Google Play.",
              },
              {
                icon: <TrendingUp className="size-5 text-blue-500" />,
                title: "تواصل مباشر عبر واتساب",
                desc: "اطلب واستفسر مباشرة عبر واتساب بدون وسطاء.",
              },
              {
                icon: <Zap className="size-5 text-amber-500" />,
                title: "شحن آمن",
                desc: "نعمل على شحن الطلبات بأمان مع إمكانية التتبع.",
              },
              {
                icon: <Globe className="size-5 text-purple-500" />,
                title: "خدمة عربية",
                desc: "محتوى عربي بالكامل مع دعم عملاء باللغة العربية عبر واتساب.",
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
