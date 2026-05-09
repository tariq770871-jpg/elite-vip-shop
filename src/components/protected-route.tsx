"use client";

import { Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">جارٍ التحقق...</p>
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
          className="btn-3d-sm flex items-center gap-2"
          onClick={() => router.push("/login")}
        >
          تسجيل الدخول
          <ArrowRight className="size-4" />
        </Button>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="size-3" />
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
