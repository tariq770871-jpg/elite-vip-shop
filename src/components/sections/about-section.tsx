"use client";

import { TargetIcon, StarIcon, DiamondIcon } from "@/components/icons";

export function AboutSection() {
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
            تعرف على قصة Elite VIP Shop ورؤيتنا لمستقبل التسوق الإلكتروني
          </p>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gold-gradient" />
        </div>

        {/* Main Content */}
        <div className="prose prose-lg mx-auto mb-12 max-w-3xl">
          <div className="card-3d p-6 md:p-8 space-y-6">
            <p className="text-muted-foreground leading-8 text-base">
              مرحباً بكم في <span className="text-gold-gradient font-bold">Elite VIP Shop</span> — متجركم الإلكتروني المتميز الذي يجمع بين الجودة العالية والأسعار المنافسة. نحن فريق من الشغوفين بالتقنية والتجارة الإلكترونية، نسعى لتقديم أفضل المنتجات والخدمات الرقمية لعملائنا في جميع أنحاء العالم العربي. بدأنا رحلتنا بحلم بسيط: أن نكون الوجهة الأولى لكل من يبحث عن التميز في عالم التسوق الرقمي.
            </p>
            <p className="text-muted-foreground leading-8 text-base">
              ما يميزنا عن غيرنا هو حرصنا الشديد على اختيار منتجاتنا بعناية فائقة. نحن لا نكتفي بعرض أي منتج، بل نقوم بتقييمه واختباره شخصياً للتأكد من جودته قبل أن نقدمه لعملائنا الكرام. فريقنا المتخصص يعمل على مدار الساعة للبحث عن أحدث المنتجات وأفضل العروض في الأسواق العالمية والإقليمية، لنضمن لكم تجربة تسوق استثنائية لا تُنسى.
            </p>
            <p className="text-muted-foreground leading-8 text-base">
              نؤمن في Elite VIP Shop بأن العميل هو محور كل ما نقوم به. لذلك نحرص على تقديم خدمة عملاء متميزة تتسم بالاحترافية والسرعة. نوفر لكم قنوات تواصل متعددة للرد على استفساراتكم وحل مشاكلكم في أسرع وقت ممكن. كذلك نحرص على تحديث محتوانا المجاني بشكل مستمر — من تطبيقات وأدوات ذكاء اصطناعي إلى دورات تعليمية — لنكون مرجعاً شاملاً لكل ما يحتاجه المستخدم العربي.
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
              أن نكون المنصة الرائدة في التجارة الإلكترونية العربية، ونكون الخيار الأول لكل باحث عن الجودة والتميز في المنتجات والخدمات الرقمية.
            </p>
          </div>

          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-yellow-500">
              <StarIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">مهمتنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              تقديم منتجات وخدمات رقمية عالية الجودة بأسعار منافسة، مع التزام تام بمعايير الخدمة المتميزة ورضا العملاء في كل خطوة من خطوات رحلة التسوق.
            </p>
          </div>

          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-purple-500">
              <DiamondIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">قيمنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              الشفافية في التعامل، الجودة في المنتجات، الابتكار في الخدمات، والالتزام بتقديم تجربة تسوق آمنة وموثوقة لكل عملائنا.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
