import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/about-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "تعرف على Elite VIP Shop — منصة إلكترونية تجمع متجر منتجات، تطبيقات وأدوات، وخدمات رقمية. الطلب عبر واتساب مباشرة.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "من نحن | Elite VIP Shop",
    description:
      "تعرف على Elite VIP Shop — منصة إلكترونية تجمع متجر منتجات، تطبيقات وأدوات، وخدمات رقمية. الطلب عبر واتساب مباشرة.",
    url: `${SITE_URL}/about`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "من نحن - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "من نحن | Elite VIP Shop",
    description:
      "تعرف على Elite VIP Shop — منصة إلكترونية تجمع متجر منتجات، تطبيقات وأدوات، وخدمات رقمية.",
    images: ["/icons/icon-512.png"],
  },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "من نحن", url: "/about" },
        ]}
      />
      <AboutSection />
    </>
  );
}
