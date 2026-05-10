"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="section-title-3d">
        <span className="title-icon">
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        حدث خطأ
      </div>
      <p className="text-muted-foreground text-center max-w-md">
        نعتذر، حدث خطأ غير متوقع أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
      </p>
      <button className="btn-3d-sm" onClick={() => reset()}>
        إعادة المحاولة
      </button>
    </div>
  );
}
