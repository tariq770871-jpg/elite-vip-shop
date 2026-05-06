"use client";

import { useRef, useState, useCallback, useEffect } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getProducts, getApps, getAiTools, getAcademyCourses, getEarningMethods } from "@/lib/supabase-data";
import type { Product, FreeItem } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { useNavStore } from "@/store/nav-store";
import type { PageName } from "@/store/nav-store";
import {
  SmartphoneIcon,
  RobotIcon,
  GraduationCapIcon,
  MoneyIcon,
  ShoppingBagIcon,
  TaskManagerIcon,
  PhotoEditorIcon,
  LanguageIcon,
  PdfScannerIcon,
  FitnessIcon,
  BudgetIcon,
  ChatBotIcon,
  ImageGeneratorIcon,
  DesignToolIcon,
  PresentationIcon,
  NotesIcon,
  VoiceIcon,
  TradingBasicsIcon,
  CryptoIcon,
  RiskShieldIcon,
  BrainIcon,
  AffiliateIcon,
  YoutubeIcon,
  EcommerceIcon,
  FreelancingIcon,
  getCategoryIcon,
} from "@/components/icons";

interface HomeSectionProps {
  onOpenCart: () => void;
}

type SectionItemIcon = React.FC<{ className?: string }>;

const stats = [
  { icon: Package, value: "+500", label: "منتج" },
  { icon: Users, value: "+1000", label: "عميل" },
  { icon: Star, value: "+50", label: "تقييم" },
];

interface FreeSectionConfig {
  title: string;
  description: string;
  page: PageName;
  headerIcon: React.ReactNode;
  iconColor: string;
  gradientClass: string;
  data: FreeItem[];
  itemIcons: SectionItemIcon[];
}

function ScrollSection({
  title,
  description,
  viewAllPage,
  sectionIcon,
  children,
}: {
  title: string;
  description?: string;
  viewAllPage?: PageName;
  sectionIcon?: React.ReactNode | null;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  const { setCurrentPage } = useNavStore();

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div className="flex items-center gap-3">
          {sectionIcon && <div className="icon-box">{sectionIcon}</div>}
          <div>
            <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {viewAllPage && (
          <button
            className="btn-3d-sm hidden sm:flex items-center gap-2"
            onClick={() => setCurrentPage(viewAllPage)}
          >
            عرض الكل
            <ArrowLeft className="size-4" />
          </button>
        )}
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -right-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110 md:-right-4 md:size-9"
            aria-label="السابق"
          >
            <ChevronRight className="size-4" />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -left-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110 md:-left-4 md:size-9"
            aria-label="التالي"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
        >
          {children}
          {viewAllPage && (
            <div className="flex min-w-[140px] shrink-0 flex-col items-center justify-center gap-2">
              <button
                className="btn-3d-sm sm:hidden"
                onClick={() => setCurrentPage(viewAllPage)}
              >
                عرض الكل
                <ArrowLeft className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HomeSection({ onOpenCart }: HomeSectionProps) {
  const { setCurrentPage } = useNavStore();
  const addItem = useCartStore((s) => s.addItem);
  const sectionsRef = useRef<HTMLDivElement>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [appsData, setAppsData] = useState<FreeItem[]>([]);
  const [aiToolsData, setAiToolsData] = useState<FreeItem[]>([]);
  const [academyData, setAcademyData] = useState<FreeItem[]>([]);
  const [earningData, setEarningData] = useState<FreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getApps(),
      getAiTools(),
      getAcademyCourses(),
      getEarningMethods(),
    ]).then(([prods, apps, ai, academy, earning]) => {
      setAllProducts(prods);
      setAppsData(apps);
      setAiToolsData(ai);
      setAcademyData(academy);
      setEarningData(earning);
      setLoading(false);
    });
  }, []);

  const freeSections: FreeSectionConfig[] = [
    {
      title: "التطبيقات",
      description: "تطبيقات مجانية مختارة لتحسين إنتاجيتك",
      page: "apps" as PageName,
      headerIcon: <SmartphoneIcon className="size-8" />,
      iconColor: "text-blue-500",
      gradientClass: "section-gradient-apps",
      data: appsData,
      itemIcons: [TaskManagerIcon, PhotoEditorIcon, LanguageIcon, PdfScannerIcon, FitnessIcon, BudgetIcon] as SectionItemIcon[],
    },
    {
      title: "أدوات الذكاء الاصطناعي",
      description: "أقوى أدوات AI لتعزيز عملك وإبداعك",
      page: "ai-tools" as PageName,
      headerIcon: <RobotIcon className="size-8" />,
      iconColor: "text-violet-500",
      gradientClass: "section-gradient-ai",
      data: aiToolsData,
      itemIcons: [ChatBotIcon, ImageGeneratorIcon, DesignToolIcon, PresentationIcon, NotesIcon, VoiceIcon] as SectionItemIcon[],
    },
    {
      title: "أكاديمية التداول",
      description: "تعلم التداول من الصفر حتى الاحتراف",
      page: "academy" as PageName,
      headerIcon: <GraduationCapIcon className="size-8" />,
      iconColor: "text-emerald-500",
      gradientClass: "section-gradient-academy",
      data: academyData,
      itemIcons: [TradingBasicsIcon, CryptoIcon, RiskShieldIcon, BrainIcon] as SectionItemIcon[],
    },
    {
      title: "الربح من الإنترنت",
      description: "اكتشف أفضل الطرق لتحقيق دخل إضافي",
      page: "earning" as PageName,
      headerIcon: <MoneyIcon className="size-8" />,
      iconColor: "text-amber-500",
      gradientClass: "section-gradient-earning",
      data: earningData,
      itemIcons: [AffiliateIcon, YoutubeIcon, EcommerceIcon, FreelancingIcon] as SectionItemIcon[],
    },
  ];

  const featuredProducts = allProducts
    .filter((p) => p.availability)
    .slice(0, 6);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0],
      category: product.category,
    });
    onOpenCart();
  };

  const scrollToSections = () => {
    sectionsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

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
      <section className="relative overflow-hidden bg-gradient-to-bl from-black via-black/95 to-black/90 py-10 md:py-20">
        {/* Animated shimmer overlay */}
        <div className="hero-shimmer absolute inset-0" />
        {/* Gold corner accents */}
        <div className="absolute top-0 right-0 h-40 w-40">
          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-gold/80 to-transparent" />
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-gold/80 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 h-40 w-40">
          <div className="absolute bottom-0 left-0 h-full w-1 bg-gradient-to-t from-gold/80 to-transparent" />
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-gold/80 to-transparent" />
        </div>
        {/* Glow orbs */}
        <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-gold/5 blur-[100px]" />
        <div className="absolute bottom-20 left-1/4 h-48 w-48 rounded-full bg-gold/5 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Decorative line */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-16 bg-gradient-to-l from-gold/80 to-transparent" />
              <span className="text-sm font-bold text-gold/80">مرحباً بكم في</span>
              <div className="h-px w-16 bg-gradient-to-r from-gold/80 to-transparent" />
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight sm:text-6xl md:text-8xl lg:text-9xl">
              <span className="text-gold-gradient">ELITE VIP SHOP</span>
            </h1>
            <p className="hidden mb-2 text-2xl font-light sm:block md:text-4xl" style={{color: '#f0d078'}}>متجر النخبة</p>
            <p className="mb-10 max-w-xl text-base md:text-xl" style={{color: 'rgba(240, 208, 120, 0.8)'}}>
              اكتشف منتجات وخدمات متميزة بأفضل الأسعار — تجربة تسوق فاخرة تستحقها
            </p>
            <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
              <button
                className="btn-3d flex items-center justify-center gap-3 px-10 py-5 text-lg md:text-xl"
                onClick={() => setCurrentPage("products")}
              >
                <ShoppingBag className="size-6 md:size-7" />
                متجر المنتجات
              </button>
              <button
                className="btn-3d flex items-center justify-center gap-3 px-10 py-5 text-lg md:text-xl"
                onClick={scrollToSections}
              >
                استعرض الأقسام
                <ArrowLeft className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <Loader2 className="size-10 animate-spin text-gold-gradient" />
          <p className="text-muted-foreground text-lg">جارٍ تحميل المحتوى...</p>
        </div>
      ) : (
        <>
          {/* متجر منتجات النخبة - Products Horizontal Scroll */}
          <section className="section-gradient-products py-8 md:py-12">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
              {/* Section title as luxury 3D button - clickable */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setCurrentPage("products")}
                  className="section-title-3d cursor-pointer"
                >
                  <span className="title-icon">
                    <ShoppingBagIcon className="size-6" />
                  </span>
                  متجر منتجات النخبة
                </button>
              </div>
              <p className="text-center text-muted-foreground mb-6 max-w-xl mx-auto">
                اكتشف أحدث المنتجات المميزة بأفضل الأسعار — جودة فاخرة وتجربة تسوق استثنائية
              </p>
              <ScrollSection
                title=""
                description=""
                viewAllPage="products"
                sectionIcon={null}
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="card-3d group min-w-[220px] max-w-[260px] shrink-0 md:min-w-[260px]"
                  >
                    <div
                      className="product-img-placeholder bg-muted cursor-pointer transition-opacity hover:opacity-80 active:scale-[0.98]"
                      onClick={() => setCurrentPage("products")}
                    >
                      {getCategoryIcon(product.category, "size-12 text-muted-foreground/40")}
                      <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">اضغط للعرض</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <Badge className="mb-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-xs font-semibold text-gold-gradient border border-amber-500/20">
                        {product.category}
                      </Badge>
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
                      <button className="btn-3d-sm w-full text-sm flex items-center justify-center gap-2" onClick={() => handleAddToCart(product)}>
                        <ShoppingBag className="size-4" />
                        أضف للسلة
                      </button>
                    </div>
                  </div>
                ))}
              </ScrollSection>
            </div>
          </section>

          {/* Free Sections with Horizontal Scroll - Luxury Cards */}
          <section className="bg-muted/30 py-8 md:py-10" ref={sectionsRef}>
            <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-8">
              {freeSections.map((section) => (
                <div key={section.page} className={`${section.gradientClass} rounded-3xl p-5 md:p-8 border border-border/30`}>
                  {/* Section title as luxury 3D button */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="icon-box" style={{ width: "52px", height: "52px" }}>
                        {section.headerIcon}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold md:text-xl">{section.title}</h2>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <button
                      className="btn-3d-sm hidden sm:flex items-center gap-2 shrink-0"
                      onClick={() => setCurrentPage(section.page)}
                    >
                      عرض الكل
                      <ArrowLeft className="size-4" />
                    </button>
                  </div>
                  <ScrollSection
                    title=""
                    description=""
                    viewAllPage={section.page}
                    sectionIcon={null}
                  >
                    {section.data.map((item, index) => {
                      const ItemIcon = section.itemIcons[index] || TaskManagerIcon;
                      return (
                        <div
                          key={item.id}
                          className="card-3d group min-w-[220px] max-w-[260px] shrink-0 cursor-pointer p-5 md:min-w-[260px]"
                          onClick={() => setCurrentPage(section.page)}
                        >
                          <div className={`icon-box mb-4 transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${section.iconColor}`}>
                            <ItemIcon className="size-7" />
                          </div>
                          <h3 className="mb-2 line-clamp-1 text-base font-bold">{item.title}</h3>
                          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                          <button className="btn-3d-sm w-full text-sm" onClick={(e) => { e.stopPropagation(); setCurrentPage(section.page); }}>
                            عرض التفاصيل
                          </button>
                        </div>
                      );
                    })}
                  </ScrollSection>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Stats Section */}
      <section className="border-y bg-card py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <stat.icon className="size-6 text-gold-gradient" />
                <span className="text-gold-gradient text-2xl font-bold md:text-3xl">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-black via-black/95 to-black/90 py-8 md:py-10">

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-4 flex justify-center">
              <div className="icon-box" style={{ width: "64px", height: "64px", borderRadius: "20px" }}>
                <Mail className="size-8 text-gold-gradient" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-black md:text-3xl" style={{color: '#f0d078'}}>
              اشترك في نشرتنا البريدية
            </h2>
            <p className="mb-6 text-base" style={{color: 'rgba(240, 208, 120, 0.7)'}}>
              احصل على أحدث العروض والمنتجات الجديدة مباشرة في بريدك الإلكتروني
            </p>
            {newsletterSubmitted ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 py-4" style={{color: '#f0d078'}}>
                <Bell className="size-5" />
                <span className="text-sm font-medium">تم الاشتراك بنجاح! شكراً لك</span>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletter}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  dir="ltr"
                  className="flex-1 rounded-xl bg-background border-border/50 text-right"
                  required
                />
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
