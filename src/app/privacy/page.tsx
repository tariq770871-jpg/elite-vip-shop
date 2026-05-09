import type { Metadata } from "next";
import { PrivacySection } from "@/components/sections/privacy-section";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description:
    "سياسة الخصوصية الخاصة بمتجر النخبة — Elite VIP Shop. تعرّف على كيفية جمع واستخدام وحماية بياناتك الشخصية.",
  alternates: {
    canonical: "https://elite-vip-shop.vercel.app/privacy",
  },
  openGraph: {
    title: "سياسة الخصوصية | Elite VIP Shop - متجر النخبة",
    description:
      "سياسة الخصوصية الخاصة بمتجر النخبة — تعرّف على كيفية جمع واستخدام وحماية بياناتك الشخصية.",
    url: "https://elite-vip-shop.vercel.app/privacy",
    type: "website",
  },
};

const privacySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "سياسة الخصوصية | Elite VIP Shop",
  description:
    "سياسة الخصوصية الخاصة بمتجر النخبة — Elite VIP Shop. تعرّف على كيفية جمع واستخدام وحماية بياناتك الشخصية.",
  url: "https://elite-vip-shop.vercel.app/privacy",
  isPartOf: {
    "@type": "WebSite",
    name: "Elite VIP Shop - متجر النخبة",
    url: "https://elite-vip-shop.vercel.app",
  },
  about: {
    "@type": "Organization",
    name: "Elite VIP Shop",
    url: "https://elite-vip-shop.vercel.app",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+967-782-138-587",
      contactType: "customer service",
      availableLanguage: "Arabic",
    },
  },
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
      />
      <PrivacySection />
    </>
  );
}
