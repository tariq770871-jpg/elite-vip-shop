import type { Metadata } from "next";
import { EarningSection } from "@/components/sections/earning-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "الربح من الإنترنت",
  description:
    "أفكار ومحتوى تعليمي حول الربح من الإنترنت. طرق مجانية ومدفوعة لتحقيق دخل إضافي.",
  openGraph: {
    title: "الربح من الإنترنت",
    description:
      "أفكار ومحتوى تعليمي حول الربح من الإنترنت. طرق مجانية ومدفوعة لتحقيق دخل إضافي.",
    url: `${SITE_URL}/earning`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function EarningPage() {
  return <EarningSection />;
}
