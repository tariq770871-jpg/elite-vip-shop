"use client";

import { MessageCircle, X, Send, Package, Truck, AlertCircle, Lightbulb } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { WHATSAPP_NUMBER } from "@/lib/site-config";

const quickActions = [
  {
    label: "استفسار عن منتج",
    icon: Package,
    message: "مرحباً، أريد الاستفسار عن منتج: ",
    color: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30",
  },
  {
    label: "متابعة طلب",
    icon: Truck,
    message: "مرحباً، أريد متابعة طلبي رقم: ",
    color: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30",
  },
  {
    label: "شكوى",
    icon: AlertCircle,
    message: "مرحباً، لدي شكوى بخصوص: ",
    color: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
  },
  {
    label: "اقتراح",
    icon: Lightbulb,
    message: "مرحباً، أود اقتراح: ",
    color: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30",
  },
];

const TOOLTIP_DISMISSED_KEY = "whatsapp-tooltip-dismissed";

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Check localStorage for tooltip dismiss preference
  useEffect(() => {
    const wasDismissed = localStorage.getItem(TOOLTIP_DISMISSED_KEY);
    if (!wasDismissed) {
      const timer = setTimeout(() => setShowTooltip(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissTooltip = useCallback(() => {
    setShowTooltip(false);
    localStorage.setItem(TOOLTIP_DISMISSED_KEY, "true");
  }, []);

  const openPanel = useCallback(() => {
    setIsAnimating(true);
    setIsOpen(true);
    setShowTooltip(false);
  }, []);

  const closePanel = useCallback(() => {
    setIsAnimating(true);
    setIsOpen(false);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Focus trap: move focus into panel when opened, trap Tab key
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    const focusableSelector = 'button, input, [tabindex]:not([tabindex="-1"])';

    // Auto-focus the input when panel opens
    const inputEl = panel.querySelector<HTMLInputElement>('input');
    if (inputEl) inputEl.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusables = panel.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on Escape when panel is open
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closePanel]);

  const handleSend = () => {
    if (message.trim()) {
      const encoded = encodeURIComponent(message);
      const w = window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
      if (w) w.opener = null;
      setMessage("");
    } else {
      const w = window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
      if (w) w.opener = null;
    }
  };

  const handleQuickAction = (action: (typeof quickActions)[number]) => {
    setMessage(action.message);
  };

  return (
    <div className="fixed bottom-20 left-4 z-50 md:bottom-6 md:left-6">
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div
          className="mb-2 flex items-center gap-2 whitespace-nowrap rounded-xl bg-card px-3 py-2 text-xs font-medium text-foreground shadow-lg border border-border animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          onClick={() => {
            openPanel();
          }}
        >
          <MessageCircle className="size-3 text-green-500" />
          <span>هل تحتاج مساعدة؟ تحدث معنا</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissTooltip();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
          <div className="absolute -bottom-1 left-6 h-2 w-2 rotate-45 bg-card border-b border-r border-border" />
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="محادثة واتساب"
          className={`mb-3 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ${isAnimating ? "animate-out fade-out-0 slide-out-to-bottom-4" : ""}`}
          onAnimationEnd={handleAnimationEnd}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-l from-green-600 to-green-500 px-4 py-3 text-white">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">متجر النخبة</p>
              <p className="text-[10px] opacity-80">متصل الآن - عادة يرد في دقائق</p>
            </div>
            <button
              onClick={closePanel}
              aria-label="إغلاق المحادثة"
              className="rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
              <p className="font-medium">مرحباً! 👋</p>
              <p className="mt-1 text-xs">
                كيف يمكننا مساعدتك؟ اختر من الخيارات السريعة أو اكتب رسالتك.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition-colors ${action.color}`}
                >
                  <action.icon className="size-3.5 shrink-0" />
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="اكتب رسالتك..."
                aria-label="رسالة واتساب"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
              />
              <button
                onClick={handleSend}
                aria-label="إرسال الرسالة"
                className="flex size-9 items-center justify-center rounded-xl bg-green-500 text-white transition-all hover:bg-green-600 hover:scale-105 active:scale-95"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={isOpen ? closePanel : openPanel}
        className={`flex size-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700 rotate-0"
            : "bg-green-500 hover:bg-green-600"
        }`}
        aria-label="تواصل عبر واتساب"
      >
        {isOpen ? (
          <X className="size-6 text-white" />
        ) : (
          <WhatsAppIcon size={24} className="size-6 text-white" />
        )}
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 animate-ping rounded-full bg-green-500/30" />
        )}
      </button>
    </div>
  );
}
