import type { Metadata } from "next";
import { AcademySection } from "@/components/sections/academy-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "الأكاديمية",
  description:
    "أكاديمية النخبة لتعلم التداول والأسواق المالية. دورات في التحليل الفني، العملات الرقمية، وإدارة المخاطر من الصفر للاحتراف.",
  alternates: {
    canonical: `${SITE_URL}/academy`,
  },
  openGraph: {
    title: "الأكاديمية | Elite VIP Shop",
    description:
      "أكاديمية النخبة لتعلم التداول والأسواق المالية. دورات في التحليل الفني، العملات الرقمية، وإدارة المخاطر من الصفر للاحتراف.",
    url: `${SITE_URL}/academy`,
    type: "website",
    locale: "ar_YE",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "أكاديمية النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الأكاديمية | Elite VIP Shop",
    description:
      "أكاديمية النخبة لتعلم التداول والأسواق المالية. دورات من الصفر للاحتراف.",
    images: ["/icons/icon-512.png"],
  },
};

export default function AcademyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "الأكاديمية", url: "/academy" },
        ]}
      />
      <AcademySection />
    </>
  );
}
