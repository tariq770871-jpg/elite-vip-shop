import type { Metadata } from "next";
import { TermsSection } from "@/components/sections/terms-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description:
    "شروط وأحكام استخدام موقع Elite VIP Shop. الطلبات عبر واتساب، سياسة الاسترجاع، وحقوق المستخدم.",
  openGraph: {
    title: "الشروط والأحكام",
    description:
      "شروط وأحكام استخدام موقع Elite VIP Shop. الطلبات عبر واتساب، سياسة الاسترجاع، وحقوق المستخدم.",
    url: `${SITE_URL}/terms`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function TermsPage() {
  return <TermsSection />;
}
