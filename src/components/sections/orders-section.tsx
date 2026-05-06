"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useNavStore } from "@/store/nav-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  LogIn,
  Package,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                  */
/* ------------------------------------------------------------------ */

type OrderStatus = "جديد" | "قيد المراجعة" | "مؤكد" | "مشحون" | "ملغى";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

const statusFilters: Array<{ label: string; value: OrderStatus | "الكل" }> = [
  { label: "الكل", value: "الكل" },
  { label: "جديد", value: "جديد" },
  { label: "قيد المراجعة", value: "قيد المراجعة" },
  { label: "مؤكد", value: "مؤكد" },
  { label: "مشحون", value: "مشحون" },
  { label: "ملغى", value: "ملغى" },
];

const mockOrders: Order[] = [
  {
    id: "ORD-1024",
    date: "2025-01-15",
    status: "جديد",
    total: 1899,
    items: [
      { name: "سماعة بلوتوث فاخرة Elite Pro", quantity: 1, price: 1899 },
    ],
  },
  {
    id: "ORD-1025",
    date: "2025-01-14",
    status: "قيد المراجعة",
    total: 3939,
    items: [
      { name: "ساعة ذكية VIP Series X", quantity: 1, price: 3500 },
      { name: "بور شارجر سريع 65W", quantity: 1, price: 350 },
      { name: "كتاب أسرار الربح من الإنترنت", quantity: 1, price: 89 },
    ],
  },
  {
    id: "ORD-1026",
    date: "2025-01-13",
    status: "مؤكد",
    total: 799,
    items: [
      { name: "اشتراك VPN Premium - سنة كاملة", quantity: 1, price: 799 },
    ],
  },
  {
    id: "ORD-1027",
    date: "2025-01-12",
    status: "مشحون",
    total: 299,
    items: [
      { name: "كورس التداول الاحترافي", quantity: 1, price: 299 },
    ],
  },
  {
    id: "ORD-1028",
    date: "2025-01-11",
    status: "ملغى",
    total: 1149,
    items: [
      { name: "ماوس لاسلكي ميكانيكي للجيمرز", quantity: 1, price: 499 },
      { name: "طقم أدوات متعددة الاستخدام", quantity: 1, price: 650 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusBadge(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    جديد: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    "قيد المراجعة": "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    مؤكد: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
    مشحون: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
    ملغى: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {status}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Order Card                                                         */
/* ------------------------------------------------------------------ */

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="card-3d p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <span className="font-semibold">{order.id}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{order.date}</span>
          {statusBadge(order.status)}
        </div>
      </div>

      {/* Items */}
      <div className="mb-4 space-y-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium">
              {item.price.toLocaleString("ar-SA")} ريال يمني
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground">المجموع</span>
        <span className="text-lg font-bold text-gold-gradient">
          {order.total.toLocaleString("ar-SA")} ريال يمني
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Orders Section                                                */
/* ------------------------------------------------------------------ */

export function OrdersSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { setCurrentPage } = useNavStore();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "الكل">("الكل");

  const filteredOrders =
    activeFilter === "الكل"
      ? mockOrders
      : mockOrders.filter((o) => o.status === activeFilter);

  if (!isAuthenticated) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <ClipboardList className="size-8 text-muted-foreground" />
        </div>
        <div className="section-title-3d">
          <span className="title-icon">
            <Package className="size-6" />
          </span>
          طلباتي
        </div>
        <p className="text-muted-foreground">سجل دخولك لعرض طلباتك</p>
        <Button className="btn-3d-sm" onClick={() => setCurrentPage("login")}>
          <LogIn className="ms-2 size-4" />
          تسجيل الدخول
        </Button>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Title */}
        <div className="section-title-3d mb-2">
          <span className="title-icon">
            <Package className="size-6" />
          </span>
          طلباتي
        </div>
        <span className="mb-6 block h-1 w-16 rounded-full bg-gold-gradient" />

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeFilter === f.value
                  ? "btn-3d-sm"
                  : "border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filteredOrders.length > 0 ? (
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
            <Button variant="outline" onClick={() => setActiveFilter("الكل")}>
              عرض جميع الطلبات
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
