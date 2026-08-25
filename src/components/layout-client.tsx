"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { CookieConsent } from "@/components/cookie-consent";
import { useAuthStore } from "@/store/auth-store";
import { SCROLL_TO_TOP_THRESHOLD, SW_UPDATE_INTERVAL_MS } from "@/lib/constants";
import { safeParseUrl } from "@/lib/utils";

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_TO_TOP_THRESHOLD);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="scroll-top-btn fixed bottom-5 left-5 z-50 flex size-11 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label="الصعود للأعلى"
    >
      <ChevronUp className="size-5" />
    </button>
  );
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);

  // Check auth session on mount
  useEffect(() => {
    useAuthStore.getState().checkSession();
  }, []);

  // Visitor tracker — once per session only
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "elite_visited";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const device = /Mobi|Android/i.test(navigator.userAgent) ? "جوال" : "كمبيوتر";
    // Safely parse referrer URL — document.referrer may be an invalid URL string
    const referrerUrl = document.referrer ? safeParseUrl(document.referrer) : null;
    const referrer = referrerUrl?.hostname || (document.referrer ? "مباشر" : "مباشر");

    const trackingTimer = window.setTimeout(() => {
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "visit",
          data: { device, referrer },
        }),
        keepalive: true,
      }).catch((err) => {
        // Non-critical — visitor tracking is best-effort; log for monitoring
        console.warn("Visitor tracking failed:", err instanceof Error ? err.message : String(err));
      });
    }, 1500);

    return () => window.clearTimeout(trackingTimer);
  }, []);

  // Register Service Worker with update handling
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      let updateInterval: ReturnType<typeof setInterval> | null = null;

      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Check for updates periodically
          updateInterval = setInterval(() => registration.update(), SW_UPDATE_INTERVAL_MS);

          // Notify user when a new version is available
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "activated" &&
                navigator.serviceWorker.controller
              ) {
                // New version activated — could prompt user to reload, but for now
                // we rely on the browser's default behavior of using the new SW on next navigation.
                console.info("[SW] New service worker activated.");
              }
            });
          });
        })
        .catch((err) => {
          // Service Worker registration failed — non-critical, but log for monitoring
          console.warn("Service Worker registration failed:", err instanceof Error ? err.message : String(err));
        });

      return () => {
        if (updateInterval) clearInterval(updateInterval);
      };
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-primary"
      >
        تخطي إلى المحتوى الرئيسي
      </a>
      <Navbar onToggleSearch={() => { setSearchOpen((prev) => !prev); setSearchKey((k) => k + 1); }} />
      <SearchBar key={searchKey} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <main id="main-content" role="main" className="flex-1">
        <div className="page-enter">{children}</div>
      </main>
      <Footer />
      <CartDrawer />
      <ScrollToTopButton />
      <PWAInstallPrompt />
      <FloatingWhatsApp />
      <CookieConsent />
    </div>
  );
}
