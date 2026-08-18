import type { Metadata } from "next";
import { ServicesSection } from "@/components/sections/services-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "الخدمات الرقمية",
  description:
    "خدمات تصميم مواقع، تطوير تطبيقات، تسويق رقمي، هويات بصرية، إدارة محتوى واستشارات تقنية. اطلب خدمتك عبر واتساب مباشرة.",
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
  openGraph: {
    title: "الخدمات الرقمية | Elite VIP Shop",
    description:
      "خدمات تصميم مواقع، تطوير تطبيقات، تسويق رقمي، هويات بصرية، إدارة محتوى واستشارات تقنية. اطلب خدمتك عبر واتساب مباشرة.",
    url: `${SITE_URL}/services`,
    type: "website",
    locale: "ar_YE",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "الخدمات الرقمية - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الخدمات الرقمية | Elite VIP Shop",
    description:
      "خدمات تصميم مواقع، تطوير تطبيقات، تسويق رقمي. اطلب خدمتك عبر واتساب مباشرة.",
    images: ["/icons/icon-512.png"],
  },
};

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "الخدمات الرقمية", url: "/services" },
        ]}
      />
      <ServicesSection />
    </>
  );
}
