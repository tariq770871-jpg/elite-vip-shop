"use client";

import { MessageCircle, X, Send } from "lucide-react";
import { useState } from "react";

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip after 3 seconds
  useState(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  });

  const handleSend = () => {
    if (message.trim()) {
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/967782138587?text=${encoded}`, "_blank");
      setMessage("");
    } else {
      window.open("https://wa.me/967782138587", "_blank");
    }
  };

  return (
    <div className="fixed bottom-20 left-4 z-50 md:bottom-6 md:left-6">
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div
          className="mb-2 flex items-center gap-2 whitespace-nowrap rounded-xl bg-card px-3 py-2 text-xs font-medium text-foreground shadow-lg border border-border"
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
        >
          <MessageCircle className="size-3 text-green-500" />
          <span>هل تحتاج مساعدة؟ تحدث معنا</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
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
        <div className="mb-3 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
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
              onClick={() => setIsOpen(false)}
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
                كيف يمكننا مساعدتك؟ اكتب رسالتك وسنرد عليك في أقرب وقت.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-3 flex flex-wrap gap-2">
              {["الاستفسار عن منتج", "متابعة طلب", "مشكلة تقنية"].map((action) => (
                <button
                  key={action}
                  onClick={() => setMessage(action)}
                  className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-[10px] font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                >
                  {action}
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
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
              />
              <button
                onClick={handleSend}
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
        onClick={() => setIsOpen(!isOpen)}
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
          <MessageCircle className="size-6 text-white" />
        )}
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 animate-ping rounded-full bg-green-500/30" />
        )}
      </button>
    </div>
  );
}
