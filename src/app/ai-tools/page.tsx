import type { Metadata } from "next";
import { AiToolsSection } from "@/components/sections/ai-tools-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "أدوات الذكاء الاصطناعي",
  description:
    "أدوات ذكاء اصطناعي مجانية ومدفوعة لتحسين إنتاجيتك. أدوات كتابة، تصميم، وبرمجة ذكية.",
  openGraph: {
    title: "أدوات الذكاء الاصطناعي",
    description:
      "أدوات ذكاء اصطناعي مجانية ومدفوعة لتحسين إنتاجيتك. أدوات كتابة، تصميم، وبرمجة ذكية.",
    url: `${SITE_URL}/ai-tools`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function AiToolsPage() {
  return <AiToolsSection />;
}
