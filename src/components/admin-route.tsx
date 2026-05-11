"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

/**
 * AdminRoute — wraps content that should only be visible to admin users.
 * Unlike ProtectedRoute (which only checks isAuthenticated),
 * this also verifies the user's role is "admin" or "owner".
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">جارٍ التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
        <div className="flex size-20 items-center justify-center rounded-full bg-amber-500/10">
          <Lock className="size-10 text-amber-500" />
        </div>
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">هذه الصفحة محمية</h2>
          <p className="text-sm text-muted-foreground">يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة</p>
        </div>
        <Button
          className="btn-3d-sm"
          onClick={() => router.push("/login")}
        >
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
        <div className="flex size-20 items-center justify-center rounded-full bg-red-500/10">
          <Lock className="size-10 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">غير مصرح بالوصول</h2>
          <p className="text-sm text-muted-foreground">هذه الصفحة متاحة للمديرين فقط</p>
        </div>
        <Button
          className="btn-3d-sm"
          onClick={() => router.push("/")}
        >
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
