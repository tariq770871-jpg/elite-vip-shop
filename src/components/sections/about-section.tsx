"use client";

import { TargetIcon, StarIcon, DiamondIcon } from "@/components/icons";
import {
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Heart,
  Eye,
  Users,
  Clock,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  Award,
  Package,
  Headphones,
  Rocket,
} from "lucide-react";
import { useEffect } from "react";

const stats = [
  { value: "500+", label: "عميل سعيد", icon: Heart },
  { value: "1000+", label: "منتج", icon: Package },
  { value: "24/7", label: "دعم متواصل", icon: Headphones },
  { value: "50+", label: "خدمة رقمية", icon: Globe },
];

const teamValues = [
  {
    icon: Shield,
    title: "الشفافية",
    description: "نوفر معلومات واضحة وصادقة عن كل منتج وخدمة نقدمها",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Award,
    title: "الجودة",
    description: "نختار منتجاتنا بعناية فائقة لضمان أعلى معايير الجودة",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Clock,
    title: "السرعة",
    description: "تواصل سريع عبر واتساب وشحن فوري لجميع الطلبات",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Heart,
    title: "الاحترام",
    description: "نحترم خصوصية عملائنا ونقدر ثقتهم بنا",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Eye,
    title: "المصداقية",
    description: "نلتزم بوعودنا ونسعى دائماً لتجاوز توقعاتكم",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Users,
    title: "التعاون",
    description: "نعمل كفريق واحد لتحقيق أفضل تجربة لعملائنا",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
];

const trustBadges = [
  {
    icon: CreditCard,
    title: "دفع آمن",
    description: "طرق دفع موثوقة وآمنة",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Truck,
    title: "شحن سريع",
    description: "توصيل سريع مع تتبع",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Lock,
    title: "حماية البيانات",
    description: "خصوصيتك أولويتنا",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: CheckCircle2,
    title: "منتجات أصلية",
    description: "100% منتجات أصلية ومضمونة",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Rocket,
    title: "خدمة فورية",
    description: "رد سريع على جميع الاستفسارات",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Award,
    title: "ضمان الاسترجاع",
    description: "استرجاع خلال 14 يوم",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

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

        {/* Company Story / Origin */}
        <div className="mx-auto mb-12 max-w-4xl">
          <div className="card-3d overflow-hidden">
            {/* Story Header Banner */}
            <div className="relative bg-gradient-to-l from-black via-black/95 to-black/90 px-6 py-8 md:px-10 md:py-10">
              <div className="hero-shimmer absolute inset-0" />
              <div className="relative text-center">
                <Rocket className="mx-auto mb-3 size-8 text-gold" />
                <h2 className="mb-2 text-2xl font-black text-gold-gradient md:text-3xl">
                  قصتنا
                </h2>
                <p className="text-sm text-gold-foreground/70">
                  من فكرة بسيطة إلى منصة يثق بها الآلاف
                </p>
              </div>
            </div>
            {/* Story Content */}
            <div className="space-y-5 p-6 md:p-8">
              <p className="text-muted-foreground leading-8 text-base">
                بدأت قصة{" "}
                <span className="text-gold-gradient font-bold">
                  Elite VIP Shop - متجر النخبة
                </span>{" "}
                من حاجة حقيقية في السوق العربي لمنصة إلكترونية موثوقة تجمع بين
                المنتجات عالية الجودة، التطبيقات والأدوات المفيدة، والخدمات الرقمية
                المتنوعة. أسسنا المتجر على مبدأ الثقة والشفافية، ليكون وجهة أولى لكل
                من يبحث عن تجربة تسوق إلكترونية استثنائية.
              </p>
              <p className="text-muted-foreground leading-8 text-base">
                في قسم التطبيقات والأدوات، نقدم روابط تحميل من المصادر الرسمية مثل
                Google Play، لضمان حصولكم على التطبيقات بأمان. نحرص على انتقاء
                التطبيقات والأدوات المفيدة التي تساعدكم في تحسين الإنتاجية وتسهيل
                حياتكم الرقمية.
              </p>
              <p className="text-muted-foreground leading-8 text-base">
                جميع الطلبات تتم عبر واتساب مباشرة لضمان تواصل سهل وسريع بيننا وبين
                عملائنا. نؤمن بأن التواصل المباشر هو مفتاح بناء الثقة، ولهذا حرصنا
                على أن يكون كل عميل يحظى باهتمام شخصي وفردي.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement with Visual Emphasis */}
        <div className="mx-auto mb-12 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-bl from-primary/10 via-transparent to-primary/5 p-8 md:p-10 text-center">
            <div className="absolute -top-6 -right-6 size-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gold-gradient">
                <TargetIcon className="size-8 text-black" />
              </div>
              <h2 className="mb-4 text-2xl font-black md:text-3xl">
                مهمتنا
              </h2>
              <p className="text-lg leading-9 text-muted-foreground md:text-xl">
                توفير تجربة تسوق{" "}
                <span className="text-gold-gradient font-bold">آمنة وشفافة</span>{" "}
                عبر واتساب، مع تقديم تطبيقات وأدوات من المصادر الرسمية، ونسعى لأن
                نكون{" "}
                <span className="text-gold-gradient font-bold">
                  المنصة الأكثر ثقة
                </span>{" "}
                في العالم العربي للتسوق الإلكتروني والخدمات الرقمية.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mx-auto mb-12 max-w-4xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="card-3d flex flex-col items-center p-5 text-center md:p-6"
              >
                <div className="icon-box mb-3" style={{ width: "48px", height: "48px" }}>
                  <stat.icon className="size-6 text-amber-500" />
                </div>
                <span className="text-gold-gradient text-2xl font-black md:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vision, Mission, Values Cards */}
        <div className="mx-auto mb-12 grid max-w-4xl gap-6 md:grid-cols-3">
          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-amber-500">
              <TargetIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">رؤيتنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              أن نكون منصة موثوقة تقدم منتجات وخدمات رقمية بجودة عالية وأسعار
              مناسبة.
            </p>
          </div>

          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-yellow-500">
              <StarIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">مهمتنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              توفير تجربة تسوق آمنة وشفافة عبر واتساب، مع تقديم تطبيقات وأدوات من
              المصادر الرسمية.
            </p>
          </div>

          <div className="card-3d flex flex-col items-center p-6 text-center">
            <div className="icon-box mb-4 text-purple-500">
              <DiamondIcon className="size-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold">قيمنا</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              الشفافية في العروض والأسعار، جودة المنتجات، سرعة التواصل عبر واتساب،
              واحترام خصوصية العملاء.
            </p>
          </div>
        </div>

        {/* Team Values with Icons */}
        <div className="mx-auto mb-12 max-w-5xl">
          <h2 className="mb-8 text-center text-xl font-bold md:text-2xl">
            قيمنا الأساسية
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamValues.map((value) => (
              <div
                key={value.title}
                className="card-3d flex items-start gap-4 p-5"
              >
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${value.bg}`}
                >
                  <value.icon className={`size-6 ${value.color}`} />
                </div>
                <div>
                  <h3 className="mb-1 font-bold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What makes us different */}
        <div className="mx-auto mb-12 max-w-4xl">
          <h2 className="mb-6 text-center text-xl font-bold md:text-2xl">
            ما يميزنا
          </h2>
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
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-xl font-bold md:text-2xl">
            لماذا تثق بنا
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="card-3d flex flex-col items-center p-4 text-center"
              >
                <div
                  className={`mb-3 flex size-12 items-center justify-center rounded-xl ${badge.bg}`}
                >
                  <badge.icon className={`size-6 ${badge.color}`} />
                </div>
                <h3 className="mb-1 text-sm font-bold">{badge.title}</h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
