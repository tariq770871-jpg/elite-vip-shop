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
import { useCartStore } from "@/store/cart-store";
import { useNavigation } from "@/lib/navigation";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Zod Schemas                                                        */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
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
  | "AUTH_CHECK"
  | "WELCOME"
  | "CHOOSE_ACTION"
  | "DELIVERY_TYPE"
  | "DELIVERY_FORM"
  | "PICKUP_FORM"
  | "CONFIRMATION"
  | "SUCCESS";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

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
      setCurrentStep("AUTH_CHECK");
      setQuantity(1);
      setDeliveryType("pickup");
      setIsSubmitting(false);
      setOrderNumber("");
      deliveryForm.reset();
      pickupForm.reset();

      // Small delay for transition, then start the flow
      const timer = setTimeout(() => {
        startChatFlow();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, product?.id]);

  // Re-open modal automatically when user logs in (if was previously blocked)
  useEffect(() => {
    if (isAuthenticated && product && !open && currentStep === "AUTH_CHECK") {
      // This handles the case where user was sent to login/register
      // and then came back — the parent component should handle re-opening
    }
  }, [isAuthenticated]);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg.id;
  }, []);

  const startChatFlow = useCallback(() => {
    if (!isAuthenticated) {
      setCurrentStep("AUTH_CHECK");
      addMessage({
        type: "bot",
        content: "يجب تسجيل الدخول أو إنشاء حساب أولاً لإكمال الطلب. 🔒",
        actions: [
          { label: "تسجيل الدخول", value: "login" },
          { label: "إنشاء حساب جديد", value: "register" },
        ],
      });
    } else {
      showWelcome();
    }
  }, [isAuthenticated, addMessage]);

  const showWelcome = useCallback(() => {
    if (!product) return;
    setCurrentStep("WELCOME");

    const effectivePrice =
      product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    addMessage({
      type: "bot",
      content: `🎉 مرحباً بك في متجر النخبة!\n\n📦 المنتج: ${product.name}\n💰 السعر: ${effectivePrice.toLocaleString("ar-SA")} ر.ي\n📊 الكمية: ${quantity}\n\n⚠️ لا تقم بأي عملية دفع إلا بعد تأكيد الطلب والتواصل الرسمي مع فريقنا.`,
    });

    // Then show action buttons
    setTimeout(() => {
      setCurrentStep("CHOOSE_ACTION");
      addMessage({
        type: "bot",
        content: "كيف تريد المتابعة؟",
        actions: [
          { label: "🛒 طلب المنتج", value: "order" },
          { label: "❓ استعلام عن المنتج", value: "inquiry" },
        ],
      });
    }, 600);
  }, [product, quantity, addMessage]);

  // Update welcome message when quantity changes
  useEffect(() => {
    if (currentStep === "WELCOME" || currentStep === "CHOOSE_ACTION") {
      // Re-add the welcome message with updated quantity
      // We do NOT re-add, just update the existing first bot message content
      if (product && messages.length > 0) {
        const effectivePrice =
          product.salePrice && product.salePrice < product.price
            ? product.salePrice
            : product.price;
        setMessages((prev) =>
          prev.map((msg, idx) => {
            if (idx === 0 && msg.type === "bot") {
              return {
                ...msg,
                content: `🎉 مرحباً بك في متجر النخبة!\n\n📦 المنتج: ${product.name}\n💰 السعر: ${effectivePrice.toLocaleString("ar-SA")} ر.ي\n📊 الكمية: ${quantity}\n\n⚠️ لا تقم بأي عملية دفع إلا بعد تأكيد الطلب والتواصل الرسمي مع فريقنا.`,
              };
            }
            return msg;
          })
        );
      }
    }
  }, [quantity]);

  const handleActionClick = useCallback(
    (actionValue: string) => {
      // Add user message showing their choice
      const actionLabels: Record<string, string> = {
        login: "تسجيل الدخول",
        register: "إنشاء حساب جديد",
        order: "🛒 طلب المنتج",
        inquiry: "❓ استعلام عن المنتج",
        delivery: "🚚 خدمة توصيل",
        pickup: "🏪 بدون توصيل",
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
        case "order":
          setCurrentStep("DELIVERY_TYPE");
          setTimeout(() => {
            addMessage({
              type: "bot",
              content: "اختر نوع الاستلام:",
              actions: [
                { label: "🚚 خدمة توصيل", value: "delivery" },
                { label: "🏪 بدون توصيل", value: "pickup" },
              ],
            });
          }, 400);
          break;
        case "delivery":
          setDeliveryType("delivery");
          setCurrentStep("DELIVERY_FORM");
          setTimeout(() => {
            addMessage({
              type: "bot",
              content: "يرجى إدخال بيانات التوصيل:",
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

  const handleDeliverySubmit = useCallback(
    async (data: DeliveryFormData) => {
      addMessage({
        type: "user",
        content: `👤 ${data.customerName}\n📞 ${data.customerPhone}\n📍 ${data.province}, ${data.district}, ${data.street}\n🏗️ ${data.landmark}`,
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
      setCurrentStep("CONFIRMATION");

      const effectivePrice =
        product.salePrice && product.salePrice < product.price
          ? product.salePrice
          : product.price;
      const totalPrice = effectivePrice * quantity;

      const cartStore = useCartStore.getState();
      const appliedCoupon = cartStore.appliedCoupon;

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
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
            couponCode: appliedCoupon?.code,
            discount: 0,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setOrderNumber(data.orderNumber || "N/A");
          setCurrentStep("SUCCESS");
          addMessage({
            type: "bot",
            content: `شكراً لك، تم استلام طلبك بنجاح وسيتم التواصل معك قريباً. 🎉\n\n📦 رقم الطلب: ${data.orderNumber || "N/A"}`,
          });
          toast.success("تم تأكيد طلبك بنجاح! 🎉");

          // Auto close after 4 seconds
          setTimeout(() => {
            onOpenChange(false);
          }, 4000);
        } else {
          addMessage({
            type: "system",
            content: `❌ ${data.error || "حدث خطأ أثناء إرسال الطلب"}`,
          });
          toast.error(data.error || "حدث خطأ أثناء إرسال الطلب");
          setCurrentStep("CHOOSE_ACTION");
        }
      } catch {
        addMessage({
          type: "system",
          content: "❌ حدث خطأ في الاتصال بالخادم",
        });
        toast.error("حدث خطأ في الاتصال بالخادم");
        setCurrentStep("CHOOSE_ACTION");
      } finally {
        setIsSubmitting(false);
      }
    },
    [product, quantity, addMessage, onOpenChange]
  );

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
        <DialogHeader className="px-4 pt-4 pb-2 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-right text-base">
            <ShoppingCart className="size-5 text-gold-gradient" />
            طلب المنتج
          </DialogTitle>
          <DialogDescription className="text-right text-xs">
            أكمِل الطلب عبر المحادثة
          </DialogDescription>
        </DialogHeader>

        {/* Quantity Selector - always visible at top */}
        {currentStep !== "SUCCESS" && (
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
            <span className="text-sm font-medium">الكمية</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
                aria-label="تقليل الكمية"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
                aria-label="زيادة الكمية"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <span className="font-bold text-gold-gradient text-sm">
              {totalPrice.toLocaleString("ar-SA")} ر.ي
            </span>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[300px] max-h-[50vh]">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* Bot / System messages - right side in RTL */}
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

              {/* User messages - left side in RTL */}
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
                            />
                            {deliveryForm.formState.errors.customerName && (
                              <p className="text-[10px] text-destructive">
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
                            />
                            {deliveryForm.formState.errors.customerPhone && (
                              <p className="text-[10px] text-destructive">
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
                            />
                            {deliveryForm.formState.errors.province && (
                              <p className="text-[10px] text-destructive">
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
                            />
                            {deliveryForm.formState.errors.district && (
                              <p className="text-[10px] text-destructive">
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
                            />
                            {deliveryForm.formState.errors.street && (
                              <p className="text-[10px] text-destructive">
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
                            />
                            {deliveryForm.formState.errors.landmark && (
                              <p className="text-[10px] text-destructive">
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
                              تأكيد البيانات
                            </>
                          )}
                        </button>
                      </form>
                    )}

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
                            />
                            {pickupForm.formState.errors.customerName && (
                              <p className="text-[10px] text-destructive">
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
                            />
                            {pickupForm.formState.errors.customerPhone && (
                              <p className="text-[10px] text-destructive">
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
                              تأكيد البيانات
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
              {deliveryType === "delivery" && currentStep !== "DELIVERY_TYPE" && currentStep !== "WELCOME" && currentStep !== "CHOOSE_ACTION" && currentStep !== "AUTH_CHECK" && (
                <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/30 text-amber-600">
                  <Truck className="size-3" /> توصيل
                </Badge>
              )}
              {deliveryType === "pickup" && currentStep !== "DELIVERY_TYPE" && currentStep !== "WELCOME" && currentStep !== "CHOOSE_ACTION" && currentStep !== "AUTH_CHECK" && (
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
