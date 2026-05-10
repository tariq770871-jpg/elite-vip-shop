import type { Metadata } from "next";
import { TradingSection } from "@/components/sections/trading-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

const SITE_URL = "https://elite-vip-shop.vercel.app";
const SITE_NAME = "Elite VIP Shop - متجر النخبة";

export const metadata: Metadata = {
  title: "التداول",
  description:
    "محتوى تعليمي وشروحات في التداول والأسواق المالية. تعلم أصول التداول بأمان — تحليل فني، مؤشرات، وإدارة مخاطر احترافية.",
  alternates: {
    canonical: `${SITE_URL}/trading`,
  },
  openGraph: {
    title: "التداول | Elite VIP Shop",
    description:
      "محتوى تعليمي وشروحات في التداول والأسواق المالية. تعلم أصول التداول بأمان — تحليل فني، مؤشرات، وإدارة مخاطر احترافية.",
    url: `${SITE_URL}/trading`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "التداول - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "التداول | Elite VIP Shop",
    description:
      "محتوى تعليمي وشروحات في التداول والأسواق المالية. تعلم أصول التداول بأمان.",
    images: ["/icons/icon-512.png"],
  },
};

export default function TradingPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "التداول", url: "/trading" },
        ]}
      />
      <TradingSection />
    </>
  );
}
