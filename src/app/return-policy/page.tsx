import type { Metadata } from "next";
import { ReturnSection } from "@/components/sections/return-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

const SITE_URL = "https://elite-vip-shop.vercel.app";
const SITE_NAME = "Elite VIP Shop - متجر النخبة";

export const metadata: Metadata = {
  title: "سياسة الاسترجاع والاستبدال",
  description:
    "سياسة الاسترجاع والاستبدال في Elite VIP Shop. شروط الاسترجاع خلال 14 يوماً، إجراءات الاستبدال، واسترداد المبالغ بالكامل.",
  alternates: {
    canonical: `${SITE_URL}/return-policy`,
  },
  openGraph: {
    title: "سياسة الاسترجاع والاستبدال | Elite VIP Shop",
    description:
      "سياسة الاسترجاع والاستبدال في Elite VIP Shop. شروط الاسترجاع خلال 14 يوماً، إجراءات الاستبدال، واسترداد المبالغ بالكامل.",
    url: `${SITE_URL}/return-policy`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "سياسة الاسترجاع - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سياسة الاسترجاع والاستبدال | Elite VIP Shop",
    description:
      "سياسة الاسترجاع والاستبدال في Elite VIP Shop. شروط الاسترجاع خلال 14 يوماً.",
    images: ["/icons/icon-512.png"],
  },
};

export default function ReturnPolicyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "سياسة الاسترجاع", url: "/return-policy" },
        ]}
      />
      <ReturnSection />
    </>
  );
}
