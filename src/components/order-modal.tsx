"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingCart,
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Truck,
  Store,
  MessageCircle,
  Bot,
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
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { getAuthHeaders } from "@/lib/api-auth";
import { useNavigation } from "@/lib/navigation";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/* ================================================================== */
/*  Zod Schemas                                                        */
/* ================================================================== */

const deliverySchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(6, "رقم الهاتف مطلوب"),
  province: z.string().min(2, "المحافظة مطلوبة"),
  district: z.string().min(2, "المديرية مطلوبة"),
  street: z.string().min(2, "الشارع مطلوب"),
  landmark: z.string().min(2, "أقرب معلم مطلوب"),
});

const pickupSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(6, "رقم الهاتف مطلوب"),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;
type PickupFormData = z.infer<typeof pickupSchema>;

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

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

interface ChatMessage {
  id: string;
  type: "bot" | "user" | "system" | "form";
  content: string;
  timestamp: Date;
  actions?: Array<{ label: string; value: string }>;
  formData?: "delivery" | "pickup";
}

type ChatStep =
  | "IDLE"
  | "AUTH_GATE"
  | "PRODUCT_INFO"
  | "CHOOSE_OPTION"
  | "DELIVERY_FORM"
  | "PICKUP_FORM"
  | "SUBMITTING"
  | "SUCCESS";

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function OrderModal({ open, onOpenChange, product }: OrderModalProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { navigateTo } = useNavigation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>("IDLE");
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("pickup");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const deliveryForm = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { customerName: "", customerPhone: "", province: "", district: "", street: "", landmark: "" },
  });
  const pickupForm = useForm<PickupFormData>({
    resolver: zodResolver(pickupSchema),
    defaultValues: { customerName: "", customerPhone: "" },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset when modal opens
  useEffect(() => {
    if (open && product) {
      setMessages([]);
      setQuantity(1);
      setDeliveryType("pickup");
      setIsSubmitting(false);
      setOrderNumber("");
      deliveryForm.reset();
      pickupForm.reset();

      const timer = setTimeout(() => {
        startChatFlow();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, product?.id]);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg.id;
  }, []);

  /* ────────────────────────────────────────────────────────────────── */
  /*  Step 1: Auth Gate                                                */
  /* ────────────────────────────────────────────────────────────────── */

  const startChatFlow = useCallback(() => {
    if (!product) return;

    if (!isAuthenticated) {
      setCurrentStep("AUTH_GATE");
      addMessage({
        type: "bot",
        content: "مرحباً! يجب تسجيل الدخول أو إنشاء حساب أولاً لإكمال الطلب.",
        actions: [
          { label: "تسجيل الدخول", value: "login" },
          { label: "إنشاء حساب جديد", value: "register" },
        ],
      });
    } else {
      showProductInfo();
    }
  }, [isAuthenticated, addMessage, product]);

  /* ────────────────────────────────────────────────────────────────── */
  /*  Step 2: Auto-message with product details                       */
  /* ────────────────────────────────────────────────────────────────── */

  const showProductInfo = useCallback(() => {
    if (!product) return;
    setCurrentStep("PRODUCT_INFO");

    const effectivePrice =
      product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    addMessage({
      type: "bot",
      content: `📦 ${product.name}\n💰 السعر: ${effectivePrice.toLocaleString("ar-SA")} ر.ي\n📊 الكمية: ${quantity}\n💵 المجموع: ${(effectivePrice * quantity).toLocaleString("ar-SA")} ر.ي\n\n⚠️ لا تقم بأي عملية دفع إلا بعد تأكيد الطلب`,
    });

    // Step 3: Show the 3 options after product info
    setTimeout(() => {
      setCurrentStep("CHOOSE_OPTION");
      addMessage({
        type: "bot",
        content: "اختر كيف تريد المتابعة:",
        actions: [
          { label: "🚚 خدمة توصيل", value: "delivery" },
          { label: "🏪 بدون توصيل", value: "pickup" },
          { label: "❓ استعلام عن المنتج", value: "inquiry" },
        ],
      });
    }, 700);
  }, [product, quantity, addMessage]);

  // Update product info message when quantity changes
  useEffect(() => {
    if ((currentStep === "PRODUCT_INFO" || currentStep === "CHOOSE_OPTION") && product && messages.length > 0) {
      const effectivePrice =
        product.salePrice && product.salePrice < product.price
          ? product.salePrice
          : product.price;
      setMessages((prev) =>
        prev.map((msg, idx) => {
          if (idx === 0 && msg.type === "bot") {
            return {
              ...msg,
              content: `📦 ${product.name}\n💰 السعر: ${effectivePrice.toLocaleString("ar-SA")} ر.ي\n📊 الكمية: ${quantity}\n💵 المجموع: ${(effectivePrice * quantity).toLocaleString("ar-SA")} ر.ي\n\n⚠️ لا تقم بأي عملية دفع إلا بعد تأكيد الطلب`,
            };
          }
          return msg;
        })
      );
    }
  }, [quantity]);

  /* ────────────────────────────────────────────────────────────────── */
  /*  Handle user actions                                              */
  /* ────────────────────────────────────────────────────────────────── */

  const handleActionClick = useCallback(
    (actionValue: string) => {
      const actionLabels: Record<string, string> = {
        login: "تسجيل الدخول",
        register: "إنشاء حساب جديد",
        delivery: "🚚 خدمة توصيل",
        pickup: "🏪 بدون توصيل",
        inquiry: "❓ استعلام عن المنتج",
      };

      addMessage({
        type: "user",
        content: actionLabels[actionValue] || actionValue,
      });

      switch (actionValue) {
        case "login":
          navigateTo("login");
          onOpenChange(false);
          break;
        case "register":
          navigateTo("register");
          onOpenChange(false);
          break;
        case "inquiry":
          if (product) {
            window.open(getWhatsAppOrderLink(product.name), "_blank");
            onOpenChange(false);
          }
          break;
        case "delivery":
          setDeliveryType("delivery");
          setCurrentStep("DELIVERY_FORM");
          setTimeout(() => {
            addMessage({
              type: "bot",
              content: "يرجى إدخال بيانات التوصيل كاملة:",
              formData: "delivery",
            });
          }, 400);
          break;
        case "pickup":
          setDeliveryType("pickup");
          setCurrentStep("PICKUP_FORM");
          setTimeout(() => {
            addMessage({
              type: "bot",
              content: "يرجى إدخال بياناتك:",
              formData: "pickup",
            });
          }, 400);
          break;
      }
    },
    [addMessage, navigateTo, onOpenChange, product]
  );

  /* ────────────────────────────────────────────────────────────────── */
  /*  Form submissions                                                 */
  /* ────────────────────────────────────────────────────────────────── */

  const handleDeliverySubmit = useCallback(
    async (data: DeliveryFormData) => {
      addMessage({
        type: "user",
        content: `👤 ${data.customerName}\n📞 ${data.customerPhone}\n📍 ${data.province}، ${data.district}، ${data.street}\n🏗️ ${data.landmark}`,
      });

      await submitOrder({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: "delivery",
        province: data.province,
        district: data.district,
        street: data.street,
        landmark: data.landmark,
      });
    },
    [addMessage, product, quantity]
  );

  const handlePickupSubmit = useCallback(
    async (data: PickupFormData) => {
      addMessage({
        type: "user",
        content: `👤 ${data.customerName}\n📞 ${data.customerPhone}`,
      });

      await submitOrder({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: "pickup",
      });
    },
    [addMessage, product, quantity]
  );

  /* ────────────────────────────────────────────────────────────────── */
  /*  Step 5: Create order in DB → Step 6: Confirmation               */
  /* ────────────────────────────────────────────────────────────────── */

  const submitOrder = useCallback(
    async (params: {
      customerName: string;
      customerPhone: string;
      deliveryType: "delivery" | "pickup";
      province?: string;
      district?: string;
      street?: string;
      landmark?: string;
    }) => {
      if (!product) return;

      const { user } = useAuthStore.getState();
      if (!user?.id) {
        toast.error("يرجى تسجيل الدخول أولاً");
        return;
      }

      setIsSubmitting(true);
      setCurrentStep("SUBMITTING");

      const effectivePrice =
        product.salePrice && product.salePrice < product.price
          ? product.salePrice
          : product.price;
      const totalPrice = effectivePrice * quantity;

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({
            items: [{ id: product.id, name: product.name, quantity, price: effectivePrice }],
            total: totalPrice,
            paymentMethod: "in_app",
            customerName: params.customerName,
            customerPhone: params.customerPhone,
            deliveryType: params.deliveryType,
            province: params.province,
            district: params.district,
            street: params.street,
            landmark: params.landmark,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const ordNum = data.orderNumber || "N/A";
          setOrderNumber(ordNum);
          setCurrentStep("SUCCESS");

          // Step 6: Confirmation message inside chat
          addMessage({
            type: "bot",
            content: `شكراً لك، تم استلام طلبك بنجاح! 🎉\n\n📦 رقم الطلب: ${ordNum}\n📊 الحالة: قيد الانتظار\n\nسيتم التواصل معك قريباً لتأكيد الطلب.`,
          });
          toast.success("تم تأكيد طلبك بنجاح! 🎉");

          setTimeout(() => {
            onOpenChange(false);
          }, 5000);
        } else {
          addMessage({
            type: "system",
            content: `❌ ${data.error || "حدث خطأ أثناء إرسال الطلب"}`,
          });
          toast.error(data.error || "حدث خطأ أثناء إرسال الطلب");
          setCurrentStep("CHOOSE_OPTION");
        }
      } catch {
        addMessage({
          type: "system",
          content: "❌ حدث خطأ في الاتصال بالخادم",
        });
        toast.error("حدث خطأ في الاتصال بالخادم");
        setCurrentStep("CHOOSE_OPTION");
      } finally {
        setIsSubmitting(false);
      }
    },
    [product, quantity, addMessage, onOpenChange]
  );

  /* ────────────────────────────────────────────────────────────────── */
  /*  Render                                                           */
  /* ────────────────────────────────────────────────────────────────── */

  if (!product) return null;

  const effectivePrice =
    product.salePrice && product.salePrice < product.price
      ? product.salePrice
      : product.price;
  const totalPrice = effectivePrice * quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0"
        dir="rtl"
      >
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-2 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-right text-base">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15">
              <Bot className="size-4 text-amber-600" />
            </div>
            طلب المنتج
          </DialogTitle>
          <DialogDescription className="text-right text-xs">
            أكمِل الطلب عبر المحادثة
          </DialogDescription>
        </DialogHeader>

        {/* Quantity Selector */}
        {currentStep !== "SUCCESS" && currentStep !== "SUBMITTING" && (
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
            <span className="text-sm font-medium">الكمية</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex size-11 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
                aria-label="تقليل الكمية"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                className="flex size-11 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
                aria-label="زيادة الكمية"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <span className="font-bold text-gold-gradient text-sm">
              {totalPrice.toLocaleString("ar-SA")} ر.ي
            </span>
          </div>
        )}

        {/* ─── Chat Messages Area ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[300px] max-h-[50vh]">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* Bot / System messages */}
              {(msg.type === "bot" || msg.type === "system") && (
                <div className="flex justify-start">
                  <div
                    className={`max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed ${
                      msg.type === "system"
                        ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                        : "bg-muted/70 border"
                    }`}
                  >
                    {msg.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}

                    {/* Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.actions.map((action) => (
                          <button
                            key={action.value}
                            onClick={() => handleActionClick(action.value)}
                            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-black transition-all
                              bg-gradient-to-r from-amber-500 to-yellow-600 shadow-md shadow-amber-500/20
                              hover:shadow-amber-500/40 hover:from-amber-400 hover:to-yellow-500 active:scale-[0.97]"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User messages */}
              {msg.type === "user" && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-3 text-sm text-black font-medium leading-relaxed">
                    {msg.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Form messages - embedded forms */}
              {msg.type === "form" && msg.formData && (
                <div className="flex justify-start">
                  <div className="max-w-[95%] w-full rounded-2xl rounded-tr-sm bg-muted/70 border px-4 py-3">

                    {/* ─── Delivery Form ─── */}
                    {msg.formData === "delivery" && (
                      <form
                        onSubmit={deliveryForm.handleSubmit(handleDeliverySubmit)}
                        className="space-y-3"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-xs">
                              <User className="size-3" /> الاسم الكامل <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...deliveryForm.register("customerName")}
                              placeholder="أدخل اسمك الكامل"
                              className="h-9 text-sm"
                              aria-invalid={!!deliveryForm.formState.errors.customerName}
                              aria-errormessage={deliveryForm.formState.errors.customerName ? "delivery-name-error" : undefined}
                            />
                            {deliveryForm.formState.errors.customerName && (
                              <p id="delivery-name-error" className="text-[10px] text-destructive" role="alert">
                                {deliveryForm.formState.errors.customerName.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-xs">
                              <Phone className="size-3" /> رقم الهاتف <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...deliveryForm.register("customerPhone")}
                              placeholder="+967 XXX XXX XXX"
                              dir="ltr"
                              className="h-9 text-sm"
                              aria-invalid={!!deliveryForm.formState.errors.customerPhone}
                              aria-errormessage={deliveryForm.formState.errors.customerPhone ? "delivery-phone-error" : undefined}
                            />
                            {deliveryForm.formState.errors.customerPhone && (
                              <p id="delivery-phone-error" className="text-[10px] text-destructive" role="alert">
                                {deliveryForm.formState.errors.customerPhone.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-xs">
                              <MapPin className="size-3" /> المحافظة <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...deliveryForm.register("province")}
                              placeholder="مثال: صنعاء"
                              className="h-9 text-sm"
                              aria-invalid={!!deliveryForm.formState.errors.province}
                              aria-errormessage={deliveryForm.formState.errors.province ? "delivery-province-error" : undefined}
                            />
                            {deliveryForm.formState.errors.province && (
                              <p id="delivery-province-error" className="text-[10px] text-destructive" role="alert">
                                {deliveryForm.formState.errors.province.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-xs">
                              <MapPin className="size-3" /> المديرية <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...deliveryForm.register("district")}
                              placeholder="مثال: بني الحارث"
                              className="h-9 text-sm"
                              aria-invalid={!!deliveryForm.formState.errors.district}
                              aria-errormessage={deliveryForm.formState.errors.district ? "delivery-district-error" : undefined}
                            />
                            {deliveryForm.formState.errors.district && (
                              <p id="delivery-district-error" className="text-[10px] text-destructive" role="alert">
                                {deliveryForm.formState.errors.district.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-xs">
                              <MapPin className="size-3" /> الشارع <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...deliveryForm.register("street")}
                              placeholder="اسم الشارع"
                              className="h-9 text-sm"
                              aria-invalid={!!deliveryForm.formState.errors.street}
                              aria-errormessage={deliveryForm.formState.errors.street ? "delivery-street-error" : undefined}
                            />
                            {deliveryForm.formState.errors.street && (
                              <p id="delivery-street-error" className="text-[10px] text-destructive" role="alert">
                                {deliveryForm.formState.errors.street.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-xs">
                              <MapPin className="size-3" /> جوار أقرب معلم <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...deliveryForm.register("landmark")}
                              placeholder="أقرب معلم بارز"
                              className="h-9 text-sm"
                              aria-invalid={!!deliveryForm.formState.errors.landmark}
                              aria-errormessage={deliveryForm.formState.errors.landmark ? "delivery-landmark-error" : undefined}
                            />
                            {deliveryForm.formState.errors.landmark && (
                              <p id="delivery-landmark-error" className="text-[10px] text-destructive" role="alert">
                                {deliveryForm.formState.errors.landmark.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 text-sm !py-3 rounded-xl
                            bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold
                            shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-yellow-500
                            transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              جاري تأكيد الطلب...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-4" />
                              تأكيد الطلب
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* ─── Pickup Form ─── */}
                    {msg.formData === "pickup" && (
                      <form
                        onSubmit={pickupForm.handleSubmit(handlePickupSubmit)}
                        className="space-y-3"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-xs">
                              <User className="size-3" /> الاسم الكامل <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...pickupForm.register("customerName")}
                              placeholder="أدخل اسمك الكامل"
                              className="h-9 text-sm"
                              aria-invalid={!!pickupForm.formState.errors.customerName}
                              aria-errormessage={pickupForm.formState.errors.customerName ? "pickup-name-error" : undefined}
                            />
                            {pickupForm.formState.errors.customerName && (
                              <p id="pickup-name-error" className="text-[10px] text-destructive" role="alert">
                                {pickupForm.formState.errors.customerName.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-xs">
                              <Phone className="size-3" /> رقم الهاتف <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...pickupForm.register("customerPhone")}
                              placeholder="+967 XXX XXX XXX"
                              dir="ltr"
                              className="h-9 text-sm"
                              aria-invalid={!!pickupForm.formState.errors.customerPhone}
                              aria-errormessage={pickupForm.formState.errors.customerPhone ? "pickup-phone-error" : undefined}
                            />
                            {pickupForm.formState.errors.customerPhone && (
                              <p id="pickup-phone-error" className="text-[10px] text-destructive" role="alert">
                                {pickupForm.formState.errors.customerPhone.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 text-sm !py-3 rounded-xl
                            bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold
                            shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-yellow-500
                            transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              جاري تأكيد الطلب...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-4" />
                              تأكيد الطلب
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isSubmitting && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tr-sm bg-muted/70 border px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="size-4 animate-spin text-amber-500" />
                  <span className="text-xs text-muted-foreground">جاري معالجة الطلب...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom product info bar */}
        {currentStep !== "SUCCESS" && (
          <div className="px-4 py-2 border-t bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <ShoppingCart className="size-4 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{product.name}</p>
                <p className="text-xs text-gold-gradient font-bold">
                  {effectivePrice.toLocaleString("ar-SA")} ر.ي
                </p>
              </div>
              {deliveryType === "delivery" && currentStep !== "CHOOSE_OPTION" && currentStep !== "PRODUCT_INFO" && currentStep !== "AUTH_GATE" && (
                <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/30 text-amber-600">
                  <Truck className="size-3" /> توصيل
                </Badge>
              )}
              {deliveryType === "pickup" && currentStep !== "CHOOSE_OPTION" && currentStep !== "PRODUCT_INFO" && currentStep !== "AUTH_GATE" && (
                <Badge variant="outline" className="text-[10px] gap-1 border-emerald-500/30 text-emerald-600">
                  <Store className="size-3" /> استلام
                </Badge>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
