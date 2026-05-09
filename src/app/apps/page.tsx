import type { Metadata } from "next";
import { AppsSection } from "@/components/sections/apps-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

const SITE_URL = "https://elite-vip-shop.vercel.app";
const SITE_NAME = "Elite VIP Shop - متجر النخبة";

export const metadata: Metadata = {
  title: "التطبيقات والأدوات",
  description:
    "مجموعة من التطبيقات والأدوات المفيدة. جميع روابط التحميل من المصادر الرسمية مثل Google Play — تطبيقات إنتاجية وتعليمية وصحية.",
  alternates: {
    canonical: `${SITE_URL}/apps`,
  },
  openGraph: {
    title: "التطبيقات والأدوات | Elite VIP Shop",
    description:
      "مجموعة من التطبيقات والأدوات المفيدة. جميع روابط التحميل من المصادر الرسمية مثل Google Play — تطبيقات إنتاجية وتعليمية وصحية.",
    url: `${SITE_URL}/apps`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "التطبيقات والأدوات - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "التطبيقات والأدوات | Elite VIP Shop",
    description:
      "مجموعة من التطبيقات والأدوات المفيدة. جميع روابط التحميل من المصادر الرسمية مثل Google Play.",
    images: ["/icons/icon-512.png"],
  },
};

export default function AppsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "التطبيقات والأدوات", url: "/apps" },
        ]}
      />
      <AppsSection />
    </>
  );
}
