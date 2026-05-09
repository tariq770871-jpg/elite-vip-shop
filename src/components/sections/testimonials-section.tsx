"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronRight, ChevronLeft, Quote, BadgeCheck, ExternalLink } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  avatar: string;
  date: string;
  isVerified: boolean;
}

export function TestimonialsSection() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews?limit=10")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.reviews && data.reviews.length > 0) {
          const mapped: Testimonial[] = data.reviews.map((r: any, i: number) => ({
            id: r.review_id || i,
            name: r.customer_name || r.user_name || "عميل",
            location: r.location || "",
            rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
            text: r.comment || r.review_text || "",
            product: r.product_name || "",
            avatar: (r.customer_name || r.user_name || "ع").charAt(0),
            date: r.created_at
              ? new Date(r.created_at).toLocaleDateString("ar-YE", { month: "short", day: "numeric" })
              : "",
            isVerified: !!r.is_verified,
          }));
          setTestimonials(mapped);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

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
        {loading ? (
          <div className="flex gap-4 overflow-hidden pb-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-3d min-w-[300px] max-w-[340px] shrink-0 p-5 animate-pulse">
                <div className="mb-3 flex items-center gap-3">
                  <div className="size-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-2 bg-muted rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Quote className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد — كن أول من يقيّم!</p>
          </div>
        ) : (
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
                    {review.location && (
                      <p className="text-[11px] text-muted-foreground">{review.location}</p>
                    )}
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
                  {review.product ? (
                    <span className="line-clamp-1 max-w-[70%] rounded-lg bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary">
                      {review.product}
                    </span>
                  ) : (
                    <span />
                  )}
                  {review.date && (
                    <span className="text-[10px] text-muted-foreground">{review.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* See More Link */}
        {testimonials.length > 0 && (
        <div className="mt-6 text-center">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/30 hover:shadow-md"
            onClick={() => router.push('/about')}
          >
            <ExternalLink className="size-4" />
            شاهد المزيد من التقييمات
          </button>
        </div>
        )}
      </div>
    </section>
  );
}
