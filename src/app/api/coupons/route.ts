import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/supabase-server";

const COUPONS: Record<string, { discount: number; minOrder: number; maxUses: number; usedCount: number; isActive: boolean; expiresAt: string | null }> = {
  WELCOME10: { discount: 10, minOrder: 0, maxUses: 1000, usedCount: 0, isActive: true, expiresAt: null },
  VIP20: { discount: 20, minOrder: 5000, maxUses: 500, usedCount: 0, isActive: true, expiresAt: null },
  SUMMER15: { discount: 15, minOrder: 3000, maxUses: 200, usedCount: 0, isActive: true, expiresAt: "2025-09-01" },
  ELITE25: { discount: 25, minOrder: 10000, maxUses: 100, usedCount: 0, isActive: true, expiresAt: null },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code || !orderTotal) {
      return NextResponse.json({ valid: false, error: "بيانات غير مكتملة" }, { status: 400 });
    }

    const upperCode = code.toUpperCase();
    const coupon = COUPONS[upperCode];

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "كود الخصم غير موجود" });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "هذا الكود غير مفعل" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "هذا الكود منتهي الصلاحية" });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "تم استخدام هذا الكود الحد الأقصى" });
    }

    if (orderTotal < coupon.minOrder) {
      return NextResponse.json({
        valid: false,
        error: `الحد الأدنى للطلب ${coupon.minOrder.toLocaleString("ar-SA")} ر.ي`,
      });
    }

    // Fix: Increment usedCount when coupon is successfully validated
    coupon.usedCount += 1;

    const discountAmount = Math.round((orderTotal * coupon.discount) / 100);
    const finalTotal = orderTotal - discountAmount;

    return NextResponse.json({
      valid: true,
      code: upperCode,
      discount: coupon.discount,
      discountAmount,
      finalTotal,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "حدث خطأ في التحقق" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    coupons: Object.entries(COUPONS).map(([code, c]) => ({
      code,
      discount: c.discount,
      minOrder: c.minOrder,
      isActive: c.isActive,
      expiresAt: c.expiresAt,
    })),
  });
}

// PUT: Update a coupon (admin only)
export async function PUT(request: Request) {
  try {
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 });
    }

    const body = await request.json();
    const { code, discount, minOrder, maxUses, isActive, expiresAt } = body;

    if (!code) {
      return NextResponse.json({ error: "كود الخصم مطلوب" }, { status: 400 });
    }

    const upperCode = code.toUpperCase();
    const coupon = COUPONS[upperCode];

    if (!coupon) {
      return NextResponse.json({ error: "كود الخصم غير موجود" }, { status: 404 });
    }

    // Update provided fields
    if (discount !== undefined) coupon.discount = discount;
    if (minOrder !== undefined) coupon.minOrder = minOrder;
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt;

    return NextResponse.json({ success: true, coupon: { code: upperCode, ...coupon } });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في التحديث" }, { status: 500 });
  }
}

// DELETE: Deactivate a coupon (admin only)
export async function DELETE(request: Request) {
  try {
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "كود الخصم مطلوب" }, { status: 400 });
    }

    const upperCode = code.toUpperCase();
    const coupon = COUPONS[upperCode];

    if (!coupon) {
      return NextResponse.json({ error: "كود الخصم غير موجود" }, { status: 404 });
    }

    // Deactivate instead of deleting to preserve usedCount data
    coupon.isActive = false;

    return NextResponse.json({ success: true, message: "تم تعطيل الكود" });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في الحذف" }, { status: 500 });
  }
}
