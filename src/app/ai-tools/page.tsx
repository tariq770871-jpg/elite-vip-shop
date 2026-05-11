import type { Metadata } from "next";
import { AiToolsSection } from "@/components/sections/ai-tools-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "أدوات الذكاء الاصطناعي",
  description:
    "أدوات ذكاء اصطناعي مجانية ومدفوعة لتحسين إنتاجيتك. أدوات كتابة، تصميم، وبرمجة ذكية — ChatGPT، Midjourney، Canva AI وأكثر.",
  alternates: {
    canonical: `${SITE_URL}/ai-tools`,
  },
  openGraph: {
    title: "أدوات الذكاء الاصطناعي | Elite VIP Shop",
    description:
      "أدوات ذكاء اصطناعي مجانية ومدفوعة لتحسين إنتاجيتك. أدوات كتابة، تصميم، وبرمجة ذكية — ChatGPT، Midjourney، Canva AI وأكثر.",
    url: `${SITE_URL}/ai-tools`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "أدوات الذكاء الاصطناعي - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أدوات الذكاء الاصطناعي | Elite VIP Shop",
    description:
      "أدوات ذكاء اصطناعي مجانية ومدفوعة لتحسين إنتاجيتك. أدوات كتابة، تصميم، وبرمجة ذكية.",
    images: ["/icons/icon-512.png"],
  },
};

export default function AiToolsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "أدوات الذكاء الاصطناعي", url: "/ai-tools" },
        ]}
      />
      <AiToolsSection />
    </>
  );
}
