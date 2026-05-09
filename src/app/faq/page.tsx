import type { Metadata } from "next";
import { FaqSection } from "@/components/sections/faq-section";
import { faqData } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات على أكثر الأسئلة شيوعاً حول متجر النخبة — الطلبات، الدفع، الشحن، والخدمات",
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
