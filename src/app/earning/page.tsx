import type { Metadata } from "next";
import { EarningSection } from "@/components/sections/earning-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "الربح من الإنترنت",
  description:
    "أفكار ومحتوى تعليمي حول الربح من الإنترنت. طرق مجانية ومدفوعة لتحقيق دخل إضافي — تسويق بالعمولة، عمل حر، تجارة إلكترونية وأكثر.",
  alternates: {
    canonical: `${SITE_URL}/earning`,
  },
  openGraph: {
    title: "الربح من الإنترنت | Elite VIP Shop",
    description:
      "أفكار ومحتوى تعليمي حول الربح من الإنترنت. طرق مجانية ومدفوعة لتحقيق دخل إضافي — تسويق بالعمولة، عمل حر، تجارة إلكترونية وأكثر.",
    url: `${SITE_URL}/earning`,
    type: "website",
    locale: "ar_YE",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "الربح من الإنترنت - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الربح من الإنترنت | Elite VIP Shop",
    description:
      "أفكار ومحتوى تعليمي حول الربح من الإنترنت. طرق مجانية ومدفوعة لتحقيق دخل إضافي.",
    images: ["/icons/icon-512.png"],
  },
};

export default function EarningPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "الربح من الإنترنت", url: "/earning" },
        ]}
      />
      <EarningSection />
    </>
  );
}
