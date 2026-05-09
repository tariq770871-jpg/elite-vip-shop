import type { Metadata } from "next";
import { FaqSection } from "@/components/sections/faq-section";
import { faqData } from "@/lib/mock-data";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description:
    "إجابات على الأسئلة الأكثر شيوعاً حول Elite VIP Shop — الطلبات، الشحن، الاسترجاع، والتواصل.",
  openGraph: {
    title: "الأسئلة الشائعة",
    description:
      "إجابات على الأسئلة الأكثر شيوعاً حول Elite VIP Shop — الطلبات، الشحن، الاسترجاع، والتواصل.",
    url: `${SITE_URL}/faq`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqSection />
    </>
  );
}
