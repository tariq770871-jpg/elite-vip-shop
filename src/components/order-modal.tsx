"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  FileText,
  Smartphone,
  Banknote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Payment Methods                                                     */
/* ------------------------------------------------------------------ */

const PAYMENT_METHODS = [
  { value: "jeeb", label: "جيب", icon: "📱" },
  { value: "jawaly", label: "جوالي", icon: "📱" },
  { value: "easy_fulusk", label: "ايزي فلوسك", icon: "📱" },
  { value: "saltef", label: "سلطيف", icon: "📱" },
  { value: "local_transfer", label: "حوالة شبكة محلية", icon: "💵" },
] as const;

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface OrderModalProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
  category?: string;
  availability: boolean;
}

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: OrderModalProduct | null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function OrderModal({ open, onOpenChange, product }: OrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("jeeb");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Reset state when product changes
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setNotes("");
      setPaymentMethod("jeeb");
      setIsSubmitting(false);
      setOrderSuccess(false);
      setOrderNumber("");
    }
  }, [open, product?.id]);

  if (!product) return null;

  const effectivePrice =
    product.salePrice && product.salePrice < product.price
      ? product.salePrice
      : product.price;

  const totalPrice = effectivePrice * quantity;

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("يرجى إدخال اسمك");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    const { user } = useAuthStore.getState();
    if (!user?.id) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    setIsSubmitting(true);

    try {
      const cartStore = useCartStore.getState();
      const appliedCoupon = cartStore.appliedCoupon;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: [{ id: product.id, name: product.name, quantity, price: effectivePrice }],
          total: totalPrice,
          paymentMethod,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim() || undefined,
          notes: notes.trim() || undefined,
          couponCode: appliedCoupon?.code,
          discount: 0,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderSuccess(true);
        setOrderNumber(data.orderNumber || "N/A");
        toast.success("تم تأكيد طلبك بنجاح! 🎉");

        // Auto close after 3 seconds
        setTimeout(() => {
          onOpenChange(false);
        }, 3000);
      } else {
        toast.error(data.error || "حدث خطأ أثناء إرسال الطلب");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {orderSuccess ? (
          /* ── Success State ── */
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="size-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold">تم تأكيد طلبك بنجاح! 🎉</h3>
            <p className="text-muted-foreground text-center text-sm">
              رقم الطلب: <span className="font-bold text-gold-gradient">{orderNumber}</span>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              سيتم التواصل معك قريباً لتأكيد التفاصيل
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="text-right">
              <DialogTitle className="flex items-center gap-2 text-right">
                <ShoppingCart className="size-5 text-gold-gradient" />
                تأكيد الطلب
              </DialogTitle>
              <DialogDescription className="text-right">
                أدخل بياناتك واختر طريقة الدفع لإتمام الطلب
              </DialogDescription>
            </DialogHeader>

            {/* Product Info */}
            <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
              {product.image && (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm truncate">{product.name}</h4>
                {product.category && (
                  <Badge className="mt-1 bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-xs font-semibold text-gold-gradient border border-amber-500/20 px-2 py-0.5">
                    {product.category}
                  </Badge>
                )}
                <div className="mt-1 flex items-center gap-2">
                  {product.salePrice && product.salePrice < product.price ? (
                    <>
                      <span className="font-bold text-gold-gradient">
                        {product.salePrice.toLocaleString("ar-SA")} ر.ي
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {product.price.toLocaleString("ar-SA")} ر.ي
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-gold-gradient">
                      {product.price.toLocaleString("ar-SA")} ر.ي
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3">
              <span className="text-sm font-medium">الكمية</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
                  aria-label="تقليل الكمية"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <span className="font-bold text-gold-gradient">
                {totalPrice.toLocaleString("ar-SA")} ر.ي
              </span>
            </div>

            {/* Customer Info Form */}
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <User className="size-3.5" /> الاسم الكامل <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Phone className="size-3.5" /> رقم الهاتف <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+967 XXX XXX XXX"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <MapPin className="size-3.5" /> عنوان التوصيل
                </Label>
                <Input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="المدينة، الحي، الشارع... (اختياري)"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <FileText className="size-3.5" /> ملاحظات
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات أو طلبات خاصة... (اختياري)"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                💳 اختر طريقة الدفع
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <RadioGroupItem
                      value={method.value}
                      className="sr-only"
                    />
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
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 text-base !py-4 rounded-xl
                bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold
                shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-yellow-500
                transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  جاري تأكيد الطلب...
                </>
              ) : (
                <>
                  <ShoppingCart className="size-5" />
                  تأكيد الطلب
                </>
              )}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
