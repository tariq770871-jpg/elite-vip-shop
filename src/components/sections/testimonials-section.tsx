"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronRight, ChevronLeft, Quote, BadgeCheck, ExternalLink } from "lucide-react";

// TODO: Replace static testimonials data with database-driven data
// When a backend/database is available, testimonials should be fetched from an API endpoint
// and stored in a testimonials table with fields: id, name, location, rating, text, product, avatar, date, isVerified
// Example API: GET /api/testimonials
// For now, we use static mock data

const testimonials = [
  {
    id: 1,
    name: "أحمد محمد",
    location: "صنعاء، اليمن",
    rating: 5,
    text: "تجربة رائعة مع متجر النخبة! المنتجات أصلية والشحن سريع جداً. أنصح الجميع بالتسوق من هنا.",
    product: "سماعة بلوتوث فاخرة Elite Pro",
    avatar: "أ",
    date: "منذ أسبوع",
    isVerified: true,
  },
  {
    id: 2,
    name: "سارة علي",
    location: "عدن، اليمن",
    rating: 5,
    text: "أفضل متجر إلكتروني تعاملت معه. خدمة العملاء ممتازة والأسعار منافسة جداً. شكراً لكم!",
    product: "ساعة ذكية VIP Series X",
    avatar: "س",
    date: "منذ 3 أيام",
    isVerified: true,
  },
  {
    id: 3,
    name: "خالد حسن",
    location: "تعز، اليمن",
    rating: 4,
    text: "الدورة التدريبية ممتازة ومفيدة جداً. المحتوى شامل والمقدم واضح. استفدت كثيراً.",
    product: "كورس التداول الاحترافي",
    avatar: "خ",
    date: "منذ 5 أيام",
    isVerified: true,
  },
  {
    id: 4,
    name: "نورة عبدالله",
    location: "الضالع، اليمن",
    rating: 5,
    text: "طلبتم منتجات عدة وكانت كلها بجودة عالية. التغليف ممتاز والتوصيل سريع. متجر محترف!",
    product: "باور بانك 20000mAh",
    avatar: "ن",
    date: "منذ يومين",
    isVerified: true,
  },
  {
    id: 5,
    name: "عمر يحيى",
    location: "الحديدة، اليمن",
    rating: 5,
    text: "ماوس الجيمرز رائع جداً، الجودة عالية والأداء ممتاز. أفضل ماوس استخدمته!",
    product: "ماوس لاسلكي ميكانيكي للجيمرز",
    avatar: "ع",
    date: "منذ يوم",
    isVerified: false,
  },
  {
    id: 6,
    name: "لمياء صالح",
    location: "إب، اليمن",
    rating: 5,
    text: "اشتركت في كورس التداول وكانت التجربة أكثر من رائعة. المحتوى عملي ومفيد جداً.",
    product: "كتاب أسرار الربح من الإنترنت",
    avatar: "ل",
    date: "منذ 4 أيام",
    isVerified: true,
  },
];

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="icon-box" style={{ width: "52px", height: "52px" }}>
              <Quote className="size-7 text-amber-500" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold md:text-2xl">آراء العملاء</h2>
          <p className="text-sm text-muted-foreground">تجارب عملائنا الحقيقية مع خدماتنا ومنتجاتنا</p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110"
              aria-label="السابق"
            >
              <ChevronRight className="size-4" />
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110"
              aria-label="التالي"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
          >
            {testimonials.map((review) => (
              <div
                key={review.id}
                className="card-3d min-w-[300px] max-w-[340px] shrink-0 p-5"
              >
                {/* Top: Avatar + Name + Verified */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-base font-black text-black shadow-md">
                    {review.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate text-sm font-bold">{review.name}</h4>
                      {review.isVerified && (
                        <span className="flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-green-600 dark:text-green-400">
                          <BadgeCheck className="size-3" />
                          مشترى موثق
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{review.location}</p>
                  </div>
                </div>

                {/* Stars - More visible */}
                <div className="mb-3 flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-xs font-semibold text-amber-500">
                    {review.rating}.0
                  </span>
                </div>

                {/* Review text */}
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Product badge + Date */}
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="line-clamp-1 max-w-[70%] rounded-lg bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary">
                    {review.product}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* See More Link */}
        <div className="mt-6 text-center">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/30 hover:shadow-md"
            onClick={() => window.location.href = '/about'}
          >
            <ExternalLink className="size-4" />
            شاهد المزيد من التقييمات
          </button>
        </div>
      </div>
    </section>
  );
}
