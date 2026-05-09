import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Fetch reviews for a product (query param: product_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "معرف المنتج مطلوب" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json({ reviews: [], averageRating: 0, totalCount: 0 });
    }

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*, profiles:user_id(name)")
      .eq("product_id", productId)
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

    if (!supabase) {
      return NextResponse.json({ error: "النظام غير متاح حالياً" }, { status: 503 });
    }

    // Get user from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لإضافة تقييم" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "جلسة غير صالحة. يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    // Insert the review
    const { data: review, error: insertError } = await supabase
      .from("reviews")
      .insert({
        product_id,
        user_id: user.id,
        rating,
        comment: comment || "",
      })
      .select("*, profiles:user_id(name)")
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
