"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useNavigation } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ClipboardList, LogIn, Package, RefreshCw,
  Clock, CheckCircle2, Truck, XCircle, MessageCircle,
  MessageSquare, Calendar, ShoppingBag, ChevronDown, ChevronUp,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  new: { label: "جديد", color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-950/40", icon: Clock },
  reviewing: { label: "قيد المراجعة", color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-950/40", icon: Clock },
  confirmed: { label: "مؤكد", color: "text-sky-700 dark:text-sky-400", bgColor: "bg-sky-100 dark:bg-sky-950/40", icon: CheckCircle2 },
  shipped: { label: "مشحون", color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-950/40", icon: Truck },
  delivered: { label: "تم التوصيل", color: "text-green-700 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-950/40", icon: CheckCircle2 },
  cancelled: { label: "ملغى", color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-950/40", icon: XCircle },
};

const statusSteps = ["new", "reviewing", "confirmed", "shipped", "delivered"] as const;

const statusFilters: Array<{ label: string; value: string }> = [
  { label: "الكل", value: "all" },
  { label: "جديد", value: "new" },
  { label: "قيد المراجعة", value: "reviewing" },
  { label: "مؤكد", value: "confirmed" },
  { label: "مشحون", value: "shipped" },
  { label: "تم التوصيل", value: "delivered" },
  { label: "ملغى", value: "cancelled" },
];

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
}

const mockOrders: Order[] = [
  {
    id: "ORD-1024", date: "2025-01-15", status: "new", total: 1899, payment_method: "whatsapp",
    items: [{ name: "سماعة بلوتوث فاخرة Elite Pro", quantity: 1, price: 1899 }],
  },
  {
    id: "ORD-1025", date: "2025-01-14", status: "reviewing", total: 3939, payment_method: "whatsapp",
    items: [
      { name: "ساعة ذكية VIP Series X", quantity: 1, price: 3500 },
      { name: "بور شارجر سريع 65W", quantity: 1, price: 350 },
      { name: "كتاب أسرار الربح من الإنترنت", quantity: 1, price: 89 },
    ],
  },
  {
    id: "ORD-1026", date: "2025-01-13", status: "confirmed", total: 799, payment_method: "sms",
    items: [{ name: "اشتراك VPN Premium - سنة كاملة", quantity: 1, price: 799 }],
  },
  {
    id: "ORD-1027", date: "2025-01-12", status: "shipped", total: 299, payment_method: "whatsapp", discount: 0,
    items: [{ name: "كورس التداول الاحترافي", quantity: 1, price: 299 }],
  },
  {
    id: "ORD-1028", date: "2025-01-11", status: "cancelled", total: 1149,
    items: [
      { name: "ماوس لاسلكي ميكانيكي للجيمرز", quantity: 1, price: 499 },
      { name: "طقم أدوات متعددة الاستخدام", quantity: 1, price: 650 },
    ],
  },
];

function getStepIndex(status: string): number {
  if (status === "cancelled") return -1;
  return statusSteps.indexOf(status as typeof statusSteps[number]);
}

function OrderCard({ order }: { order: Order }) {
  const config = statusConfig[order.status] || statusConfig.new;
  const StatusIcon = config.icon;
  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-3d p-4 sm:p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm flex items-center gap-1.5">
              <Package className="size-4 text-muted-foreground" />
              #{(order.order_number || order.id).slice(-6).toUpperCase()}
            </span>
            <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs`}>
              <StatusIcon className="size-3 ml-1" /> {config.label}
            </Badge>
            {order.payment_method && (
              <Badge variant="outline" className="text-[10px] gap-1">
                {order.payment_method === "whatsapp" ? (
                  <><MessageCircle className="size-3 text-green-500" /> واتساب</>
                ) : (
                  <><MessageSquare className="size-3 text-blue-500" /> رسالة نصية</>
                )}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(order.date).toLocaleDateString("ar-YE", { year: "numeric", month: "short", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="size-3" />
              {order.items.length} منتج
            </span>
          </div>
        </div>
        <div className="text-left">
          <span className="text-lg font-bold text-gold-gradient">
            {order.total.toLocaleString("ar-SA")} ر.ي
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
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

      {/* Expand Toggle */}
      <button onClick={() => setExpanded(!expanded)} className="touch-target w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {expanded ? <><ChevronUp className="size-3.5" /> إخفاء التفاصيل</> : <><ChevronDown className="size-3.5" /> عرض التفاصيل</>}
      </button>

      {expanded && (
        <div className="border-t pt-3 mt-1 space-y-2">
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
          {order.discount && order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span>الخصم</span>
              <span>-{order.discount.toLocaleString("ar-SA")} ر.ي</span>
            </div>
          )}
          {order.notes && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">📝 {order.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function OrdersSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { navigateTo } = useNavigation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(isAuthenticated && !!user?.id);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const userId = user?.id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }
    let cancelled = false;
    fetch(`/api/orders?userId=${userId}`)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (cancelled || !data || !data.orders || data.orders.length === 0) {
          setIsLoading(false);
          return;
        }
        const mappedOrders: Order[] = data.orders.map((o: { order_id: string; order_number: string; status: string; total_amount: number; created_at: string; notes: string; items: Array<{ product_name: string; quantity: number; price: number }> }) => ({
          id: o.order_id,
          order_number: o.order_number,
          date: o.created_at,
          status: o.status,
          total: Number(o.total_amount),
          items: o.items?.map((item) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: Number(item.price),
          })) || [],
          notes: o.notes,
        }));
        setOrders(mappedOrders);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, userId]);

  const filteredOrders = activeFilter === "all"
    ? orders
    : orders.filter((o) => o.status === activeFilter);

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

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="section-title-3d">
            <span className="title-icon"><Package className="size-6" /></span>
            طلباتي
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="size-4" /> تحديث
          </Button>
        </div>
        <span className="mb-6 block h-1 w-16 rounded-full bg-gold-gradient" />
        <p className="text-sm text-muted-foreground mb-6">تتبع حالة طلباتك في الوقت الحقيقي</p>

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
            <p className="text-muted-foreground">لا توجد طلبات في هذا التصنيف</p>
            <Button variant="outline" onClick={() => setActiveFilter("all")}>عرض جميع الطلبات</Button>
          </div>
        )}
      </div>
    </section>
  );
}
