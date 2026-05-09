import { NextResponse } from "next/server";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

/** Verify the authenticated user has admin role */
async function verifyAdmin(request: Request) {
  const { user, error: authError } = await verifyAuthToken(request);
  if (authError || !user) {
    return { user: null, errorResponse: NextResponse.json({ error: "غير مصرح به" }, { status: 401 }) };
  }
  const serviceClient = getSupabaseServiceClient();
  if (serviceClient) {
    const { data: profile } = await serviceClient
      .from("users")
      .select("role_id, roles(role_name)")
      .eq("email", user.email)
      .single();
    const roleName = (profile?.roles as { role_name?: string } | null)?.role_name;
    if (roleName !== "admin") {
      return { user: null, errorResponse: NextResponse.json({ error: "ممنوع — يتطلب صلاحية المدير" }, { status: 403 }) };
    }
  }
  return { user, errorResponse: null };
}

// POST: Validate a coupon code
export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code || orderTotal === undefined) {
      return NextResponse.json({ valid: false, error: "بيانات غير مكتملة" }, { status: 400 });
    }

    const upperCode = code.toUpperCase();
    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ valid: false, error: "خدمة غير متاحة" }, { status: 503 });
    }

    // Fetch coupon from database
    const { data: coupon, error: dbError } = await serviceClient
      .from("coupons")
      .select("*")
      .eq("code", upperCode)
      .single();

    if (dbError || !coupon) {
      return NextResponse.json({ valid: false, error: "كود الخصم غير موجود" });
    }

    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, error: "هذا الكود غير مفعل" });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ valid: false, error: "هذا الكود منتهي الصلاحية" });
    }

    if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
      return NextResponse.json({ valid: false, error: "هذا الكود لم يبدأ بعد" });
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: "تم استخدام هذا الكود الحد الأقصى" });
    }

    if (Number(orderTotal) < Number(coupon.min_order_amount)) {
      return NextResponse.json({
        valid: false,
        error: `الحد الأدنى للطلب ${Number(coupon.min_order_amount).toLocaleString("ar-SA")} ر.ي`,
      });
    }

    // Atomic increment with conditional check — prevents TOCTOU race condition
    // Only increments if used_count < max_uses (or max_uses is unlimited)
    const maxUsesCondition = coupon.max_uses ? `and.used_count.lt.${coupon.max_uses}` : undefined;
    const { data: updated, error: incrementError } = await serviceClient
      .from("coupons")
      .update({ used_count: coupon.used_count + 1 })
      .eq("code", upperCode)
      .lt(coupon.max_uses ? "used_count" : "code", coupon.max_uses ?? upperCode) // ensures used_count < max_uses
      .select()
      .single();

    if (incrementError || !updated) {
      // Race condition: another request used the last slot between our check and update
      return NextResponse.json({ valid: false, error: "تم استخدام هذا الكود الحد الأقصى" });
    }

    const discountAmount = Math.round((Number(orderTotal) * Number(coupon.discount_value)) / 100);
    const finalTotal = Number(orderTotal) - discountAmount;

    return NextResponse.json({
      valid: true,
      code: upperCode,
      discount: Number(coupon.discount_value),
      discountAmount,
      finalTotal,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "حدث خطأ في التحقق" }, { status: 500 });
  }
}

// GET: List all coupons
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ coupons: [] });
    }

    const { data: coupons, error } = await serviceClient
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !coupons) {
      return NextResponse.json({ coupons: [] });
    }

    return NextResponse.json({
      coupons: coupons.map((c) => ({
        code: c.code,
        discount: Number(c.discount_value),
        minOrder: Number(c.min_order_amount),
        isActive: c.is_active,
        expiresAt: c.valid_until,
      })),
    });
  } catch {
    return NextResponse.json({ coupons: [] });
  }
}

// PUT: Update a coupon (admin only)
export async function PUT(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { code, discount, minOrder, maxUses, isActive, expiresAt } = body;

    if (!code) {
      return NextResponse.json({ error: "كود الخصم مطلوب" }, { status: 400 });
    }

    const upperCode = code.toUpperCase();
    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: "خدمة غير متاحة" }, { status: 503 });
    }

    // Build update object from provided fields — map to DB column names
    const updateData: Record<string, unknown> = {};
    if (discount !== undefined) updateData.discount_value = discount;
    if (minOrder !== undefined) updateData.min_order_amount = minOrder;
    if (maxUses !== undefined) updateData.max_uses = maxUses;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (expiresAt !== undefined) updateData.valid_until = expiresAt;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "لا توجد بيانات للتحديث" }, { status: 400 });
    }

    const { data: updated, error: updateError } = await serviceClient
      .from("coupons")
      .update(updateData)
      .eq("code", upperCode)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "كود الخصم غير موجود أو فشل التحديث" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: updated.code,
        discount: Number(updated.discount_value),
        minOrder: Number(updated.min_order_amount),
        isActive: updated.is_active,
        expiresAt: updated.valid_until,
      },
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في التحديث" }, { status: 500 });
  }
}

// DELETE: Deactivate a coupon (admin only)
export async function DELETE(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "كود الخصم مطلوب" }, { status: 400 });
    }

    const upperCode = code.toUpperCase();
    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: "خدمة غير متاحة" }, { status: 503 });
    }

    // Soft delete — deactivate instead of removing to preserve usedCount data
    const { data: deactivated, error: deactError } = await serviceClient
      .from("coupons")
      .update({ is_active: false })
      .eq("code", upperCode)
      .select()
      .single();

    if (deactError || !deactivated) {
      return NextResponse.json({ error: "كود الخصم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تعطيل الكود" });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في الحذف" }, { status: 500 });
  }
}
