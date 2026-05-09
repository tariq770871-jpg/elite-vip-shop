import type { Metadata } from "next";
import { ShippingSection } from "@/components/sections/shipping-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "سياسة الشحن والتوصيل",
  description:
    "سياسة الشحن والتوصيل في Elite VIP Shop. معلومات عن مناطق الشحن، مدة التوصيل، رسوم الشحن، وتتبع الطلبات.",
  openGraph: {
    title: "سياسة الشحن والتوصيل",
    description:
      "سياسة الشحن والتوصيل في Elite VIP Shop. معلومات عن مناطق الشحن، مدة التوصيل، رسوم الشحن، وتتبع الطلبات.",
    url: `${SITE_URL}/shipping-policy`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function ShippingPolicyPage() {
  return <ShippingSection />;
}
