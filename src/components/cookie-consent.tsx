"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, X, Cookie } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 md:p-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {/* Icon */}
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 self-center">
            <Cookie className="size-6 text-amber-500" />
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-right">
            <h3 className="mb-1 flex items-center justify-center gap-2 text-sm font-bold md:justify-start">
              <ShieldCheck className="size-4 text-green-500" />
              سياسة ملفات تعريف الارتباط
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا وتقديم محتوى مخصص
              لك. بالموافقة، ساعدنا على تقديم خدمة أفضل. يمكنك قراءة{" "}
              <button
                onClick={() => {
                  document.querySelector('[data-page="privacy"]')?.dispatchEvent(
                    new CustomEvent("click")
                  );
                }}
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                سياسة الخصوصية
              </button>{" "}
              للمزيد من التفاصيل.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-2 shrink-0">
            <button
              onClick={handleDecline}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-accent"
            >
              رفض
            </button>
            <button
              onClick={handleAccept}
              className="btn-3d-sm px-4 py-2.5 text-xs"
            >
              قبول الكل
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 left-2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground md:relative md:top-auto md:left-auto"
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
