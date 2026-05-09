"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useNavStore } from "@/store/nav-store";
import { useAuthStore } from "@/store/auth-store";
import {
  ShoppingCart, Package, Minus, Plus, Trash2, ArrowRight,
  MessageSquare, Tag, Gift, Loader2, X, User, Phone, MapPin,
  CheckCircle2, MessageCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WhatsAppBrandIcon, SmsBrandIcon } from "@/components/icons";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Order Message Builder                                               */
/* ------------------------------------------------------------------ */

function buildOrderMessage(items: ReturnType<typeof useCartStore.getState>["items"], total: number, customerName: string, customerPhone: string, customerAddress?: string, notes?: string, coupon?: { code: string; discount: number; discountAmount: number }) {
  const lines = items.map((item) => {
    const p = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
    return `${items.indexOf(item) + 1}. ${item.name} × ${item.quantity} = ${(p * item.quantity).toLocaleString("ar-SA")} ر.ي`;
  });

  let msg = `🛒 *طلب جديد من متجر النخبة*\n━━━━━━━━━━━━━━━\n\n`;
  msg += `👤 *العميل:* ${customerName}\n`;
  msg += `📱 *الهاتف:* ${customerPhone}\n`;
  if (customerAddress) msg += `📍 *العنوان:* ${customerAddress}\n`;
  msg += `\n📋 *المنتجات:*\n${lines.join("\n")}\n\n`;
  msg += `━━━━━━━━━━━━━━━\n`;
  msg += `💰 *المجموع الكلي:* ${total.toLocaleString("ar-SA")} ر.ي\n`;
  if (coupon && coupon.discountAmount > 0) {
    msg += `🎁 *الخصم (${coupon.discount}%):* -${coupon.discountAmount.toLocaleString("ar-SA")} ر.ي\n`;
    msg += `💳 *المجموع بعد الخصم:* ${(total - coupon.discountAmount).toLocaleString("ar-SA")} ر.ي\n`;
  }
  if (notes) msg += `\n📝 *ملاحظات:* ${notes}\n`;
  msg += `\n🕐 *${new Date().toLocaleDateString("ar-YE", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}*\n`;
  msg += `\n━━━━━━━━━━━━━━━\n✅ في انتظار تأكيد الطلب`;
  return msg;
}

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
  const { setCurrentPage } = useNavStore();

  // Customer form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "sms">("whatsapp");
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
        headers: { "Content-Type": "application/json" },
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

  const handleSubmit = () => {
    if (!customerName.trim()) { toast.error("يرجى إدخال اسمك"); return; }
    if (!customerPhone.trim()) { toast.error("يرجى إدخال رقم الهاتف"); return; }
    if (items.length === 0) { toast.error("السلة فارغة!"); return; }

    setIsSubmitting(true);
    const msg = buildOrderMessage(items, subtotal, customerName, customerPhone, customerAddress, notes, appliedCoupon || undefined);

    // Save order to Supabase
    const { user } = useAuthStore.getState();
    if (user?.id) {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items,
          total: grandTotal,
          notes,
          paymentMethod: paymentMethod,
          customerName,
          customerPhone,
          customerAddress,
          discount,
          couponCode: appliedCoupon?.code,
        }),
      }).catch(() => {
        // Silent fail
      });
    }

    setTimeout(() => {
      if (paymentMethod === "whatsapp") {
        window.open(`https://wa.me/967782138587?text=${encodeURIComponent(msg)}`, "_blank");
      } else {
        window.open(`sms:967782138587?body=${encodeURIComponent(msg)}`, "_blank");
      }
      clearCart();
      setOrderPlaced(true);
      setIsSubmitting(false);
      toast.success("تم إرسال طلبك بنجاح! 🎉");
    }, 500);
  };

  if (orderPlaced) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <div className="section-title-3d">تم إرسال طلبك بنجاح! 🎉</div>
        <p className="text-center text-muted-foreground max-w-md">
          {paymentMethod === "whatsapp"
            ? "تم فتح واتساب مع رسالة الطلب جاهزة للإرسال"
            : "تم فتح الرسائل النصية مع تفاصيل الطلب"}
        </p>
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          <button className="btn-3d flex items-center gap-2" onClick={() => { setOrderPlaced(false); setCurrentPage("products"); }}>
            <ShoppingCart className="size-4" /> متابعة التسوق
          </button>
          <button className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-accent" onClick={() => { setOrderPlaced(false); setCurrentPage("orders"); }}>
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
        <button className="btn-3d flex items-center gap-2" onClick={() => setCurrentPage("products")}>
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
                <Label className="text-base font-semibold">💳 اختر طريقة إرسال الطلب:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("whatsapp")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === "whatsapp" ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-green-500"><MessageCircle className="size-6 text-white" /></div>
                    <span className="font-bold text-sm text-green-700 dark:text-green-400">واتساب</span>
                    {paymentMethod === "whatsapp" && <CheckCircle2 className="size-4 text-green-500 absolute top-2 left-2" style={{ position: "absolute" }} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("sms")}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === "sms" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500"><MessageSquare className="size-6 text-white" /></div>
                    <span className="font-bold text-sm text-blue-700 dark:text-blue-400">رسالة نصية</span>
                    {paymentMethod === "sms" && <CheckCircle2 className="size-4 text-blue-500" style={{ position: "absolute", top: "8px", left: "8px" }} />}
                  </button>
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
                className={`w-full flex items-center justify-center gap-3 py-4 text-base font-bold text-white transition-all disabled:opacity-50 ${
                  paymentMethod === "whatsapp" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                } rounded-xl`}
              >
                {isSubmitting ? (
                  <><Loader2 className="size-5 animate-spin" /> جاري الإرسال...</>
                ) : paymentMethod === "whatsapp" ? (
                  <><WhatsAppBrandIcon className="size-5" /> إتمام الطلب عبر واتساب</>
                ) : (
                  <><SmsBrandIcon className="size-5" /> إتمام الطلب برسالة نصية</>
                )}
              </button>

              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-all hover:bg-accent"
                onClick={() => setCurrentPage("products")}
              >
                <ArrowRight className="size-4" /> متابعة التسوق
              </button>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                بالضغط على الزر، سيتم فتح {paymentMethod === "whatsapp" ? "واتساب" : "تطبيق الرسائل"} مع تفاصيل طلبك جاهزة
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
