import type { Metadata } from "next";
import { TradingSection } from "@/components/sections/trading-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "التداول",
  description:
    "محتوى تعليمي وشروحات في التداول والأسواق المالية. تعلم أصول التداول بأمان.",
  openGraph: {
    title: "التداول",
    description:
      "محتوى تعليمي وشروحات في التداول والأسواق المالية. تعلم أصول التداول بأمان.",
    url: `${SITE_URL}/trading`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function TradingPage() {
  return <TradingSection />;
}
