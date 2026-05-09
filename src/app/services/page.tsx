import type { Metadata } from "next";
import { ServicesSection } from "@/components/sections/services-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "الخدمات الرقمية",
  description:
    "خدمات تصميم، تطوير، وتسويق رقمي. اطلب خدمتك عبر واتساب مباشرة.",
  openGraph: {
    title: "الخدمات الرقمية",
    description:
      "خدمات تصميم، تطوير، وتسويق رقمي. اطلب خدمتك عبر واتساب مباشرة.",
    url: `${SITE_URL}/services`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function ServicesPage() {
  return <ServicesSection />;
}
