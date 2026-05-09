import { NextResponse } from "next/server";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET: Fetch reviews for a product (query param: product_id)
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "معرف المنتج مطلوب" },
        { status: 400 }
      );
    }

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ reviews: [], averageRating: 0, totalCount: 0 });
    }

    const { data: reviews, error } = await serviceClient
      .from("reviews")
      .select("*, users:user_id(name)")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);
      return NextResponse.json(
        { error: "فشل في جلب التقييمات" },
        { status: 500 }
      );
    }

    // Calculate average rating and count
    const count = reviews?.length || 0;
    const avgRating =
      count > 0
        ? Number(
            (
              reviews!.reduce((sum: number, r: any) => sum + Number(r.rating), 0) /
              count
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      reviews: reviews || [],
      averageRating: avgRating,
      totalCount: count,
    });
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب التقييمات" },
      { status: 500 }
    );
  }
}

// POST: Create a new review
export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const { product_id, rating, comment } = body;

    if (!product_id || !rating) {
      return NextResponse.json(
        { error: "بيانات غير مكتملة" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "التقييم يجب أن يكون بين 1 و 5" },
        { status: 400 }
      );
    }

    const sc = getSupabaseServiceClient();
    if (!sc) {
      return NextResponse.json({ error: "النظام غير متاح حالياً" }, { status: 503 });
    }

    // Get user from Authorization header using server-side verification
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لإضافة تقييم" },
        { status: 401 }
      );
    }

    // Use service role client to bypass RLS for the insert
    const serviceClient = sc;

    // Check for existing review by this user for this product (prevent duplicates)
    const { data: existingReview } = await serviceClient
      .from("reviews")
      .select("review_id")
      .eq("product_id", product_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: "لقد قمت بتقييم هذا المنتج مسبقاً" },
        { status: 409 }
      );
    }

    // Insert the review using service role client
    const { data: review, error: insertError } = await serviceClient
      .from("reviews")
      .insert({
        product_id,
        user_id: user.id,
        rating,
        comment: comment || "",
        is_approved: true, // Auto-approve reviews from authenticated users
      })
      .select()
      .single();

    if (insertError) {
      console.error("Review insert error:", insertError);
      return NextResponse.json(
        { error: "فشل في حفظ التقييم" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حفظ التقييم" },
      { status: 500 }
    );
  }
}
