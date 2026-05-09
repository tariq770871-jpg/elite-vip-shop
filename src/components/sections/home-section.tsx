"use client";

import { useRef, useState, useEffect } from "react";
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
} from "lucide-react";
import { FlashDealsSection } from "@/components/sections/flash-deals-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { RecentlyViewedSection } from "@/components/sections/recently-viewed-section";
import { BlogSection } from "@/components/sections/blog-section";
import { CTASection } from "@/components/sections/cta-section";
import { getProducts } from "@/lib/supabase-data";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { useNavigation } from "@/lib/navigation";
import { getCategoryIcon } from "@/components/icons";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

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
  viewAllPage?: string;
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
        <button onClick={() => scroll("left")} className="absolute -right-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110" aria-label="السابق">
          <ChevronRight className="size-4" />
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll("right")} className="absolute -left-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110" aria-label="التالي">
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
  const { navigateTo } = useNavigation();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getProducts().then((prods) => {
      setAllProducts(prods);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const featuredProducts = allProducts.filter((p) => p.availability).slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-black via-black/95 to-black/90 py-8 md:py-20">
        <div className="hero-shimmer absolute inset-0" />
        <div className="absolute top-0 right-0 h-40 w-40">
          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-gold/80 to-transparent" />
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-gold/80 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 h-40 w-40">
          <div className="absolute bottom-0 left-0 h-full w-1 bg-gradient-to-t from-gold/80 to-transparent" />
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-gold/80 to-transparent" />
        </div>
        <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-gold/5 blur-[100px]" />
        <div className="absolute bottom-20 left-1/4 h-48 w-48 rounded-full bg-gold/5 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-16 bg-gradient-to-l from-gold/80 to-transparent" />
              <span className="text-sm font-bold text-gold/80">مرحباً بكم في</span>
              <div className="h-px w-16 bg-gradient-to-r from-gold/80 to-transparent" />
            </div>
            <h1 className="mb-3 text-3xl font-black leading-tight sm:text-5xl md:text-7xl lg:text-9xl">
              <span className="text-gold-gradient">ELITE VIP SHOP</span>
            </h1>
            <p className="hidden mb-2 text-2xl font-light sm:block md:text-4xl" style={{ color: "#f0d078" }}>متجر النخبة</p>
            <p className="mb-6 max-w-xl text-sm md:text-xl" style={{ color: "rgba(240, 208, 120, 0.8)" }}>
              منصة تجمع بين متجر المنتجات، التطبيقات والأدوات، والخدمات الرقمية. الطلب يتم عبر واتساب والتطبيقات تُحمّل من مصادرها الرسمية.
            </p>
            <a href="https://wa.me/967782138587" target="_blank" rel="noopener noreferrer" className="btn-3d-whatsapp flex items-center justify-center gap-3 px-8 py-4 text-base sm:px-10 sm:py-5 no-underline">
              <WhatsAppIcon size={24} className="size-6" />
              تواصل معنا عبر واتساب
            </a>
          </div>
        </div>
      </section>

      {/* ===== 5 GATEWAYS ===== */}
      <section className="relative py-8 md:py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-8 text-center md:mb-10">
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
                className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-b ${section.accentLight} p-4 sm:p-6 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${section.borderAccent} hover:-translate-y-1 min-h-[180px] sm:min-h-[220px]`}
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
          <div className="flex justify-center mb-6 md:mb-8">
            <button onClick={() => navigateTo("products")} className="section-title-3d cursor-pointer">
              <span className="title-icon"><ShoppingBag className="size-6" /></span>
              متجر منتجات النخبة
            </button>
          </div>
          <p className="text-center text-muted-foreground mb-6 max-w-xl mx-auto text-sm md:text-base">
            تصفح منتجاتنا المتنوعة — اطلب عبر واتساب مباشرة
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="size-10 animate-spin text-gold-gradient" />
              <p className="text-muted-foreground">جارٍ تحميل المنتجات...</p>
            </div>
          ) : (
            <ScrollSection>
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="card-3d group min-w-[220px] max-w-[260px] shrink-0 md:min-w-[260px]">
                  <div className="product-img-placeholder relative bg-muted">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" priority={index < 3} loading={index < 3 ? undefined : "lazy"} />
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
                    <a
                      href={getWhatsAppOrderLink(product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-3d-whatsapp w-full flex items-center justify-center gap-2 text-xs no-underline !py-3 !rounded-xl"
                    >
                      <WhatsAppIcon size={16} className="size-4" />
                      اطلب عبر واتساب
                    </a>
                  </div>
                </div>
              ))}
            </ScrollSection>
          )}
        </div>
      </section>

      {/* CTA after products section */}
      <CTASection
        title="هل أعجبك منتج؟ اطلبه الآن عبر واتساب"
        description="تواصل معنا مباشرة عبر واتساب لطلب أي منتج أو الاستفسار عن الأسعار والتوفر"
        buttonText="اطلب الآن عبر واتساب"
        whatsappMessage="مرحباً، أريد طلب منتج من متجركم"
      />

      {/* Flash Deals */}
      <FlashDealsSection />

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
                  className="mt-auto flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-primary/80"
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
      <CTASection
        title="ابدأ مشروعك الرقمي اليوم"
        description="فريقنا جاهز لتحويل أفكارك إلى واقع رقمي احترافي — تواصل معنا الآن"
        buttonText="ابدأ مشروعك الآن"
        whatsappMessage="مرحباً، أريد الاستفسار عن الخدمات الرقمية لبدء مشروعي"
      />

      {/* Blog Section */}
      <BlogSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Recently Viewed */}
      <RecentlyViewedSection />

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
      <CTASection
        title="تواصل معنا الآن واحصل على استشارة مجانية"
        description="لا تتردد في التواصل معنا لأي استفسار أو طلب — فريقنا جاهز لخدمتك على مدار الساعة"
        buttonText="احصل على استشارة مجانية"
        whatsappMessage="مرحباً، أريد الحصول على استشارة مجانية حول خدماتكم"
      />
    </div>
  );
}
