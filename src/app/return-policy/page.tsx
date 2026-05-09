import type { Metadata } from "next";
import { ReturnSection } from "@/components/sections/return-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "سياسة الاسترجاع والاستبدال",
  description:
    "سياسة الاسترجاع والاستبدال في Elite VIP Shop. شروط الاسترجاع خلال 14 يوماً، إجراءات الاستبدال، واسترداد المبالغ.",
  openGraph: {
    title: "سياسة الاسترجاع والاستبدال",
    description:
      "سياسة الاسترجاع والاستبدال في Elite VIP Shop. شروط الاسترجاع خلال 14 يوماً، إجراءات الاستبدال، واسترداد المبالغ.",
    url: `${SITE_URL}/return-policy`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function ReturnPolicyPage() {
  return <ReturnSection />;
}
