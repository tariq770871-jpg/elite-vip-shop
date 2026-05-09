"use client";

import Link from "next/link";
import { Heart, MessageSquareWarning, Shield, Truck, RotateCcw, Headphones, Palette, TrendingUp, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigation, type PageName, PAGE_PATHS } from "@/lib/navigation";
import { Logo } from "@/components/logo";
import {
  WhatsAppBrandIcon,
  TelegramBrandIcon,
  FacebookBrandIcon,
  EmailBrandIcon,
} from "@/components/icons";

const quickLinks: { label: string; page: PageName }[] = [
  { label: "الرئيسية", page: "home" },
  { label: "المنتجات", page: "products" },
  { label: "الطلبات", page: "orders" },
  { label: "الملف الشخصي", page: "profile" },
];

const sectionLinks: { label: string; page: PageName }[] = [
  { label: "المتجر", page: "products" },
  { label: "التطبيقات والأدوات", page: "apps" },
  { label: "الخدمات", page: "services" },
  { label: "التداول", page: "trading" },
  { label: "ربح من الإنترنت", page: "earning" },
  { label: "أدوات AI", page: "ai-tools" },
];

const quickSectionPages: { label: string; page: PageName; icon: React.ReactNode }[] = [
  { label: "الأسئلة الشائعة", page: "faq", icon: <HelpCircle className="size-4" /> },
  { label: "قيم الموقع", page: "values", icon: <Heart className="size-4" /> },
  { label: "بروتوكول النقد الصريح", page: "criticism", icon: <MessageSquareWarning className="size-4" /> },
];

const socialLinks = [
  {
    icon: <WhatsAppBrandIcon className="size-5" />,
    href: "https://wa.me/967782138587",
    label: "واتساب",
    hoverClass: "hover:bg-green-600 hover:text-white hover:border-green-600",
  },
  {
    icon: <TelegramBrandIcon className="size-5" />,
    href: "https://t.me/tariq77087",
    label: "تلغرام",
    hoverClass: "hover:bg-sky-500 hover:text-white hover:border-sky-500",
  },
  {
    icon: <EmailBrandIcon className="size-5" />,
    href: "mailto:tariq770871@gmail.com",
    label: "البريد الإلكتروني",
    hoverClass: "hover:bg-red-500 hover:text-white hover:border-red-500",
  },
  {
    icon: <FacebookBrandIcon className="size-5" />,
    href: "https://facebook.com/share/1Gr8vRUE4M/",
    label: "فيسبوك",
    hoverClass: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
  },
];

export function Footer() {
  const { getPath } = useNavigation();

  const handleNavScroll = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-auto border-t bg-card" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo + Description */}
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              متجر النخبة الإلكتروني المتكامل. نوفر لك أفضل المنتجات والتطبيقات
              وأدوات الذكاء الاصطناعي بأسعار تنافسية مع ضمان الجودة وخدمة
              العملاء المتميزة.
            </p>
          </div>

          {/* Column 2: روابط سريعة */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold">روابط سريعة</h3>
            <nav className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={getPath(link.page)}
                  onClick={handleNavScroll}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary text-right"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: الأقسام + Quick Section Scroll */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold">الأقسام</h3>
            <nav className="flex flex-col gap-2">
              {sectionLinks.map((link) => (
                <Link
                  key={link.label}
                  href={getPath(link.page)}
                  onClick={handleNavScroll}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary text-right"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-1 h-px bg-border/50" />
              {quickSectionPages.map((link) => (
                <Link
                  key={link.page}
                  href={getPath(link.page)}
                  onClick={handleNavScroll}
                  className="flex items-center gap-2 text-sm text-amber-500 transition-colors hover:text-amber-400 text-right"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: تواصل معنا */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold">تواصل معنا</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`flex size-10 items-center justify-center rounded-lg border bg-background transition-all duration-200 text-muted-foreground ${social.hoverClass}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              تواصل معنا عبر وسائل التواصل للحصول على آخر العروض والتحديثات.
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Shield, title: "دفع آمن" },
            { icon: Truck, title: "شحن مجاني للطلبات فوق 5,000 ر.ي" },
            { icon: RotateCcw, title: "استرجاع خلال 14 يوم" },
            { icon: Headphones, title: "دعم 24/7" },
          ].map((badge) => (
            <div
              key={badge.title}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <badge.icon className="size-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {badge.title}
              </span>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Elite VIP Shop - متجر النخبة. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link
              href={PAGE_PATHS.privacy}
              onClick={handleNavScroll}
              className="transition-colors hover:text-primary"
            >
              سياسة الخصوصية
            </Link>
            <Link
              href={PAGE_PATHS.terms}
              onClick={handleNavScroll}
              className="transition-colors hover:text-primary"
            >
              شروط الاستخدام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
