"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronUp, Lock, ArrowRight } from "lucide-react";
import { useNavStore } from "@/store/nav-store";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { HomeSection } from "@/components/sections/home-section";
import { ProductsSection } from "@/components/sections/products-section";
import { AppsSection } from "@/components/sections/apps-section";
import { AiToolsSection } from "@/components/sections/ai-tools-section";
import { AcademySection } from "@/components/sections/academy-section";
import { EarningSection } from "@/components/sections/earning-section";
import { LoginSection } from "@/components/sections/login-section";
import { RegisterSection } from "@/components/sections/register-section";
import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { PrivacySection } from "@/components/sections/privacy-section";
import { TermsSection } from "@/components/sections/terms-section";
import { ReturnSection } from "@/components/sections/return-section";
import { ShippingSection } from "@/components/sections/shipping-section";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { OrdersSection } from "@/components/sections/orders-section";
import { ProfileSection } from "@/components/sections/profile-section";
import { CartPageSection } from "@/components/sections/cart-page-section";
import { ForgotPasswordSection } from "@/components/sections/forgot-password-section";
import { ValuesSection } from "@/components/sections/values-section";
import { CriticismSection } from "@/components/sections/criticism-section";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { CookieConsent } from "@/components/cookie-consent";
import { FlashDealsSection } from "@/components/sections/flash-deals-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { RecentlyViewedSection } from "@/components/sections/recently-viewed-section";
import { ZeroProtocolsSection } from "@/components/sections/zero-protocols-section";
import { WishlistSection } from "@/components/sections/wishlist-section";
import { ProductDetailSection } from "@/components/sections/product-detail-section";
import { NotFoundSection } from "@/components/sections/not-found-section";

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

// Protected routes wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { setCurrentPage } = useNavStore();

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
          onClick={() => setCurrentPage("login")}
        >
          تسجيل الدخول
          <ArrowRight className="size-4" />
        </Button>
        <button
          onClick={() => setCurrentPage("home")}
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

export function App() {
  const { currentPage, selectedProductId } = useNavStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const pageKey = useMemo(() => currentPage, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomeSection onOpenCart={() => useCartStore.getState().openCart()} />;
      case "products":
        return <ProductsSection />;
      case "apps":
        return <AppsSection />;
      case "ai-tools":
        return <AiToolsSection />;
      case "academy":
        return <AcademySection />;
      case "earning":
        return <EarningSection />;
      case "login":
        return <LoginSection />;
      case "register":
        return <RegisterSection />;
      case "about":
        return <AboutSection />;
      case "contact":
        return <ContactSection />;
      case "privacy":
        return <PrivacySection />;
      case "terms":
        return <TermsSection />;
      case "return-policy":
        return <ReturnSection />;
      case "shipping-policy":
        return <ShippingSection />;
      case "dashboard":
        return <ProtectedRoute><DashboardSection /></ProtectedRoute>;
      case "orders":
        return <ProtectedRoute><OrdersSection /></ProtectedRoute>;
      case "profile":
        return <ProtectedRoute><ProfileSection /></ProtectedRoute>;
      case "cart":
        return <CartPageSection />;
      case "forgot-password":
        return <ForgotPasswordSection />;
      case "values":
        return <ValuesSection />;
      case "criticism":
        return <CriticismSection />;
      case "zero-protocols":
        return <ZeroProtocolsSection />;
      case "wishlist":
        return <WishlistSection />;
      case "product-detail":
        return <ProductDetailSection />;
      default:
        return <NotFoundSection />;
    }
  };

  // Check auth session on mount
  useEffect(() => {
    useAuthStore.getState().checkSession();
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
      <main id="main-content" role="main" className="flex-1" key={pageKey}>
        <div className="page-enter">{renderPage()}</div>
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
