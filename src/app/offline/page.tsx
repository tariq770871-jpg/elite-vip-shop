"use client";

import { WifiOff, Home, RefreshCw } from "lucide-react";
import { SITE_NAME } from "@/lib/site-config";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-12 text-muted-foreground" />
      </div>
      <div>
        <h1 className="mb-2 text-2xl font-bold">لا يوجد اتصال بالإنترنت</h1>
        <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
          يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
          يمكنك تصفح الصفحات المحفوظة سابقاً في وضع عدم الاتصال.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <RefreshCw className="size-4" />
          إعادة المحاولة
        </button>
        <a
          href="/"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Home className="size-4" />
          الرئيسية
        </a>
      </div>
      <p className="text-xs text-muted-foreground">{SITE_NAME}</p>
    </div>
  );
}
