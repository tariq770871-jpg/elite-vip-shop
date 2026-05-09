"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Package,
  Users,
  Star,
  Mail,
  Bell,
  Loader2,
  Shield,
  Truck,
  BadgeCheck,
  Headphones,
  Smartphone,
  Bot,
  DollarSign,
  Palette,
  TrendingUp,
} from "lucide-react";
import { FlashDealsSection } from "@/components/sections/flash-deals-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { RecentlyViewedSection } from "@/components/sections/recently-viewed-section";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/lib/supabase-data";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { useNavigation } from "@/lib/navigation";
import { getCategoryIcon } from "@/components/icons";

const stats = [
  { icon: Package, value: "+500", label: "منتج" },
  { icon: Users, value: "+1000", label: "عميل" },
  { icon: Star, value: "+50", label: "تقييم" },
];

const mainSections = [
  {
    title: "المتجر",
    description: "منتجات متنوعة بأفضل الأسعار",
    icon: <ShoppingBag className="size-8" />,
    iconBg: "bg-amber-500/10 text-amber-500",
    page: "products" as const,
  },
  {
    title: "التطبيقات والأدوات",
    description: "تطبيقات وأدوات ذكية لتحسين إنتاجيتك",
    icon: <Smartphone className="size-8" />,
    iconBg: "bg-blue-500/10 text-blue-500",
    page: "apps" as const,
  },
  {
    title: "الخدمات",
    description: "تصميم وتطوير وتسويق رقمي",
    icon: <Palette className="size-8" />,
    iconBg: "bg-orange-500/10 text-orange-500",
    page: "services" as const,
  },
  {
    title: "التداول",
    description: "تعليم وأدوات وشروحات التداول",
    icon: <TrendingUp className="size-8" />,
    iconBg: "bg-teal-500/10 text-teal-500",
    page: "trading" as const,
  },
  {
    title: "الربح من الإنترنت",
    description: "طرق وأفكار واستراتيجيات الربح",
    icon: <DollarSign className="size-8" />,
    iconBg: "bg-amber-500/10 text-amber-500",
    page: "earning" as const,
  },
  {
    title: "أدوات الذكاء الاصطناعي",
    description: "أقوى أدوات AI لتعزيز عملك",
    icon: <Bot className="size-8" />,
    iconBg: "bg-violet-500/10 text-violet-500",
    page: "ai-tools" as const,
  },
];

function ScrollSection({
  children,
  viewAllPage,
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
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    getProducts().then((prods) => {
      setAllProducts(prods);
      setLoading(false);
    });
  }, []);

  const featuredProducts = allProducts.filter((p) => p.availability).slice(0, 6);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubmitted(false), 3000);
    }
  };

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
              منصتك المتكاملة — متجر، أدوات، خدمات، تداول، وربح من الإنترنت
            </p>
            <a href="https://wa.me/967782138587" target="_blank" rel="noopener noreferrer" className="btn-3d-whatsapp flex items-center justify-center gap-3 px-8 py-4 text-base sm:px-10 sm:py-5 no-underline">
              <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              تواصل معنا عبر واتساب
            </a>
          </div>
        </div>
      </section>

      {/* Main Sections Grid */}
      <section className="py-8 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-xl font-bold md:text-2xl">استعرض أقسام المنصة</h2>
            <p className="text-sm text-muted-foreground">اختر القسم الذي يناسبك وابدأ الآن</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mainSections.map((section) => (
              <button
                key={section.page}
                onClick={() => navigateTo(section.page)}
                className="card-3d group flex items-center gap-5 p-5 text-right transition-all"
              >
                <div className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${section.iconBg}`}>
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 text-lg font-bold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <ArrowLeft className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products with WhatsApp */}
      <section className="section-gradient-products py-6 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex justify-center mb-8">
            <button onClick={() => navigateTo("products")} className="section-title-3d cursor-pointer">
              <span className="title-icon"><ShoppingBag className="size-6" /></span>
              متجر منتجات النخبة
            </button>
          </div>
          <p className="text-center text-muted-foreground mb-6 max-w-xl mx-auto">
            اكتشف أحدث المنتجات المميزة — اطلب عبر واتساب مباشرة
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="size-10 animate-spin text-gold-gradient" />
              <p className="text-muted-foreground">جارٍ تحميل المنتجات...</p>
            </div>
          ) : (
            <ScrollSection>
              {featuredProducts.map((product) => (
                <div key={product.id} className="card-3d group min-w-[220px] max-w-[260px] shrink-0 md:min-w-[260px]">
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
                      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      اطلب عبر واتساب
                    </a>
                  </div>
                </div>
              ))}
            </ScrollSection>
          )}
        </div>
      </section>

      {/* Flash Deals */}
      <FlashDealsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Stats */}
      <section className="border-y bg-card py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
                <stat.icon className="size-6 text-gold-gradient" />
                <span className="text-gold-gradient text-2xl font-bold md:text-3xl">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewedSection />

      {/* Why Choose Us */}
      <section className="py-10 md:py-14">
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "منتجات أصلية 100%", description: "جميع منتجاتنا أصلية ومضمونة بأعلى معايير الجودة" },
              { icon: Truck, title: "شحن سريع وآمن", description: "شحن سريع وآمن لجميع الطلبات مع تتبع مباشر" },
              { icon: BadgeCheck, title: "ضمان استرجاع كامل", description: "استرجع منتجك خلال 14 يوم من الاستلام بسهولة" },
              { icon: Headphones, title: "دعم فني متواصل", description: "فريق دعم متخصص متاح على مدار الساعة لمساعدتك" },
            ].map((feature) => (
              <div key={feature.title} className="card-3d p-6">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #d4a843, #f0d078, #d4a843)" }}>
                  <feature.icon className="size-7 text-black" />
                </div>
                <h3 className="mb-2 text-base font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-black via-black/95 to-black/90 py-6 md:py-10">
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-4 flex justify-center">
              <div className="icon-box" style={{ width: "64px", height: "64px", borderRadius: "20px" }}>
                <Mail className="size-8 text-gold-gradient" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-black md:text-3xl" style={{ color: "#f0d078" }}>اشترك في نشرتنا البريدية</h2>
            <p className="mb-6 text-base" style={{ color: "rgba(240, 208, 120, 0.7)" }}>احصل على أحدث العروض والمنتجات الجديدة مباشرة في بريدك الإلكتروني</p>
            {newsletterSubmitted ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 py-4" style={{ color: "#f0d078" }}>
                <Bell className="size-5" />
                <span className="text-sm font-medium">تم الاشتراك بنجاح!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col gap-3 sm:flex-row">
                <Input type="email" placeholder="أدخل بريدك الإلكتروني" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} dir="ltr" className="flex-1 rounded-xl bg-background border-border/50 text-right" required />
                <button type="submit" className="btn-3d shrink-0 flex items-center justify-center gap-2">
                  <Mail className="size-4" />
                  اشتراك
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
