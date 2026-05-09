"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { CookieConsent } from "@/components/cookie-consent";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
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
    const referrer = document.referrer
      ? new URL(document.referrer).hostname
      : "مباشر";

    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "visit",
        data: { device, referrer },
      }),
    }).catch(() => {});
  }, []);

  // Register Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
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
