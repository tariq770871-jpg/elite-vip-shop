import { NextResponse } from "next/server";

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
