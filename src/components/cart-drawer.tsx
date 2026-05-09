"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, MessageSquare, Tag, Gift, Loader2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { WhatsAppBrandIcon, SmsBrandIcon } from "@/components/icons";
import { toast } from "sonner";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalPrice,
    totalItems,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const router = useRouter();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const itemCount = totalItems();
  const subtotal = totalPrice();
  const discount = appliedCoupon?.discountAmount || 0;
  const total = appliedCoupon ? appliedCoupon.finalTotal : subtotal;

  const buildOrderMessage = () => {
    const orderLines = items
      .map(
        (item) => {
          const p = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
          return `• ${item.name} × ${item.quantity} = ${(p * item.quantity).toLocaleString("ar-SA")} ر.ي`;
        }
      )
      .join("\n");

    let msg = `🛒 *طلب جديد من متجر النخبة*\n━━━━━━━━━━━━━━\n\n📋 *المنتجات:*\n${orderLines}\n\n`;
    if (discount > 0) {
      msg += `━━━━━━━━━━━━━━\n🎁 الخصم (${appliedCoupon!.discount}%): -${discount.toLocaleString("ar-SA")} ر.ي\n`;
    }
    msg += `━━━━━━━━━━━━━━\n💰 *المجموع الكلي:* ${total.toLocaleString("ar-SA")} ر.ي\n\n`;
    msg += `🕐 ${new Date().toLocaleDateString("ar-YE", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}\n`;
    msg += `\n✅ في انتظار تأكيد الطلب`;
    return msg;
  };

  const saveOrderToSupabase = async (paymentMethod: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.id) return;
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items,
          total,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          discount: discount,
        }),
      });
    } catch {
      // Silent fail - order already sent via WhatsApp/SMS
    }
  };

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;
    const message = buildOrderMessage();
    window.open(`https://wa.me/967782138587?text=${encodeURIComponent(message)}`, "_blank");
    toast.success("تم فتح واتساب مع تفاصيل الطلب!");
    saveOrderToSupabase("whatsapp");
  };

  const handleCheckoutSMS = () => {
    if (items.length === 0) return;
    const message = buildOrderMessage();
    window.open(`sms:967782138587?body=${encodeURIComponent(message)}`, "_blank");
    toast.success("تم فتح الرسائل مع تفاصيل الطلب!");
    saveOrderToSupabase("sms");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.toUpperCase(), orderTotal: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon({
          code: data.code,
          discount: data.discount,
          discountAmount: data.discountAmount,
          finalTotal: data.finalTotal,
        });
        toast.success(`تم تطبيق كود الخصم! خصم ${data.discount}% 🎉`);
      } else {
        toast.error(data.error || "كود الخصم غير صالح");
      }
    } catch {
      toast.error("خطأ في التحقق من كود الخصم");
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="left" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-right">
            <ShoppingCart className="size-5 text-gold-gradient" />
            <span>سلة التسوق</span>
            {itemCount > 0 && (
              <Badge className="ms-2">{itemCount}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="size-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              السلة فارغة
            </p>
            <p className="text-sm text-muted-foreground">
              أضف منتجات للبدء بالتسوق
            </p>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-1 px-1">
                {items.map((item) => {
                  const effectivePrice =
                    item.salePrice && item.salePrice < item.price
                      ? item.salePrice
                      : item.price;

                  return (
                    <div
                      key={item.id}
                      className="card-3d group flex items-start gap-3 p-3 sm:p-3"
                    >
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <ShoppingCart className="size-5 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 line-clamp-1 text-sm font-semibold">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {item.salePrice && item.salePrice < item.price ? (
                            <>
                              <span className="text-sm font-bold text-gold-gradient">
                                {effectivePrice.toLocaleString("ar-SA")} ر.ي
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {item.price.toLocaleString("ar-SA")} ر.ي
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold">
                              {effectivePrice.toLocaleString("ar-SA")} ر.ي
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-lg border">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="touch-target flex size-11 items-center justify-center transition-colors hover:bg-accent"
                              aria-label="تقليل الكمية"
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="flex min-w-[2.5rem] items-center justify-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="touch-target flex size-11 items-center justify-center transition-colors hover:bg-accent"
                              aria-label="زيادة الكمية"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(effectivePrice * item.quantity).toLocaleString("ar-SA")} ر.ي
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="touch-target shrink-0 flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                        aria-label="حذف المنتج"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-2" />

            {/* Footer */}
            <SheetFooter className="flex-col gap-3">
              {/* Coupon */}
              <div className="w-full space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-green-500/10 p-2.5">
                    <div className="flex items-center gap-2">
                      <Gift className="size-4 text-green-600" />
                      <div>
                        <span className="text-xs font-bold text-green-700 dark:text-green-400">
                          {appliedCoupon.code}
                        </span>
                        <p className="text-[10px] text-green-600 dark:text-green-500">
                          خصم {appliedCoupon.discount}% - وفّرت {discount.toLocaleString("ar-SA")} ر.ي
                        </p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-600">
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="كود الخصم..."
                      className="h-9 text-sm"
                      dir="ltr"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-9 gap-1 shrink-0"
                    >
                      {couponLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Tag className="size-3.5" />}
                    </Button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="w-full space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي:</span>
                  <span className="font-medium">{subtotal.toLocaleString("ar-SA")} ر.ي</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1"><Gift className="size-3" /> الخصم:</span>
                    <span>-{discount.toLocaleString("ar-SA")} ر.ي</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">المجموع:</span>
                  <span className="text-xl font-bold text-gold-gradient">
                    {total.toLocaleString("ar-SA")} ر.ي
                  </span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="grid w-full grid-cols-2 gap-2">
                <button
                  className="btn-3d-whatsapp flex items-center justify-center gap-2 !py-3 text-sm"
                  onClick={handleCheckoutWhatsApp}
                >
                  <WhatsAppBrandIcon className="size-4" />
                  واتساب
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-700 transition-all hover:bg-blue-500/20 dark:text-blue-400"
                  onClick={handleCheckoutSMS}
                >
                  <SmsBrandIcon className="size-4" />
                  رسالة نصية
                </button>
              </div>

              <div className="grid w-full grid-cols-2 gap-2">
                <button
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium transition-all hover:bg-accent"
                  onClick={() => { closeCart(); router.push("/cart"); }}
                >
                  تفاصيل الطلب
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-destructive transition-all hover:bg-red-500/5"
                  onClick={clearCart}
                >
                  <Trash2 className="size-3.5" />
                  تفريغ السلة
                </button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
