"use client";

import { useState } from "react";
import {
  Search,
  Moon,
  Sun,
  ShoppingCart,
  Bell,
  User,
  Menu,
  LogOut,
  LayoutDashboard,
  Package,
  Home,
  ShoppingBag,
  Smartphone,
  Bot,
  GraduationCap,
  DollarSign,
  Info,
  Phone,
  ShieldCheck,
  FileText,
  RotateCcw,
  Truck,
  X,
  ArrowRight,
  Heart,
  MessageSquareWarning,
  ShieldX,
} from "lucide-react";
import { NotificationButton } from "@/components/notification-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useNavStore } from "@/store/nav-store";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { Logo } from "@/components/logo";
import {
  WhatsAppBrandIcon,
  TelegramBrandIcon,
  EmailBrandIcon,
  FacebookBrandIcon,
} from "@/components/icons";
import type { PageName } from "@/store/nav-store";

interface NavbarProps {
  onToggleSearch: () => void;
}

const navLinks: { label: string; page: PageName; icon: React.ReactNode }[] = [
  { label: "الرئيسية", page: "home", icon: <Home className="size-4" /> },
  { label: "المنتجات", page: "products", icon: <ShoppingBag className="size-4" /> },
  { label: "التطبيقات", page: "apps", icon: <Smartphone className="size-4" /> },
  { label: "أدوات AI", page: "ai-tools", icon: <Bot className="size-4" /> },
  { label: "أكاديمية", page: "academy", icon: <GraduationCap className="size-4" /> },
  { label: "ربح من الإنترنت", page: "earning", icon: <DollarSign className="size-4" /> },
];

const infoLinks: { label: string; page: PageName; icon: React.ReactNode }[] = [
  { label: "من نحن", page: "about", icon: <Info className="size-4" /> },
  { label: "اتصل بنا", page: "contact", icon: <Phone className="size-4" /> },
  { label: "سياسة الخصوصية", page: "privacy", icon: <ShieldCheck className="size-4" /> },
  { label: "الشروط والأحكام", page: "terms", icon: <FileText className="size-4" /> },
  { label: "سياسة الاسترجاع", page: "return-policy", icon: <RotateCcw className="size-4" /> },
  { label: "سياسة الشحن", page: "shipping-policy", icon: <Truck className="size-4" /> },
  { label: "قيم الموقع", page: "values", icon: <Heart className="size-4" /> },
  { label: "بروتوكول النقد الصريح", page: "criticism", icon: <MessageSquareWarning className="size-4" /> },
  { label: "بروتوكولات الصفر", page: "zero-protocols", icon: <ShieldX className="size-4" /> },
];

const socialLinks = [
  {
    label: "واتساب",
    icon: <WhatsAppBrandIcon className="size-5" />,
    href: "https://wa.me/967782138587",
    hoverClass: "hover:bg-green-600/10 hover:text-green-500 hover:border-green-500/30",
  },
  {
    label: "تيليجرام",
    icon: <TelegramBrandIcon className="size-5" />,
    href: "https://t.me/tariq77087",
    hoverClass: "hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30",
  },
  {
    label: "بريد",
    icon: <EmailBrandIcon className="size-5" />,
    href: "mailto:tariq770871@gmail.com",
    hoverClass: "hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30",
  },
  {
    label: "فيسبوك",
    icon: <FacebookBrandIcon className="size-5" />,
    href: "https://www.facebook.com/share/1Gr8vRUE4M/",
    hoverClass: "hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/30",
  },
];

export function Navbar({ onToggleSearch }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentPage, setCurrentPage, navigateToSection, goBack, previousPage } = useNavStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const { isAuthenticated, user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: PageName) => {
    setCurrentPage(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      {/* Desktop: h-14 / Mobile: h-12 */}
      <div className="mx-auto flex h-12 items-center justify-between px-3 md:h-14 md:px-8">
        {/* Right side (RTL): Logo */}
        <Logo compact />

        {/* Center: Desktop nav links (hidden on mobile) */}
        <nav className="hidden items-center gap-1 lg:flex" role="navigation" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === link.page
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Left side (RTL left): Actions */}
        <div className="flex items-center gap-0.5 md:gap-1.5">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSearch}
            aria-label="البحث"
            className="size-8 md:size-9"
          >
            <Search className="size-4 md:size-[18px]" />
          </Button>

          {/* Theme toggle - desktop only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="تبديل الوضع"
            className="hidden size-9 md:inline-flex"
          >
            {theme === "dark" ? (
              <Sun className="size-[18px]" />
            ) : (
              <Moon className="size-[18px]" />
            )}
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 md:size-9"
            onClick={openCart}
            aria-label="السلة"
          >
            <ShoppingCart className="size-4 md:size-[18px]" />
            {totalItems > 0 && (
              <Badge className="absolute -top-0.5 -left-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[9px] md:size-5 md:text-[10px]">
                {totalItems}
              </Badge>
            )}
          </Button>

          {/* Notification */}
          <NotificationButton />

          {/* User menu - desktop only */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="القائمة" className="size-9">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {user?.name?.charAt(0) || "م"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>{user?.name || "المستخدم"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNav("profile")}>
                    <User className="ms-2 size-4" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNav("orders")}>
                    <Package className="ms-2 size-4" />
                    الطلبات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNav("dashboard")}>
                    <LayoutDashboard className="ms-2 size-4" />
                    لوحة التحكم
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut className="ms-2 size-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNav("login")}
                className="gap-1.5"
              >
                <User className="size-4" />
                <span>تسجيل الدخول</span>
              </Button>
            )}
          </div>

          {/* Mobile sidebar */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 lg:hidden"
                aria-label="القائمة"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85vw] max-w-[320px] overflow-y-auto border-border/50 bg-card p-0 [&>button]:hidden"
            >
              {/* ===== SIDEBAR HEADER ===== */}
              <div className="px-4 pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => handleNav("home")}>
                    <Logo />
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Theme Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="size-9 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground"
                      aria-label="تبديل الوضع"
                    >
                      {theme === "dark" ? (
                        <Sun className="size-5 text-amber-400" />
                      ) : (
                        <Moon className="size-5" />
                      )}
                    </Button>
                    {/* Close button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileOpen(false)}
                      className="size-9 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground"
                      aria-label="إغلاق القائمة"
                    >
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* ===== 1. PROFILE SECTION (FIRST) ===== */}
              <div className="px-3 pb-2">
                {isAuthenticated && user ? (
                  <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-gold-gradient shrink-0">
                        <User className="size-6 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold truncate">{user.name}</h3>
                        <p className="text-xs text-muted-foreground truncate" dir="ltr">{user.email}</p>
                      </div>
                    </div>
                    {/* Quick action buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleNav("profile")}
                        className="flex flex-col items-center gap-1.5 rounded-xl bg-primary/10 py-3 text-primary transition-all hover:bg-primary/20 hover:scale-[1.02]"
                      >
                        <User className="size-5" />
                        <span className="text-[10px] font-bold">الملف الشخصي</span>
                      </button>
                      <button
                        onClick={() => handleNav("orders")}
                        className="flex flex-col items-center gap-1.5 rounded-xl bg-primary/10 py-3 text-primary transition-all hover:bg-primary/20 hover:scale-[1.02]"
                      >
                        <Package className="size-5" />
                        <span className="text-[10px] font-bold">الطلبات</span>
                      </button>
                      <button
                        onClick={() => handleNav("dashboard")}
                        className="flex flex-col items-center gap-1.5 rounded-xl bg-primary/10 py-3 text-primary transition-all hover:bg-primary/20 hover:scale-[1.02]"
                      >
                        <LayoutDashboard className="size-5" />
                        <span className="text-[10px] font-bold">لوحة التحكم</span>
                      </button>
                    </div>
                    {/* Notifications & Logout row */}
                    <div className="flex items-center gap-2 mt-3">
                      <button className="touch-target flex flex-1 items-center justify-center gap-2 rounded-xl bg-card border border-border/50 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-all">
                        <Bell className="size-4" />
                        <span className="text-xs font-medium">الإشعارات</span>
                        <Badge className="flex size-4 items-center justify-center rounded-full bg-red-500 p-0 text-[9px] text-white hover:bg-red-500">{unreadCount}</Badge>
                      </button>
                      <button
                        onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="touch-target flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="size-4" />
                        خروج
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted shrink-0">
                        <User className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">زائر</h3>
                        <p className="text-xs text-muted-foreground">سجل دخولك للاستمتاع بجميع الخدمات</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNav("login")}
                      className="btn-3d w-full flex items-center justify-center gap-2 py-3.5 text-sm"
                    >
                      <User className="size-4" />
                      تسجيل الدخول / إنشاء حساب
                    </button>
                    {/* Notifications for guest */}
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-card border border-border/50 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-all mt-2">
                      <Bell className="size-4" />
                      <span className="text-xs font-medium">الإشعارات</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Gold separator */}
              <div className="mx-4 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent" />

              {/* ===== 3. MAIN NAVIGATION ===== */}
              <div className="px-3 py-2">
                <p className="mb-2 px-2 text-xs font-bold tracking-wide text-primary uppercase">
                  القائمة الرئيسية
                </p>
                {navLinks.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => handleNav(link.page)}
                    className={`touch-target flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.01] hover:shadow-sm text-right ${
                      currentPage === link.page
                        ? "border-e-[3px] border-e-transparent bg-primary/10 text-primary"
                        : "border-e-[3px] border-e-transparent text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                    }`}
                    style={
                      currentPage === link.page
                        ? {
                            borderImage:
                              "linear-gradient(to bottom, #d4a843, #f0d078, #d4a843) 1",
                          }
                        : undefined
                    }
                  >
                    {link.icon}
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Gold separator */}
              <div className="mx-4 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent" />

              {/* ===== 4. INFO LINKS ===== */}
              <div className="px-3 py-2">
                <p className="mb-2 px-2 text-xs font-bold tracking-wide text-primary uppercase">
                  معلومات
                </p>
                {infoLinks.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => handleNav(link.page)}
                    className={`touch-target flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.01] hover:shadow-sm text-right ${
                      currentPage === link.page
                        ? "border-e-[3px] border-e-transparent bg-primary/10 text-primary"
                        : "border-e-[3px] border-e-transparent text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                    }`}
                    style={
                      currentPage === link.page
                        ? {
                            borderImage:
                              "linear-gradient(to bottom, #d4a843, #f0d078, #d4a843) 1",
                          }
                        : undefined
                    }
                  >
                    {link.icon}
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Gold separator */}
              <div className="mx-4 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent" />

              {/* ===== 5. SOCIAL LINKS ===== */}
              <div className="px-3 py-2 pb-6">
                <p className="mb-2 px-2 text-xs font-bold tracking-wide text-primary uppercase">
                  تواصل اجتماعي
                </p>
                <div className="grid grid-cols-2 gap-2 px-1">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`touch-target flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/50 px-3 py-3 text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${social.hoverClass}`}
                    >
                      {social.icon}
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

    {/* ===== FLOATING BACK BUTTON ===== */}
    {currentPage !== "home" && (
      <button
        onClick={() => {
          if (previousPage) {
            goBack();
          } else {
            setCurrentPage("home");
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="fixed top-14 left-3 z-50 flex items-center justify-center gap-1.5 rounded-full bg-amber-500 text-black shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 md:top-[4.2rem] md:left-6 size-11 md:size-10 md:px-3 md:py-2"
        aria-label="رجوع"
      >
        <ArrowRight className="size-5 md:size-5" />
        <span className="text-xs font-bold">رجوع</span>
      </button>
    )}
    </>
  );
}
