import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/about-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "تعرف على Elite VIP Shop — منصة إلكترونية تجمع متجر منتجات، تطبيقات وأدوات، وخدمات رقمية. الطلب عبر واتساب مباشرة.",
  openGraph: {
    title: "من نحن",
    description:
      "تعرف على Elite VIP Shop — منصة إلكترونية تجمع متجر منتجات، تطبيقات وأدوات، وخدمات رقمية. الطلب عبر واتساب مباشرة.",
    url: `${SITE_URL}/about`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function AboutPage() {
  return <AboutSection />;
}
