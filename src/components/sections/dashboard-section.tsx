"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useNavStore } from "@/store/nav-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Crown,
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const mockUsers = [
  { id: "u1", name: "أحمد محمد", email: "ahmed@example.com", role: "admin" as const, status: "نشط" },
  { id: "u2", name: "سارة علي", email: "sara@example.com", role: "seller" as const, status: "نشط" },
  { id: "u3", name: "خالد عبدالله", email: "khaled@example.com", role: "user" as const, status: "معلق" },
  { id: "u4", name: "نورة سعد", email: "noura@example.com", role: "user" as const, status: "نشط" },
  { id: "u5", name: "فهد العتيبي", email: "fahad@example.com", role: "seller" as const, status: "نشط" },
];

const mockOrders = [
  { id: "ORD-1024", customer: "أحمد محمد", date: "2025-01-15", total: 1899, status: "جديد" },
  { id: "ORD-1025", customer: "سارة علي", date: "2025-01-14", total: 3939, status: "قيد المراجعة" },
  { id: "ORD-1026", customer: "خالد عبدالله", date: "2025-01-13", total: 799, status: "مؤكد" },
  { id: "ORD-1027", customer: "نورة سعد", date: "2025-01-12", total: 299, status: "مشحون" },
  { id: "ORD-1028", customer: "فهد العتيبي", date: "2025-01-11", total: 1149, status: "ملغى" },
];

const sellerProducts = [
  { id: "p1", name: "سماعة بلوتوث فاخرة", price: 1899, category: "إلكترونيات" },
  { id: "p2", name: "كورس التداول الاحترافي", price: 299, category: "كتب ودورات" },
  { id: "p3", name: "اشتراك VPN Premium", price: 799, category: "برامج وتطبيقات" },
  { id: "p4", name: "طقم أدوات متعددة", price: 650, category: "أدوات ومعدات" },
];

const sellerOrders = [
  { id: "ORD-1024", customer: "أحمد محمد", date: "2025-01-15", total: 1899, status: "جديد" },
  { id: "ORD-1026", customer: "خالد عبدالله", date: "2025-01-13", total: 799, status: "مؤكد" },
  { id: "ORD-1027", customer: "نورة سعد", date: "2025-01-12", total: 299, status: "مشحون" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const roleLabels: Record<string, string> = {
  admin: "مدير",
  seller: "بائع",
  user: "مستخدم",
};

const roleBadgeClass: Record<string, string> = {
  admin: "bg-gold-gradient text-black font-bold",
  seller: "bg-amber-600 text-white",
  user: "bg-secondary text-secondary-foreground",
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    جديد: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    "قيد المراجعة": "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    مؤكد: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
    مشحون: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
    ملغى: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  };
  return (
    <Badge variant="outline" className={map[status] ?? ""}>
      {status}
    </Badge>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="card-3d p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg bg-gold-gradient">
          <Icon className="size-5 text-black" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gold-gradient">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Admin Dashboard                                                    */
/* ------------------------------------------------------------------ */

function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers);
  const [orders] = useState(mockOrders);
  const [editUser, setEditUser] = useState<(typeof mockUsers)[0] | null>(null);
  const [editName, setEditName] = useState("");

  const openEdit = (u: (typeof mockUsers)[0]) => {
    setEditUser(u);
    setEditName(u.name);
  };

  const saveEdit = () => {
    if (!editUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editUser.id ? { ...u, name: editName } : u))
    );
    setEditUser(null);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-title-3d mb-4">
        <span className="title-icon">
          <LayoutDashboard className="size-6" />
        </span>
        لوحة تحكم المدير
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Package} value="150" label="إجمالي المنتجات" />
        <StatCard icon={Users} value="350" label="المستخدمين" />
        <StatCard icon={ShoppingCart} value="200" label="الطلبات" />
        <StatCard icon={DollarSign} value="45,000 ريال يمني" label="الإيرادات" />
      </div>

      {/* Users Management */}
      <section className="card-3d p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <Users className="size-5" />
          إدارة المستخدمين
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground" dir="ltr">{u.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${roleBadgeClass[u.role]}`}>
                      {roleLabels[u.role]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.status === "نشط" ? "border-green-500/30 text-green-700 dark:text-green-400" : "border-yellow-500/30 text-yellow-700 dark:text-yellow-400"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(u)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => deleteUser(u.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Orders Review */}
      <section className="card-3d p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <ClipboardList className="size-5" />
          مراجعة الطلبات
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="font-semibold text-gold-gradient">{o.total.toLocaleString("ar-SA")} ريال يمني</TableCell>
                  <TableCell>{statusBadge(o.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>إلغاء</Button>
            <Button className="btn-3d-sm" onClick={saveEdit}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Seller Dashboard                                                   */
/* ------------------------------------------------------------------ */

function SellerDashboard() {
  const [products] = useState(sellerProducts);
  const [orders] = useState(sellerOrders);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="section-title-3d mb-2">
            <span className="title-icon">
              <LayoutDashboard className="size-6" />
            </span>
            لوحة تحكم البائع
          </div>
        </div>
        <Button className="btn-3d-sm gap-2 self-start sm:self-auto">
          <Plus className="size-4" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Package} value="8" label="منتجاتي" />
        <StatCard icon={ShoppingCart} value="25" label="الطلبات" />
        <StatCard icon={DollarSign} value="12,000 ريال يمني" label="المبيعات" />
      </div>

      {/* My Products */}
      <section className="card-3d p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <Package className="size-5" />
          إدارة منتجاتي
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-muted">
                <Package className="size-8 text-muted-foreground" />
              </div>
              <p className="mb-1 font-semibold text-sm">{p.name}</p>
              <p className="mb-3 text-xs text-muted-foreground">{p.category}</p>
              <p className="mb-3 font-bold text-gold-gradient">{p.price.toLocaleString("ar-SA")} ريال يمني</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Pencil className="size-3" /> تعديل
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Orders Tracking */}
      <section className="card-3d p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <ClipboardList className="size-5" />
          متابعة الطلبات
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="font-semibold text-gold-gradient">{o.total.toLocaleString("ar-SA")} ريال يمني</TableCell>
                  <TableCell>{statusBadge(o.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  User Dashboard                                                     */
/* ------------------------------------------------------------------ */

function UserDashboard() {
  const user = useAuthStore((s) => s.user);

  const userOrders = [
    { id: "ORD-1024", date: "2025-01-15", total: 1899, status: "جديد" },
    { id: "ORD-1026", date: "2025-01-13", total: 799, status: "مؤكد" },
  ];

  return (
    <div className="space-y-8">
      <div className="section-title-3d mb-2">
        <span className="title-icon">
          <LayoutDashboard className="size-6" />
        </span>
        لوحة التحكم
      </div>
      <p className="text-muted-foreground">مرحباً {user?.name}</p>

      <section className="card-3d p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <ClipboardList className="size-5" />
          آخر الطلبات
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="font-semibold text-gold-gradient">{o.total.toLocaleString("ar-SA")} ريال يمني</TableCell>
                  <TableCell>{statusBadge(o.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Section                                             */
/* ------------------------------------------------------------------ */

export function DashboardSection() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { setCurrentPage } = useNavStore();

  if (!isAuthenticated) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <LogIn className="size-8 text-muted-foreground" />
        </div>
        <div className="section-title-3d">
          <span className="title-icon">
            <LayoutDashboard className="size-6" />
          </span>
          لوحة التحكم
        </div>
        <p className="text-muted-foreground">سجل دخولك للوصول إلى لوحة التحكم</p>
        <Button className="btn-3d-sm" onClick={() => setCurrentPage("login")}>
          <LogIn className="ms-2 size-4" />
          تسجيل الدخول
        </Button>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {user?.role === "admin" && <AdminDashboard />}
        {user?.role === "seller" && <SellerDashboard />}
        {user?.role === "user" && <UserDashboard />}
      </div>
    </section>
  );
}
