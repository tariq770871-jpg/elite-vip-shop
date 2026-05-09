"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useNavigation } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getAuthHeaders } from "@/lib/api-auth";
import {
  ShoppingCart, Package, Minus, Plus, Trash2, ArrowRight,
  Tag, Gift, Loader2, X, User, Phone, MapPin,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Cart Page Section                                                  */
/* ------------------------------------------------------------------ */

export function CartPageSection() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const { navigateTo } = useNavigation();

  // Customer form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("jeeb");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = totalPrice();
  const discount = appliedCoupon?.discountAmount || 0;
  const grandTotal = appliedCoupon ? appliedCoupon.finalTotal : subtotal;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon({ code: data.code, discount: data.discount, discountAmount: data.discountAmount, finalTotal: data.finalTotal });
        toast.success(`تم تطبيق كود الخصم! خصم ${data.discount}% 🎉`);
      } else {
        toast.error(data.error || "كود الخصم غير صالح");
      }
    } catch {
      toast.error("خطأ في التحقق");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) { toast.error("يرجى إدخال اسمك"); return; }
    if (!customerPhone.trim()) { toast.error("يرجى إدخال رقم الهاتف"); return; }
    if (items.length === 0) { toast.error("السلة فارغة!"); return; }

    const { user } = useAuthStore.getState();
    if (!user?.id) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          items,
          total: grandTotal,
          paymentMethod,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim() || undefined,
          notes: notes.trim() || undefined,
          couponCode: appliedCoupon?.code,
          discount,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        clearCart();
        setOrderPlaced(true);
        toast.success("تم تأكيد طلبك بنجاح! 🎉");
      } else {
        toast.error(data.error || "حدث خطأ أثناء إرسال الطلب");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <div className="section-title-3d">تم تأكيد طلبك بنجاح! 🎉</div>
        <p className="text-center text-muted-foreground max-w-md">
          سيتم التواصل معك قريباً لتأكيد التفاصيل وطريقة الدفع
        </p>
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          <button className="btn-3d flex items-center gap-2" onClick={() => { setOrderPlaced(false); navigateTo("products"); }}>
            <ShoppingCart className="size-4" /> متابعة التسوق
          </button>
          <button className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-accent" onClick={() => { setOrderPlaced(false); navigateTo("orders"); }}>
            تتبع الطلبات
          </button>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-24 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="size-10 text-muted-foreground" />
        </div>
        <div className="section-title-3d">سلتك فارغة</div>
        <p className="text-muted-foreground">لم تقم بإضافة أي منتجات بعد</p>
        <button className="btn-3d flex items-center gap-2" onClick={() => navigateTo("products")}>
          <ShoppingCart className="size-4" /> تسوق الآن
        </button>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Title */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="section-title-3d">
            <span className="title-icon"><ShoppingCart className="size-6" /></span>
            سلة التسوق
          </div>
          <span className="rounded-full bg-gold-gradient px-3 py-0.5 text-xs font-bold text-black">
            {totalItems()} منتج
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items + Customer Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => {
                const unitPrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
                const lineTotal = unitPrice * item.quantity;
                const hasSale = item.salePrice && item.salePrice < item.price;

                return (
                  <div key={item.id} className="card-3d flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4">
                    <div className="flex items-center gap-3 md:flex-1">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:text-center">
                      {hasSale ? (
                        <div>
                          <span className="font-bold text-gold-gradient">{unitPrice.toLocaleString("ar-SA")} ر.ي</span>
                          <span className="ms-2 text-xs text-muted-foreground line-through">{item.price.toLocaleString("ar-SA")}</span>
                        </div>
                      ) : (
                        <span className="font-semibold">{unitPrice.toLocaleString("ar-SA")} ر.ي</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-accent">
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-accent">
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gold-gradient">{lineTotal.toLocaleString("ar-SA")} ر.ي</span>
                      <button onClick={() => removeItem(item.id)} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Customer Details */}
            <div className="card-3d p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">📝 بيانات التوصيل</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm"><User className="size-3.5" /> الاسم الكامل <span className="text-destructive">*</span></Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="أدخل اسمك الكامل" />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm"><Phone className="size-3.5" /> رقم الهاتف <span className="text-destructive">*</span></Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+967 XXX XXX XXX" dir="ltr" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm"><MapPin className="size-3.5" /> عنوان التوصيل</Label>
                <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="المدينة، الحي، الشارع..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">ملاحظات إضافية</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي ملاحظات أو طلبات خاصة..." rows={2} className="resize-none" />
              </div>

              <Separator />

              {/* Payment Method */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">💳 اختر طريقة الدفع:</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { value: "jeeb", label: "جيب", icon: "📱" },
                    { value: "jawaly", label: "جوالي", icon: "📱" },
                    { value: "easy_fulusk", label: "ايزي فلوسك", icon: "📱" },
                    { value: "saltef", label: "سلطيف", icon: "📱" },
                    { value: "local_transfer", label: "حوالة شبكة محلية", icon: "💵" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className="text-xl">{method.icon}</span>
                      <span
                        className={`text-xs font-bold ${
                          paymentMethod === method.value
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {method.label}
                      </span>
                      {paymentMethod === method.value && (
                        <CheckCircle2 className="size-4 text-amber-500 absolute top-1.5 left-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="gold-glow sticky top-24 space-y-4 rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-bold">ملخص الطلب</h2>

              {/* Items */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[60%]">{item.name} × {item.quantity}</span>
                    <span className="font-medium">
                      {((item.salePrice && item.salePrice < item.price ? item.salePrice : item.price) * item.quantity).toLocaleString("ar-SA")} ر.ي
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Coupon */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-semibold"><Tag className="size-4" /> كود الخصم</Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-green-500/10 p-3">
                    <div className="flex items-center gap-2">
                      <Gift className="size-5 text-green-600" />
                      <div>
                        <span className="text-xs font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                        <p className="text-[10px] text-green-600 dark:text-green-500">خصم {appliedCoupon.discount}% - وفّرت {discount.toLocaleString("ar-SA")} ر.ي</p>
                      </div>
                    </div>
                    <button onClick={() => { removeCoupon(); setCouponCode(""); toast.success("تم إزالة كود الخصم"); }} className="text-red-500 hover:text-red-600"><X className="size-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="أدخل كود الخصم..." className="h-9 text-sm" dir="ltr" onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="h-9 gap-1 shrink-0">
                      {couponLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Tag className="size-3.5" />}
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{subtotal.toLocaleString("ar-SA")} ر.ي</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className="font-medium text-green-600 dark:text-green-400">مجاناً</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1"><Gift className="size-3" /> الخصم ({appliedCoupon?.discount}%)</span>
                    <span>-{discount.toLocaleString("ar-SA")} ر.ي</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">المجموع الكلي</span>
                  <span className="text-xl font-bold text-gold-gradient">{grandTotal.toLocaleString("ar-SA")} ر.ي</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-4 text-base font-bold text-black transition-all disabled:opacity-50
                  bg-gradient-to-r from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/25
                  hover:shadow-amber-500/40 hover:from-amber-400 hover:to-yellow-500 rounded-xl active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <><Loader2 className="size-5 animate-spin" /> جاري تأكيد الطلب...</>
                ) : (
                  <><ShoppingCart className="size-5" /> تأكيد الطلب</>
                )}
              </button>

              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-all hover:bg-accent"
                onClick={() => navigateTo("products")}
              >
                <ArrowRight className="size-4" /> متابعة التسوق
              </button>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                بالضغط على الزر، سيتم تأكيد طلبك وإرساله للمراجعة
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
