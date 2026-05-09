import type { Metadata } from "next";
import { FaqSection } from "@/components/sections/faq-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { faqData } from "@/lib/mock-data";

const SITE_URL = "https://elite-vip-shop.vercel.app";
const SITE_NAME = "Elite VIP Shop - متجر النخبة";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description:
    "إجابات على الأسئلة الأكثر شيوعاً حول Elite VIP Shop — الطلبات، الشحن، الاسترجاع، الدفع والتواصل. اعرف كل ما تحتاج قبل الطلب.",
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: "الأسئلة الشائعة | Elite VIP Shop",
    description:
      "إجابات على الأسئلة الأكثر شيوعاً حول Elite VIP Shop — الطلبات، الشحن، الاسترجاع، الدفع والتواصل.",
    url: `${SITE_URL}/faq`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "الأسئلة الشائعة - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الأسئلة الشائعة | Elite VIP Shop",
    description:
      "إجابات على الأسئلة الأكثر شيوعاً حول Elite VIP Shop — الطلبات، الشحن، الاسترجاع، والتواصل.",
    images: ["/icons/icon-512.png"],
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
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "الأسئلة الشائعة", url: "/faq" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqSection />
    </>
  );
}
