import type { Metadata } from "next";
import { ShippingSection } from "@/components/sections/shipping-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "سياسة الشحن والتوصيل",
  description:
    "سياسة الشحن والتوصيل في Elite VIP Shop. معلومات عن مناطق الشحن، مدة التوصيل، رسوم الشحن، وتتبع الطلبات بشكل مفصل.",
  alternates: {
    canonical: `${SITE_URL}/shipping-policy`,
  },
  openGraph: {
    title: "سياسة الشحن والتوصيل | Elite VIP Shop",
    description:
      "سياسة الشحن والتوصيل في Elite VIP Shop. معلومات عن مناطق الشحن، مدة التوصيل، رسوم الشحن، وتتبع الطلبات بشكل مفصل.",
    url: `${SITE_URL}/shipping-policy`,
    type: "website",
    locale: "ar_YE",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "سياسة الشحن - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سياسة الشحن والتوصيل | Elite VIP Shop",
    description:
      "سياسة الشحن والتوصيل في Elite VIP Shop. مناطق الشحن، مدة التوصيل، وتتبع الطلبات.",
    images: ["/icons/icon-512.png"],
  },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "سياسة الشحن", url: "/shipping-policy" },
        ]}
      />
      <ShippingSection />
    </>
  );
}
