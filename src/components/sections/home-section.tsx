"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Shield,
  Truck,
  BadgeCheck,
  Headphones,
  Smartphone,
  DollarSign,
  Palette,
  TrendingUp,
  Sparkles,
  Zap,
  Rocket,
  Globe,
  BarChart3,
  ShoppingCart,
} from "lucide-react";
import { DeferredSection } from "@/components/deferred-section";

const CTASection = dynamic(
  () => import("@/components/sections/cta-section").then((mod) => mod.CTASection),
  { ssr: false },
);
const FlashDealsSection = dynamic(
  () => import("@/components/sections/flash-deals-section").then((mod) => mod.FlashDealsSection),
  { ssr: false },
);
const TestimonialsSection = dynamic(
  () => import("@/components/sections/testimonials-section").then((mod) => mod.TestimonialsSection),
  { ssr: false },
);
const RecentlyViewedSection = dynamic(
  () => import("@/components/sections/recently-viewed-section").then((mod) => mod.RecentlyViewedSection),
  { ssr: false },
);
const BlogSection = dynamic(
  () => import("@/components/sections/blog-section").then((mod) => mod.BlogSection),
);
import { getProducts } from "@/lib/supabase-data";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { useNavigation } from "@/lib/navigation";
import { getCategoryIcon } from "@/components/icons";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { OrderModal } from "@/components/order-modal";
import { WHATSAPP_LINK } from "@/lib/site-config";

const mainSections = [
  {
    title: "المتجر",
    description: "منتجات متنوعة وأصلية — اطلب عبر واتساب مباشرة مع توصيل آمن",
    cta: "تسوق الآن",
    icon: <ShoppingBag className="size-7" />,
    accent: "from-amber-500 to-yellow-600",
    accentLight: "from-amber-500/15 to-yellow-600/5",
    iconBg: "bg-amber-500/15 text-amber-500",
    borderAccent: "hover:border-amber-500/40",
    page: "products" as const,
  },
  {
    title: "التطبيقات والأدوات",
    description: "تطبيقات وأدوات ذكية — التحميل من المصادر الرسمية مثل Google Play",
    cta: "استكشف الأدوات",
    icon: <Smartphone className="size-7" />,
    accent: "from-violet-500 to-purple-600",
    accentLight: "from-violet-500/15 to-purple-600/5",
    iconBg: "bg-violet-500/15 text-violet-500",
    borderAccent: "hover:border-violet-500/40",
    page: "apps" as const,
  },
  {
    title: "الخدمات",
    description: "خدمات تصميم وتطوير وتسويق رقمي — تواصل عبر واتساب لطلب خدمتك",
    cta: "اطلب خدمة",
    icon: <Palette className="size-7" />,
    accent: "from-orange-500 to-red-500",
    accentLight: "from-orange-500/15 to-red-500/5",
    iconBg: "bg-orange-500/15 text-orange-500",
    borderAccent: "hover:border-orange-500/40",
    page: "services" as const,
  },
  {
    title: "التداول",
    description: "محتوى تعليمي وشروحات احترافية في عالم التداول والاستثمار",
    cta: "ابدأ التداول",
    icon: <TrendingUp className="size-7" />,
    accent: "from-teal-500 to-cyan-600",
    accentLight: "from-teal-500/15 to-cyan-600/5",
    iconBg: "bg-teal-500/15 text-teal-500",
    borderAccent: "hover:border-teal-500/40",
    page: "trading" as const,
  },
  {
    title: "الربح من الإنترنت",
    description: "أفكار ومحتوى تعليمي متميز للربح من الإنترنت والعمل الحر",
    cta: "اكسب الآن",
    icon: <DollarSign className="size-7" />,
    accent: "from-emerald-500 to-green-600",
    accentLight: "from-emerald-500/15 to-green-600/5",
    iconBg: "bg-emerald-500/15 text-emerald-500",
    borderAccent: "hover:border-emerald-500/40",
    page: "earning" as const,
  },
];

function ScrollSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button type="button" onClick={() => scroll("left")} className="absolute -right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110" aria-label="المنتجات السابقة">
          <ChevronRight className="size-4" />
        </button>
      )}
      {canScrollRight && (
        <button type="button" onClick={() => scroll("right")} className="absolute -left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110" aria-label="المنتجات التالية">
          <ChevronLeft className="size-4" />
        </button>
      )}
      <div ref={scrollRef} onScroll={checkScroll} className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </div>
  );
}

export function HomeSection() {
  const { navigateTo, navigateToProduct } = useNavigation();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  useEffect(() => {
    getProducts()
      .then((prods) => setAllProducts(prods))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = allProducts.filter((p) => p.availability).slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-shell relative overflow-hidden py-10 sm:py-14 lg:py-20">
        <div className="hero-shimmer pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-gold/10 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gold/10 blur-[90px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
          <div className="hero-copy text-center lg:text-right">
            <div className="hero-kicker mx-auto mb-5 lg:mx-0">
              <Sparkles className="size-3.5" aria-hidden="true" />
              وجهتك الرقمية المتكاملة
            </div>
            <h1 className="hero-title mb-5 text-4xl font-black text-white sm:text-6xl lg:text-7xl">
              كل ما تحتاجه،<br />
              <span className="text-gold-gradient">بلمسة نخبة</span>
            </h1>
            <p className="mx-auto mb-7 max-w-2xl text-sm leading-8 text-white/70 sm:text-base lg:mx-0 lg:text-lg">
              منتجات مختارة، خدمات رقمية احترافية، وأدوات تساعدك على الانتقال من الفكرة إلى النتيجة بثقة وسهولة.
            </p>
            <div className="hero-actions justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => navigateTo("products")}
                className="btn-3d inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base"
              >
                <ShoppingBag className="size-5" aria-hidden="true" />
                اكتشف المتجر
              </button>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hero-secondary-action">
                <WhatsAppIcon size={19} className="size-5" aria-hidden="true" />
                تحدث مع مستشار
              </a>
            </div>
            <div className="hero-proof mt-7 justify-center lg:justify-start">
              <span><Shield className="size-4" aria-hidden="true" /> جودة موثوقة</span>
              <span><Truck className="size-4" aria-hidden="true" /> توصيل آمن</span>
              <span><Headphones className="size-4" aria-hidden="true" /> دعم مباشر</span>
            </div>
          </div>

          {/* On narrow screens, show the value proposition before the decorative image. */}
          <div className="hero-showcase order-none sm:min-h-[27rem] lg:order-none">
            <div className="hero-showcase-badge hero-showcase-badge--top">
              <BadgeCheck className="size-4 text-emerald-400" aria-hidden="true" />
              مختارات النخبة
            </div>
            <div className="hero-showcase-image">
              <Image
                src="/products/product-1.webp"
                alt="منتج مختار من متجر النخبة"
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 55vw, 480px"
              />
            </div>
            <div className="hero-showcase-badge hero-showcase-badge--bottom">
              <Zap className="size-4" aria-hidden="true" />
              تجربة شراء أبسط
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5 GATEWAYS ===== */}
      <section className="relative py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="section-intro mb-8 md:mb-10">
            <div className="mb-3 flex justify-center">
              <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #d4a843, #f0d078, #d4a843)" }}>
                <Sparkles className="size-6 text-black" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold md:text-3xl">مرحباً بك في منصة النخبة</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">اختر البوابة التي تناسبك واستمتع بتجربة فريدة</p>
          </div>

          {/* 5 Gateways — Desktop: row of 5, Tablet: 3+2, Mobile: 2+2+1 */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
            {mainSections.map((section) => (
              <button
                key={section.page}
                onClick={() => navigateTo(section.page)}
                className={`gateway-card group relative flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-b ${section.accentLight} p-4 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${section.borderAccent} sm:p-6`}
              >
                {/* Gold gradient accent line at top */}
                <div className={`absolute top-0 right-4 left-4 h-[3px] rounded-b-full bg-gradient-to-l ${section.accent} opacity-60 transition-opacity group-hover:opacity-100`} />

                <div className={`flex size-14 sm:size-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${section.iconBg}`}>
                  {section.icon}
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <h3 className="text-sm sm:text-base font-bold">{section.title}</h3>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-muted-foreground line-clamp-2">{section.description}</p>
                </div>
                <div className={`mt-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-l ${section.accent} px-4 py-2 text-xs font-bold text-white opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-md`}>
                  <span>{section.cta}</span>
                  <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products with WhatsApp */}
      <section className="section-gradient-products py-6 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-9">
            <div>
              <span className="section-kicker mb-3 text-[11px] text-primary">مختارات النخبة</span>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">متجر منتجات النخبة</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                تصفح منتجاتنا المتنوعة واختر طريقة الطلب الأنسب لك.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo("products")}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-primary/30 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10 sm:self-auto"
            >
              عرض كل المنتجات
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="size-10 animate-spin text-gold-gradient" />
              <p className="text-muted-foreground">جارٍ تحميل المنتجات...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <ScrollSection>
              {featuredProducts.map((product) => (
                <article key={product.id} className="product-card card-3d group shrink-0">
                  <div className="product-img-placeholder relative bg-muted">
                    {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />
                    ) : (
                      getCategoryIcon(product.category, "size-12 text-muted-foreground/40")
                    )}
                    {product.salePrice && (
                      <span className="absolute top-3 right-3 rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        خصم {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 line-clamp-1 text-sm font-bold">{product.name}</h3>
                    <button
                      type="button"
                      onClick={() => navigateToProduct(product.id)}
                      className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
                    >
                      عرض التفاصيل
                      <ArrowLeft className="size-3" aria-hidden="true" />
                    </button>
                    <div className="mb-4 flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-gold-gradient text-lg font-extrabold">{product.salePrice} ر.ي</span>
                          <span className="text-xs text-muted-foreground line-through">{product.price} ر.ي</span>
                        </>
                      ) : (
                        <span className="text-lg font-extrabold text-gold-gradient">{product.price} ر.ي</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Golden Order Button */}
                      <button
                        type="button"
                        onClick={() => { setOrderingProduct(product); setOrderModalOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-2 text-xs !py-3 !rounded-xl
                          bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold
                          shadow-md shadow-amber-500/20 hover:shadow-amber-500/30
                          transition-all active:scale-[0.98]"
                      >
                        <ShoppingCart className="size-4" />
                        اطلب الآن
                      </button>
                      {/* Inquiry Button */}
                      <a href={getWhatsAppOrderLink(product.name)} target="_blank" rel="noopener noreferrer" aria-label={`الاستفسار عن ${product.name} عبر واتساب`}
                        className="flex size-11 shrink-0 items-center justify-center gap-1 rounded-xl border border-border bg-card text-xs font-medium transition-all hover:bg-accent no-underline">
                        <WhatsAppIcon size={14} className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </ScrollSection>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-14 text-center">
              <ShoppingBag className="size-8 text-muted-foreground/60" aria-hidden="true" />
              <p className="text-sm font-semibold">{loadError ? "تعذر تحميل المنتجات حاليًا" : "لا توجد منتجات متاحة الآن"}</p>
              <p className="text-xs text-muted-foreground">يمكنك فتح المتجر الكامل للمحاولة مرة أخرى.</p>
              <button type="button" onClick={() => navigateTo("products")} className="btn-3d-sm mt-2">فتح المتجر</button>
            </div>
          )}
        </div>
      </section>

      {/* CTA after products section */}
      <DeferredSection minHeight={220}>
        <CTASection
          title="هل أعجبك منتج؟ اطلبه الآن عبر واتساب"
          description="تواصل معنا مباشرة عبر واتساب لطلب أي منتج أو الاستفسار عن الأسعار والتوفر"
          buttonText="اطلب الآن عبر واتساب"
          whatsappMessage="مرحباً، أريد طلب منتج من متجركم"
        />
      </DeferredSection>

      {/* Flash Deals */}
      <DeferredSection minHeight={480}>
        <FlashDealsSection />
      </DeferredSection>

      {/* Quick Stats Section */}
      <section className="py-6 md:py-10">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {[
              { icon: Zap, value: "1000+", label: "منتج متوفر", color: "text-amber-500" },
              { icon: Globe, value: "50+", label: "خدمة رقمية", color: "text-violet-500" },
              { icon: Rocket, value: "500+", label: "عميل سعيد", color: "text-emerald-500" },
              { icon: BarChart3, value: "24/7", label: "دعم متواصل", color: "text-teal-500" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/50 p-4 sm:p-6 text-center transition-all hover:shadow-md hover:-translate-y-0.5">
                <stat.icon className={`size-6 sm:size-8 ${stat.color}`} />
                <span className="text-xl sm:text-2xl font-black">{stat.value}</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-6 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex justify-center mb-6 md:mb-8">
            <button onClick={() => navigateTo("services")} className="section-title-3d cursor-pointer">
              <span className="title-icon"><Palette className="size-6" /></span>
              خدماتنا الرقمية
            </button>
          </div>
          <p className="text-center text-muted-foreground mb-6 max-w-xl mx-auto text-sm md:text-base">
            خدمات احترافية بجودة عالية — صُممت لتلبية احتياجاتك الرقمية
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Palette, title: "تصميم المواقع والتطبيقات", description: "تصميم وتطوير مواقع وتطبيقات احترافية بأحدث التقنيات" },
              { icon: TrendingUp, title: "التسويق الرقمي", description: "استراتيجيات تسويقية متكاملة لزيادة مبيعاتك وانتشارك" },
              { icon: Shield, title: "استشارات تقنية", description: "استشارات متخصصة في التحول الرقمي والأمن السيبراني" },
            ].map((service) => (
              <div key={service.title} className="card-3d p-5 sm:p-6 flex flex-col gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #d4a843, #f0d078, #d4a843)" }}>
                  <service.icon className="size-6 text-black" />
                </div>
                <h3 className="text-sm sm:text-base font-bold">{service.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                <button
                  onClick={() => navigateTo("services")}
                  className="mt-auto flex items-center gap-1.5 text-xs font-bold text-amber-800 transition-colors hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200"
                >
                  اطلب خدمة
                  <ArrowLeft className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA after services section */}
      <DeferredSection minHeight={220}>
        <CTASection
          title="ابدأ مشروعك الرقمي اليوم"
          description="فريقنا جاهز لتحويل أفكارك إلى واقع رقمي احترافي — تواصل معنا الآن"
          buttonText="ابدأ مشروعك الآن"
          whatsappMessage="مرحباً، أريد الاستفسار عن الخدمات الرقمية لبدء مشروعي"
        />
      </DeferredSection>

      {/* Blog Section — server-rendered for SEO; content is static and lightweight */}
      <BlogSection />

      {/* Testimonials */}
      <DeferredSection minHeight={300}>
        <TestimonialsSection />
      </DeferredSection>

      {/* Recently Viewed */}
      <DeferredSection minHeight={160}>
        <RecentlyViewedSection />
      </DeferredSection>

      {/* Why Choose Us */}
      <section className="py-8 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="icon-box" style={{ width: "52px", height: "52px" }}>
                <BadgeCheck className="size-7 text-amber-500" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold md:text-2xl">لماذا تختارنا؟</h2>
            <p className="text-sm text-muted-foreground">نوفر لك تجربة استثنائية مع أفضل الخدمات</p>
          </div>
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "جودة مضمونة", description: "نختار منتجاتنا بعناية لضمان جودتها" },
              { icon: Truck, title: "شحن آمن", description: "شحن آمن مع إمكانية تتبع الطلبات" },
              { icon: BadgeCheck, title: "خدمة واتساب مباشرة", description: "تواصل مباشر معنا عبر واتساب للاستفسار والطلب" },
              { icon: Headphones, title: "دعم متخصص", description: "فريق دعم متخصص للإجابة على استفساراتكم" },
            ].map((feature) => (
              <div key={feature.title} className="card-3d p-5 sm:p-6 flex flex-col items-center text-center sm:items-start sm:text-start">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl shrink-0" style={{ background: "linear-gradient(135deg, #d4a843, #f0d078, #d4a843)" }}>
                  <feature.icon className="size-7 text-black" />
                </div>
                <h3 className="mb-2 text-sm sm:text-base font-bold">{feature.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA before footer */}
      <DeferredSection minHeight={220}>
        <CTASection
          title="تواصل معنا الآن واحصل على استشارة مجانية"
          description="لا تتردد في التواصل معنا لأي استفسار أو طلب — فريقنا جاهز لخدمتك على مدار الساعة"
          buttonText="احصل على استشارة مجانية"
          whatsappMessage="مرحباً، أريد الحصول على استشارة مجانية حول خدماتكم"
        />
      </DeferredSection>

      {/* Order Modal */}
      <OrderModal
        open={orderModalOpen}
        onOpenChange={setOrderModalOpen}
        product={
          orderingProduct
            ? {
                id: orderingProduct.id,
                name: orderingProduct.name,
                price: orderingProduct.price,
                salePrice: orderingProduct.salePrice,
                image: orderingProduct.images[0],
                category: orderingProduct.category,
                availability: orderingProduct.availability,
              }
            : null
        }
      />
    </div>
  );
}
