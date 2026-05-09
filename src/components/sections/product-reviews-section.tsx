"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Loader2, MessageSquarePlus, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useNavStore } from "@/store/nav-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Review {
  review_id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: { name: string } | null;
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
}

interface ProductReviewsSectionProps {
  productId: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "size-5",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          onClick={() => onChange?.(star)}
          aria-label={`${star} نجوم`}
        >
          <Star
            className={`${size} ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-300 text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const [data, setData] = useState<ReviewsData>({
    reviews: [],
    averageRating: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const session = useAuthStore((s) => s.session);
  const { setCurrentPage } = useNavStore();

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
      const json = await res.json();
      if (json.reviews) {
        setData(json);
      }
    } catch {
      // Silently fail — reviews are not critical
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchReviews();
  }, [productId, fetchReviews]);

  const handleSubmit = async () => {
    if (!isAuthenticated || !session) {
      toast.error("يجب تسجيل الدخول لإضافة تقييم");
      return;
    }
    if (selectedRating === 0) {
      toast.error("يرجى اختيار التقييم");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          rating: selectedRating,
          comment: comment.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("تم إضافة تقييمك بنجاح ⭐");
        setSelectedRating(0);
        setComment("");
        fetchReviews();
      } else {
        toast.error(json.error || "فشل في إضافة التقييم");
      }
    } catch {
      toast.error("حدث خطأ في إضافة التقييم");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="mt-8">
      <div className="card-3d p-6">
        {/* Section Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquarePlus className="size-5 text-gold-gradient" />
            تقييمات المنتج
          </h2>

          {/* Average Rating Badge */}
          {data.totalCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-600/5 px-4 py-2">
              <span className="text-xl font-bold text-gold-gradient">
                {data.averageRating}
              </span>
              <StarRating value={Math.round(data.averageRating)} readonly size="size-4" />
              <span className="text-sm text-muted-foreground">
                ({data.totalCount} تقييم)
              </span>
            </div>
          )}
        </div>

        {/* Existing Reviews */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="size-6 animate-spin text-gold-gradient" />
            <p className="text-sm text-muted-foreground">جارٍ تحميل التقييمات...</p>
          </div>
        ) : data.reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <MessageSquarePlus className="size-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
            <p className="text-xs text-muted-foreground">
              كن أول من يضيف تقييم لهذا المنتج
            </p>
          </div>
        ) : (
          <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
            {data.reviews.map((review) => (
              <div
                key={review.review_id}
                className="rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* User avatar placeholder */}
                    <div className="flex size-9 items-center justify-center rounded-full bg-gold-gradient text-sm font-bold text-black">
                      {(review.profiles?.name || "م").charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {review.profiles?.name || "مستخدم"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <StarRating value={review.rating} readonly size="size-4" />
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Review Form */}
        <div className="mt-6 border-t pt-6">
          {isAuthenticated ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Star className="size-4 text-amber-400" />
                أضف تقييمك
              </h3>

              {/* Star Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">التقييم:</span>
                <div
                  className="flex items-center gap-0.5"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="cursor-pointer transition-transform hover:scale-125"
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setSelectedRating(star)}
                      aria-label={`${star} نجوم`}
                    >
                      <Star
                        className="size-6 transition-colors"
                        style={{
                          fill:
                            star <= (hoverRating || selectedRating)
                              ? "#fbbf24"
                              : "#d1d5db",
                          color:
                            star <= (hoverRating || selectedRating)
                              ? "#fbbf24"
                              : "#d1d5db",
                        }}
                      />
                    </button>
                  ))}
                </div>
                {selectedRating > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {selectedRating === 1
                      ? "سيء"
                      : selectedRating === 2
                        ? "مقبول"
                        : selectedRating === 3
                          ? "جيد"
                          : selectedRating === 4
                            ? "جيد جداً"
                            : "ممتاز"}
                  </span>
                )}
              </div>

              {/* Comment */}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="شاركنا رأيك في المنتج..."
                rows={3}
                className="resize-none"
              />

              {/* Submit */}
              <Button
                className="btn-3d-sm gap-2"
                onClick={handleSubmit}
                disabled={submitting || selectedRating === 0}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MessageSquarePlus className="size-4" />
                )}
                إرسال التقييم
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/50 p-6 text-center">
              <LogIn className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                سجل دخولك لإضافة تقييم
              </p>
              <Button
                className="btn-3d-sm gap-2"
                onClick={() => setCurrentPage("login")}
              >
                <LogIn className="size-4" />
                تسجيل الدخول
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
