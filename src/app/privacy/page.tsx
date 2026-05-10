import type { Metadata } from "next";
import { PrivacySection } from "@/components/sections/privacy-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { safeJsonLd } from "@/lib/utils";

const SITE_URL = "https://elite-vip-shop.vercel.app";
const SITE_NAME = "Elite VIP Shop - متجر النخبة";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description:
    "سياسة الخصوصية الخاصة بمتجر النخبة — Elite VIP Shop. تعرّف على كيفية جمع واستخدام وحماية بياناتك الشخصية.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "سياسة الخصوصية | Elite VIP Shop",
    description:
      "سياسة الخصوصية الخاصة بمتجر النخبة — تعرّف على كيفية جمع واستخدام وحماية بياناتك الشخصية.",
    url: `${SITE_URL}/privacy`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "سياسة الخصوصية - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سياسة الخصوصية | Elite VIP Shop",
    description:
      "سياسة الخصوصية الخاصة بمتجر النخبة — تعرّف على كيفية جمع واستخدام وحماية بياناتك الشخصية.",
    images: ["/icons/icon-512.png"],
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
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "سياسة الخصوصية", url: "/privacy" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(privacySchema) }}
      />
      <PrivacySection />
    </>
  );
}
