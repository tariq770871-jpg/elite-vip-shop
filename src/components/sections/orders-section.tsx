"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getAuthHeaders } from "@/lib/api-auth";
import { useNavigation } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ClipboardList, LogIn, Package, RefreshCw,
  Clock, CheckCircle2, Truck, XCircle,
  Calendar, ChevronDown, ChevronUp,
  MapPin, User, Phone, Store, Hash,
  FileText, ArrowRight,
} from "lucide-react";

/* ================================================================== */
/*  Status Configuration                                               */
/* ================================================================== */

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: "قيد الانتظار", color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-950/40", icon: Clock },
  confirmed: { label: "مؤكد", color: "text-sky-700 dark:text-sky-400", bgColor: "bg-sky-100 dark:bg-sky-950/40", icon: CheckCircle2 },
  processing: { label: "قيد المعالجة", color: "text-orange-700 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-950/40", icon: Clock },
  shipped: { label: "مشحون", color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-950/40", icon: Truck },
  delivered: { label: "تم التوصيل", color: "text-green-700 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-950/40", icon: CheckCircle2 },
  cancelled: { label: "ملغى", color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-950/40", icon: XCircle },
  // Legacy statuses for backward compatibility
  new: { label: "جديد", color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-950/40", icon: Clock },
  reviewing: { label: "قيد المراجعة", color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-950/40", icon: Clock },
};

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

const statusFilters: Array<{ label: string; value: string }> = [
  { label: "الكل", value: "all" },
  { label: "قيد الانتظار", value: "pending" },
  { label: "مؤكد", value: "confirmed" },
  { label: "قيد المعالجة", value: "processing" },
  { label: "مشحون", value: "shipped" },
  { label: "تم التوصيل", value: "delivered" },
  { label: "ملغى", value: "cancelled" },
];

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type OrderItem = { name: string; quantity: number; price: number };

interface Order {
  id: string;
  order_number?: string;
  date: string;
  status: string;
  total: number;
  payment_method?: string;
  items: OrderItem[];
  discount?: number;
  notes?: string;
  // New chat-based ordering fields
  delivery_type?: "delivery" | "pickup" | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  province?: string | null;
  district?: string | null;
  street?: string | null;
  landmark?: string | null;
  product_name_snapshot?: string | null;
  unit_price?: number | null;
  quantity_ordered?: number | null;
  total_price?: number | null;
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function getStepIndex(status: string): number {
  if (status === "cancelled") return -1;
  return statusSteps.indexOf(status as typeof statusSteps[number]);
}

function formatOrderDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("ar-YE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/* ================================================================== */
/*  Order Card Component                                               */
/* ================================================================== */

function OrderCard({ order }: { order: Order }) {
  const config = statusConfig[order.status] || statusConfig.new;
  const StatusIcon = config.icon;
  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const [expanded, setExpanded] = useState(false);

  const isDelivery = order.delivery_type === "delivery";
  const hasDeliveryInfo = isDelivery && (order.province || order.district || order.street || order.landmark);

  // Determine the primary product name (from snapshot or items)
  const primaryProductName = order.product_name_snapshot || order.items?.[0]?.name || "منتج";

  // Determine quantity (from snapshot or items)
  const displayQuantity = order.quantity_ordered || order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;

  return (
    <div className="card-3d p-4 sm:p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm flex items-center gap-1.5">
              <Package className="size-4 text-muted-foreground" />
              #{(order.order_number || order.id).slice(-6).toUpperCase()}
            </span>
            <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs`}>
              <StatusIcon className="size-3 ml-1" /> {config.label}
            </Badge>
            {/* Delivery type badge */}
            {order.delivery_type && (
              <Badge
                variant="outline"
                className={`text-[10px] gap-1 border-0 ${
                  isDelivery
                    ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                    : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {isDelivery ? (
                  <><Truck className="size-3" /> توصيل</>
                ) : (
                  <><Store className="size-3" /> بدون توصيل</>
                )}
              </Badge>
            )}
          </div>
          {/* Product name */}
          <p className="mt-1.5 text-sm font-medium truncate">{primaryProductName}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatOrderDate(order.date)}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="size-3" />
              {displayQuantity} قطعة
            </span>
          </div>
        </div>
        <div className="text-left shrink-0">
          <span className="text-lg font-bold text-gold-gradient">
            {order.total.toLocaleString("ar-SA")} ر.ي
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled && currentStep >= 0 && (
        <div className="mb-3 px-1">
          <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
            <div className="flex items-center justify-between relative min-w-[320px]">
              <div className="absolute top-3 right-3 left-3 h-0.5 bg-muted rounded-full" />
              {currentStep >= 0 && (
                <div
                  className="absolute top-3 right-3 h-0.5 bg-gold-gradient rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                />
              )}
              {statusSteps.map((step, index) => {
                const stepConfig = statusConfig[step];
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                    <div className={`touch-target size-7 sm:size-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
                      isCompleted ? "bg-gold-gradient text-black" : "bg-muted text-muted-foreground"
                    } ${isCurrent ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-background" : ""}`}>
                      {isCompleted ? <CheckCircle2 className="size-3.5" /> : <span>{index + 1}</span>}
                    </div>
                    <span className={`text-[10px] sm:text-[10px] whitespace-nowrap ${isCompleted ? "text-amber-700 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}>
                      {stepConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled status display */}
      {isCancelled && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
          <XCircle className="size-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-400 font-medium">تم إلغاء هذا الطلب</span>
        </div>
      )}

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="touch-target w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <><ChevronUp className="size-3.5" /> إخفاء التفاصيل</>
        ) : (
          <><ChevronDown className="size-3.5" /> عرض التفاصيل</>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t pt-3 mt-1 space-y-3">
          {/* Order items */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <Package className="size-3" /> المنتجات
              </p>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                  <span className="font-medium">{(item.price * item.quantity).toLocaleString("ar-SA")} ر.ي</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-1 border-t">
                <span>المجموع</span>
                <span className="text-gold-gradient">{order.total.toLocaleString("ar-SA")} ر.ي</span>
              </div>
            </div>
          )}

          {/* Customer & delivery info */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <FileText className="size-3" /> تفاصيل الطلب
            </p>

            {/* Customer name */}
            {order.customer_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">الاسم:</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
            )}

            {/* Customer phone */}
            {order.customer_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">الهاتف:</span>
                <span className="font-medium" dir="ltr">{order.customer_phone}</span>
              </div>
            )}

            {/* Delivery type label */}
            {order.delivery_type && (
              <div className="flex items-center gap-2 text-sm">
                {isDelivery ? (
                  <Truck className="size-3.5 text-blue-500 shrink-0" />
                ) : (
                  <Store className="size-3.5 text-emerald-500 shrink-0" />
                )}
                <span className="text-muted-foreground">نوع الاستلام:</span>
                <span className="font-medium">{isDelivery ? "خدمة توصيل" : "استلام شخصي"}</span>
              </div>
            )}

            {/* Delivery address */}
            {hasDeliveryInfo && (
              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1">
                  <MapPin className="size-3" /> عنوان التوصيل
                </div>
                {order.province && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-16 shrink-0">المحافظة:</span>
                    <span className="font-medium">{order.province}</span>
                  </div>
                )}
                {order.district && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-16 shrink-0">المديرية:</span>
                    <span className="font-medium">{order.district}</span>
                  </div>
                )}
                {order.street && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-16 shrink-0">الشارع:</span>
                    <span className="font-medium">{order.street}</span>
                  </div>
                )}
                {order.landmark && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-16 shrink-0">أقرب معلم:</span>
                    <span className="font-medium">{order.landmark}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Discount */}
          {order.discount && order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span>الخصم</span>
              <span>-{order.discount.toLocaleString("ar-SA")} ر.ي</span>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="rounded-lg bg-muted/50 p-2.5">
              <p className="text-xs font-bold text-muted-foreground mb-1">ملاحظات</p>
              <p className="text-xs text-muted-foreground">{order.notes}</p>
            </div>
          )}

          {/* Order number (full) */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <span>رقم الطلب الكامل</span>
            <span className="font-mono font-medium" dir="ltr">{order.order_number || order.id}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main Orders Section                                                */
/* ================================================================== */

export function OrdersSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { navigateTo } = useNavigation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(isAuthenticated && !!user?.id);
  const [orders, setOrders] = useState<Order[]>([]);
  const userId = user?.id;

  const fetchOrders = (signal?: AbortSignal) => {
    if (!isAuthenticated || !userId) {
      return;
    }
    setIsLoading(true);
    fetch(`/api/orders`, {
      signal,
      headers: { ...getAuthHeaders() },
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (!data || !data.orders || data.orders.length === 0) {
          setOrders([]);
          setIsLoading(false);
          return;
        }
        const mappedOrders: Order[] = data.orders.map((o: Record<string, unknown>) => ({
          id: (o.order_id as string) || "",
          order_number: (o.order_number as string) || "",
          date: (o.created_at as string) || "",
          status: (o.status as string) || "pending",
          total: Number(o.total_amount || 0),
          items: (Array.isArray(o.items) ? o.items : []).map((item: Record<string, unknown>) => ({
            name: (item.product_name as string) || (item.name as string) || "",
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
          })),
          notes: (o.notes as string) || undefined,
          discount: undefined,
          // New chat-based ordering fields
          delivery_type: (o.delivery_type as "delivery" | "pickup" | null) || null,
          customer_name: (o.customer_name as string) || null,
          customer_phone: (o.customer_phone as string) || null,
          province: (o.province as string) || null,
          district: (o.district as string) || null,
          street: (o.street as string) || null,
          landmark: (o.landmark as string) || null,
          product_name_snapshot: (o.product_name_snapshot as string) || null,
          unit_price: o.unit_price != null ? Number(o.unit_price) : null,
          quantity_ordered: o.quantity != null ? Number(o.quantity) : null,
          total_price: o.total_price != null ? Number(o.total_price) : null,
        }));
        setOrders(mappedOrders);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, userId]);

  const filteredOrders = activeFilter === "all"
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  // Count orders per status
  const orderCounts = statusFilters.map((f) => ({
    ...f,
    count: f.value === "all" ? orders.length : orders.filter((o) => o.status === f.value).length,
  }));

  /* ───── Not authenticated ───── */
  if (!isAuthenticated) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <ClipboardList className="size-8 text-muted-foreground" />
        </div>
        <div className="section-title-3d">
          <span className="title-icon"><Package className="size-6" /></span>
          طلباتي
        </div>
        <p className="text-muted-foreground">سجل دخولك لعرض طلباتك</p>
        <Button className="btn-3d-sm" onClick={() => navigateTo("login")}>
          <LogIn className="ms-2 size-4" /> تسجيل الدخول
        </Button>
      </section>
    );
  }

  /* ───── Authenticated ───── */
  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="section-title-3d">
            <span className="title-icon"><Package className="size-6" /></span>
            طلباتي
          </div>
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); fetchOrders(); }} className="gap-2">
            <RefreshCw className="size-4" /> تحديث
          </Button>
        </div>
        <span className="mb-6 block h-1 w-16 rounded-full bg-gold-gradient" />
        <p className="text-sm text-muted-foreground mb-6">تتبع حالة طلباتك في الوقت الحقيقي</p>

        {/* Stats summary */}
        {orders.length > 0 && (
          <div className="mb-6 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {orderCounts.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`rounded-lg px-2 py-2 text-center transition-all ${
                  activeFilter === f.value
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/50 border border-transparent hover:bg-muted"
                }`}
              >
                <span className={`block text-lg font-bold ${
                  activeFilter === f.value ? "text-primary" : "text-foreground"
                }`}>
                  {f.count}
                </span>
                <span className="block text-[10px] text-muted-foreground">{f.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`touch-target rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeFilter === f.value ? "btn-3d-sm" : "border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-3d p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ClipboardList className="size-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {orders.length === 0
                ? "لا توجد طلبات حتى الآن"
                : "لا توجد طلبات في هذا التصنيف"}
            </p>
            {orders.length === 0 ? (
              <Button variant="outline" onClick={() => navigateTo("products")}>
                <ShoppingBagIcon className="ms-2 size-4" /> تصفح المنتجات
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setActiveFilter("all")}>عرض جميع الطلبات</Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* Simple icon component to avoid import conflicts */
function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
