import type { Metadata } from "next";
import { AppsSection } from "@/components/sections/apps-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "التطبيقات والأدوات",
  description:
    "مجموعة من التطبيقات والأدوات المفيدة. جميع روابط التحميل من المصادر الرسمية مثل Google Play.",
  openGraph: {
    title: "التطبيقات والأدوات",
    description:
      "مجموعة من التطبيقات والأدوات المفيدة. جميع روابط التحميل من المصادر الرسمية مثل Google Play.",
    url: `${SITE_URL}/apps`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function AppsPage() {
  return <AppsSection />;
}
