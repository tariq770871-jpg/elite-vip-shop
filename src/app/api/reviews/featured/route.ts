import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";
import type { SupabaseReviewRow } from "@/types/db";

/**
 * GET /api/reviews/featured
 *
 * Returns approved reviews across ALL products (for the homepage testimonials section).
 * Pinned/high-rated reviews first, then most-recent.
 *
 * Query params:
 *   limit   — max number of reviews to return (default: 10, max: 50)
 *
 * Why this exists:
 *   The regular /api/reviews endpoint requires a `product_id` param, so the
 *   testimonials section (which has no specific product context) could not
 *   fetch reviews. This endpoint returns featured reviews across all products.
 *
 * Public endpoint — no auth required (reviews are public testimonials).
 */
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit = Math.min(Math.max(isNaN(rawLimit) ? 10 : rawLimit, 1), 50);

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json(
        { error: "خدمة قاعدة البيانات غير متاحة" },
        { status: 503 }
      );
    }

    // Join with users table to get reviewer name; order by rating desc then recency
    // (highest-rated reviews first — these are the most compelling for social proof)
    const { data: reviews, error } = await serviceClient
      .from("reviews")
      .select("*, users:user_id(name)")
      .eq("is_approved", true)
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Featured reviews fetch error:", error);
      return NextResponse.json(
        { error: "فشل في جلب الآراء" },
        { status: 500 }
      );
    }

    const reviewList = (reviews || []) as SupabaseReviewRow[];
    const count = reviewList.length;
    const avgRating =
      count > 0
        ? Number(
            (reviewList.reduce((sum, r) => sum + Number(r.rating), 0) / count).toFixed(1)
          )
        : 0;

    return NextResponse.json(
      {
        reviews: reviewList,
        averageRating: avgRating,
        totalCount: count,
      },
      {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
      }
    );
  } catch (error) {
    console.error("Featured reviews API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب الآراء" },
      { status: 500 }
    );
  }
}
