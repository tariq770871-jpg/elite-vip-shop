import type { Metadata } from "next";
import { TermsSection } from "@/components/sections/terms-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description:
    "شروط وأحكام استخدام موقع Elite VIP Shop. الطلبات عبر واتساب، سياسة الاسترجاع، وحقوق المستخدم ومسؤولياته.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: "الشروط والأحكام | Elite VIP Shop",
    description:
      "شروط وأحكام استخدام موقع Elite VIP Shop. الطلبات عبر واتساب، سياسة الاسترجاع، وحقوق المستخدم ومسؤولياته.",
    url: `${SITE_URL}/terms`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "الشروط والأحكام - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الشروط والأحكام | Elite VIP Shop",
    description:
      "شروط وأحكام استخدام موقع Elite VIP Shop. الطلبات عبر واتساب، سياسة الاسترجاع، وحقوق المستخدم.",
    images: ["/icons/icon-512.png"],
  },
};

export default function TermsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "الشروط والأحكام", url: "/terms" },
        ]}
      />
      <TermsSection />
    </>
  );
}
