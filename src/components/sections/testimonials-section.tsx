"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronRight, ChevronLeft, Quote } from "lucide-react";

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
          className={`size-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
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
          <p className="text-sm text-muted-foreground">تجارب عملائنا مع خدماتنا ومنتجاتنا</p>
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
                {/* Top: Avatar + Name */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-sm font-black text-black">
                    {review.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-bold">{review.name}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{review.location}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="mb-3">{renderStars(review.rating)}</div>

                {/* Review text */}
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Product badge + Date */}
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="line-clamp-1 text-[10px] text-muted-foreground">
                    {review.product}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
