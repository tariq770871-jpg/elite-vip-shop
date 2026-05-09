"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useNavigation } from "@/lib/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  ClipboardList,
  Tag,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  Bot,
  Loader2,
  Power,
  PowerOff,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllProducts, addProduct, updateProduct, deleteProduct } from "@/lib/supabase-data";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Mock data (fallback)                                                */
/* ------------------------------------------------------------------ */

const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  reviewing: "قيد المراجعة",
  confirmed: "مؤكد",
  shipped: "مشحون",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
  refunded: "مسترجع",
};

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
  const label = ORDER_STATUS_LABELS[status] || status;
  const map: Record<string, string> = {
    new: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    reviewing: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    confirmed: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
    shipped: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
    delivered: "bg-green-700/15 text-green-800 dark:text-green-300 border-green-700/30",
    cancelled: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    refunded: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  };
  return (
    <Badge variant="outline" className={map[status] ?? ""}>
      {label}
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
    <div className="card-3d p-4 sm:p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex size-9 sm:size-11 items-center justify-center rounded-lg bg-gold-gradient shrink-0">
          <Icon className="size-4 sm:size-5 text-black" />
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-gold-gradient truncate">{value}</p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Telegram Settings Component                                         */
/* ------------------------------------------------------------------ */

function TelegramSettings() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [botStatus, setBotStatus] = useState<{ configured: boolean; chatId?: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/telegram");
      if (res.ok) {
        const data = await res.json();
        setBotStatus({ configured: data.configured, chatId: data.chatId });
      }
    } catch {
      setBotStatus({ configured: false });
    }
  };

  useEffect(() => { checkStatus(); }, []);

  const handleSave = async () => {
    if (!botToken || !chatId) { toast.error("أدخل رمز البوت ومعرف المحادثة أولاً"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken, chatId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم الحفظ! وصلتك رسالة تجريبية على تيليجرام");
        setBotToken("");
        setChatId("");
        checkStatus();
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setSaving(false); }
  };

  const handleDisconnect = async () => {
    await fetch("/api/telegram", { method: "DELETE" });
    setBotStatus({ configured: false });
    toast.success("تم إلغاء الربط");
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          {botStatus?.configured ? (
            <>
              <Wifi className="size-4 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">البوت متصل ويعمل</span>
            </>
          ) : (
            <>
              <WifiOff className="size-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">غير مفعّل بعد</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {botStatus?.configured && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs" onClick={handleDisconnect}>
              قطع الاتصال
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={checkStatus}>
            <RefreshCw className="size-3" />
          </Button>
        </div>
      </div>

      {/* Setup Guide Toggle */}
      <button
        className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShowGuide(!showGuide)}
      >
        <span>كيف أنشئ بوت تيليجرام؟ (خطوات سريعة)</span>
        <ChevronDown className={`size-4 transition-transform ${showGuide ? "rotate-180" : ""}`} />
      </button>

      {showGuide && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
          <p className="font-medium">خطوات إنشاء البوت:</p>
          <ol className="space-y-1.5 list-decimal list-inside text-muted-foreground">
            <li>افتح تيليجرام وابحث عن <span className="font-mono bg-muted px-1 rounded" dir="ltr">@BotFather</span></li>
            <li>أرسل له <span className="font-mono bg-muted px-1 rounded" dir="ltr">/newbot</span></li>
            <li>اختر اسماً للبوت — مثل: <span dir="ltr">EliteShopBot</span></li>
            <li>انسخ رمز البوت الذي يرسله لك</li>
            <li>افتح البوت الجديد واضغط <b>Start</b></li>
            <li>افتح هذا الرابط في المتصفح:<br/>
              <span className="font-mono text-xs bg-muted px-1 rounded break-all" dir="ltr">
                https://api.telegram.org/bot<b>TOKEN</b>/getUpdates
              </span><br/>
              <span className="text-xs">استبدل TOKEN برمز البوت وستجد Chat ID في "id"</span>
            </li>
          </ol>
        </div>
      )}

      {/* Input Fields */}
      {!botStatus?.configured && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm">رمز البوت (Bot Token)</Label>
            <Input
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="1234567890:ABC-DEF..."
              dir="ltr"
              type="password"
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">معرف المحادثة (Chat ID)</Label>
            <Input
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="123456789"
              dir="ltr"
              className="font-mono text-xs"
            />
          </div>
        </div>
      )}

      {!botStatus?.configured && (
        <Button onClick={handleSave} disabled={saving} className="btn-3d-sm w-full gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          حفظ وإرسال رسالة تجريبية
        </Button>
      )}

      {botStatus?.configured && (
        <p className="text-sm text-center text-muted-foreground">
          ✅ سيصلك إشعار على تيليجرام فور وضع أي طلب جديد
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Admin Dashboard                                                    */
/* ------------------------------------------------------------------ */

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  availability: boolean;
  raw?: any;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AdminOrder {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  items_count: number;
}

function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, revenue: 0 });
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  /* ---- Product CRUD State ---- */
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    category_name: "",
    availability: true,
  });
  const [productSaving, setProductSaving] = useState(false);

  const fetchAdminProducts = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) {
        setProducts(
          data.map((p: any) => ({
            id: p.product_id,
            name: p.name,
            description: p.description || "",
            price: Number(p.price),
            salePrice: p.sale_price ? Number(p.sale_price) : undefined,
            category: p.category_name || "أخرى",
            availability: p.availability,
            raw: p,
          }))
        );
      }
    } catch {
      // fallback to empty
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, []);

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", price: "", sale_price: "", category_name: "", availability: true });
    setProductDialogOpen(true);
  };

  const openEditProduct = (p: ProductRow) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      sale_price: p.salePrice ? String(p.salePrice) : "",
      category_name: p.category,
      availability: p.availability,
    });
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price.trim()) {
      toast.error("اسم المنتج والسعر مطلوبان");
      return;
    }
    setProductSaving(true);
    try {
      const payload: Record<string, any> = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        sale_price: productForm.sale_price.trim() ? Number(productForm.sale_price) : null,
        category_name: productForm.category_name.trim() || null,
        availability: productForm.availability,
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success("تم تحديث المنتج بنجاح ✅");
      } else {
        await addProduct(payload as any);
        toast.success("تمت إضافة المنتج بنجاح ✅");
      }
      setProductDialogOpen(false);
      fetchAdminProducts();
    } catch (err: any) {
      toast.error(err?.message || "فشل في حفظ المنتج");
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("تم حذف المنتج ✅");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("فشل في حذف المنتج");
    }
  };

  const handleToggleAvailability = async (p: ProductRow) => {
    try {
      await updateProduct(p.id, { availability: !p.availability });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, availability: !item.availability } : item
        )
      );
      toast.success(p.availability ? "تم إلغاء تفعيل المنتج" : "تم تفعيل المنتج");
    } catch {
      toast.error("فشل في تحديث حالة المنتج");
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch("/api/admin/orders?limit=100"),
        fetch("/api/admin/users"),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.orders) {
          setOrders(ordersData.orders);
          setStats((prev) => ({
            ...prev,
            orders: ordersData.total || ordersData.orders.length,
            revenue: ordersData.revenue || 0,
          }));
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.users) {
          setUsers(usersData.users);
          setStats((prev) => ({ ...prev, users: usersData.total || usersData.users.length }));
        }
      }

      // Fetch products count from supabase directly
      try {
        const { supabase } = await import("@/lib/supabase");
        if (supabase) {
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true });
          setStats((prev) => ({ ...prev, products: count || 0 }));
        }
      } catch { /* ignore */ }
    } catch {
      toast.error("تعذّر تحميل بيانات لوحة التحكم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(`تم تحديث الحالة إلى: ${ORDER_STATUS_LABELS[newStatus]}`);
      } else {
        toast.error("فشل تحديث حالة الطلب");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openEdit = (u: AdminUser) => {
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard icon={Package} value={loading ? "..." : String(stats.products)} label="إجمالي المنتجات" />
        <StatCard icon={Users} value={loading ? "..." : String(stats.users)} label="المستخدمين" />
        <StatCard icon={ShoppingCart} value={loading ? "..." : String(stats.orders)} label="الطلبات" />
        <StatCard icon={DollarSign} value={loading ? "..." : `${stats.revenue.toLocaleString("ar-SA")} ر.ي`} label="الإيرادات" />
      </div>

      {/* Users Management */}
      <section className="card-3d p-4 sm:p-6">
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
                      <Button variant="ghost" size="icon" className="touch-target size-11" onClick={() => openEdit(u)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="touch-target size-11 text-destructive hover:text-destructive" onClick={() => deleteUser(u.id)}>
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
      <section className="card-3d p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList className="size-5" />
            مراجعة الطلبات
            {orders.length > 0 && (
              <Badge variant="outline" className="text-xs">{orders.length}</Badge>
            )}
          </h2>
          <Button variant="outline" size="sm" onClick={fetchAdminData} disabled={loading} className="gap-1">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 className="size-5 animate-spin text-gold-gradient" />
            <span className="text-sm text-muted-foreground">جارٍ تحميل الطلبات...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <ClipboardList className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.order_id}>
                    <TableCell className="font-medium text-xs" dir="ltr">
                      #{(o.order_number || o.order_id).slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate">{o.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs" dir="ltr">{o.customer_phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(o.created_at).toLocaleDateString("ar-YE", { month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="font-semibold text-gold-gradient">
                      {Number(o.total_amount).toLocaleString("ar-SA")} ر.ي
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-muted transition-colors"
                            disabled={updatingOrderId === o.order_id}
                          >
                            {updatingOrderId === o.order_id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              statusBadge(o.status)
                            )}
                            <ChevronDown className="size-3 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                            <DropdownMenuItem
                              key={value}
                              onClick={() => handleUpdateOrderStatus(o.order_id, value)}
                              className={o.status === value ? "font-bold" : ""}
                            >
                              {label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-md w-[calc(100%-1.5rem)]">
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

      {/* Product Management */}
      <section className="card-3d p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package className="size-5" />
            إدارة المنتجات
          </h2>
          <Button className="btn-3d-sm gap-2" onClick={openAddProduct}>
            <Plus className="size-4" />
            إضافة منتج
          </Button>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 className="size-5 animate-spin text-gold-gradient" />
            <span className="text-sm text-muted-foreground">جارٍ تحميل المنتجات...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Package className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">لا توجد منتجات بعد</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {p.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gold-gradient">
                          {p.salePrice ? p.salePrice.toLocaleString("ar-SA") : p.price.toLocaleString("ar-SA")}
                        </span>
                        <span className="text-xs text-muted-foreground">ر.ي</span>
                        {p.salePrice && p.salePrice < p.price && (
                          <span className="mr-1 text-xs text-muted-foreground line-through">
                            {p.price.toLocaleString("ar-SA")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          p.availability
                            ? "border-green-500/30 text-green-700 dark:text-green-400"
                            : "border-red-500/30 text-red-700 dark:text-red-400"
                        }
                      >
                        {p.availability ? "متوفر" : "غير متوفر"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => handleToggleAvailability(p)}
                          title={p.availability ? "إلغاء التفعيل" : "تفعيل"}
                        >
                          {p.availability ? (
                            <Power className="size-4 text-green-600" />
                          ) : (
                            <PowerOff className="size-4 text-red-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEditProduct(p)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Product Dialog (Add / Edit) */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto w-[calc(100%-1.5rem)]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>اسم المنتج *</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="أدخل اسم المنتج"
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="وصف المنتج..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>السعر (ر.ي) *</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0"
                  min="0"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>سعر الخصم (اختياري)</Label>
                <Input
                  type="number"
                  value={productForm.sale_price}
                  onChange={(e) => setProductForm((f) => ({ ...f, sale_price: e.target.value }))}
                  placeholder="0"
                  min="0"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Input
                value={productForm.category_name}
                onChange={(e) => setProductForm((f) => ({ ...f, category_name: e.target.value }))}
                placeholder="مثال: إلكترونيات"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm">متوفر في المخزون</Label>
              <Switch
                checked={productForm.availability}
                onCheckedChange={(checked) =>
                  setProductForm((f) => ({ ...f, availability: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="btn-3d-sm"
              onClick={handleSaveProduct}
              disabled={productSaving}
            >
              {productSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {editingProduct ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coupon Management */}
      <section className="card-3d p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <Tag className="size-5" />
          إدارة كوبونات الخصم
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { code: "WELCOME10", discount: "10%", min: "0 ر.ي", status: "نشط" },
            { code: "VIP20", discount: "20%", min: "5,000 ر.ي", status: "نشط" },
            { code: "SUMMER15", discount: "15%", min: "3,000 ر.ي", status: "نشط" },
            { code: "ELITE25", discount: "25%", min: "10,000 ر.ي", status: "نشط" },
          ].map((c) => (
            <div key={c.code} className="rounded-lg border p-3 text-center">
              <p className="font-bold text-gold-gradient text-lg">{c.discount}</p>
              <p className="text-xs font-mono bg-muted rounded px-2 py-0.5 mt-1 inline-block" dir="ltr">{c.code}</p>
              <p className="text-[10px] text-muted-foreground mt-1">الحد الأدنى: {c.min}</p>
              <Badge variant="outline" className="mt-2 text-[10px] border-green-500/30 text-green-700 dark:text-green-400">{c.status}</Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">💡 شارك هذه الأكواد مع العملاء لتحفيزهم على الشراء</p>
      </section>

      {/* Telegram Bot Settings */}
      <section className="card-3d p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <Bot className="size-5" />
          إشعارات تيليجرام
        </h2>
        <TelegramSettings />
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Seller Dashboard                                                   */
/* ------------------------------------------------------------------ */

function SellerDashboard() {
  const [products] = useState<any[]>([]);
  const [orders] = useState<any[]>([]);

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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Package} value="8" label="منتجاتي" />
        <StatCard icon={ShoppingCart} value="25" label="الطلبات" />
        <StatCard icon={DollarSign} value="12,000 ريال يمني" label="المبيعات" />
      </div>

      {/* My Products */}
      <section className="card-3d p-4 sm:p-6">
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
      <section className="card-3d p-4 sm:p-6">
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

interface UserOrder {
  order_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

function UserDashboard() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setOrdersLoading(false); return; }
    async function fetchOrders() {
      try {
        const res = await fetch(`/api/orders?userId=${user.id}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          const raw = data.orders || data || [];
          setOrders(Array.isArray(raw) ? raw : []);
        }
      } catch { /* ignore */ } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <div className="section-title-3d mb-2">
        <span className="title-icon">
          <LayoutDashboard className="size-6" />
        </span>
        لوحة التحكم
      </div>
      <p className="text-muted-foreground">مرحباً {user?.name} 👋</p>

      {/* User Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={ShoppingCart} value={ordersLoading ? "..." : String(orders.length)} label="طلباتي" />
        <StatCard
          icon={DollarSign}
          value={ordersLoading ? "..." : `${orders.reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString("ar-SA")} ر.ي`}
          label="إجمالي مشترياتي"
        />
        <StatCard
          icon={CheckCircle2}
          value={ordersLoading ? "..." : String(orders.filter((o) => o.status === "delivered").length)}
          label="طلبات مكتملة"
        />
      </div>

      <section className="card-3d p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <ClipboardList className="size-5" />
          طلباتي
          {orders.length > 0 && (
            <Badge variant="outline" className="text-xs">{orders.length}</Badge>
          )}
        </h2>
        {ordersLoading ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 className="size-5 animate-spin text-gold-gradient" />
            <span className="text-sm text-muted-foreground">جارٍ تحميل طلباتك...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <ShoppingCart className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">لا توجد طلبات بعد</p>
            <p className="text-xs text-muted-foreground">تسوّق الآن واستمتع بأفضل العروض</p>
          </div>
        ) : (
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
                {orders.map((o) => (
                  <TableRow key={o.order_id}>
                    <TableCell className="font-medium text-xs" dir="ltr">
                      #{(o.order_number || o.order_id).slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(o.created_at).toLocaleDateString("ar-YE", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="font-semibold text-gold-gradient">
                      {Number(o.total_amount).toLocaleString("ar-SA")} ر.ي
                    </TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
  const { navigateTo } = useNavigation();

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
        <Button className="btn-3d-sm" onClick={() => navigateTo("login")}>
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
