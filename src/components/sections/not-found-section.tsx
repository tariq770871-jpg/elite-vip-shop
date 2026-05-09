"use client";

import { FileQuestion, Home } from "lucide-react";
import { useNavStore } from "@/store/nav-store";

export function NotFoundSection() {
  const { setCurrentPage } = useNavStore();

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="flex size-24 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-10 text-muted-foreground" />
      </div>
      <div className="section-title-3d">
        <span className="title-icon">
          <FileQuestion className="size-6" />
        </span>
        الصفحة غير موجودة
      </div>
      <p className="text-muted-foreground text-center max-w-sm">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
      </p>
      <button
        className="btn-3d-sm flex items-center gap-2"
        onClick={() => setCurrentPage("home")}
      >
        <Home className="size-4" />
        العودة للرئيسية
      </button>
    </section>
  );
}
