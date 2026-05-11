import type { Metadata } from "next";
import { ProductsSection } from "@/components/sections/products-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "المتجر",
  description:
    "تسوّق أفضل المنتجات الإلكترونية والرقمية في متجر النخبة. سماعات، ساعات ذكية، برامج، كورسات وأكثر — اطلب عبر واتساب مباشرة.",
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    title: "المتجر | Elite VIP Shop",
    description:
      "تسوّق أفضل المنتجات الإلكترونية والرقمية في متجر النخبة. سماعات، ساعات ذكية، برامج، كورسات وأكثر — اطلب عبر واتساب مباشرة.",
    url: `${SITE_URL}/products`,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "المتجر | Elite VIP Shop",
    description:
      "تسوّق أفضل المنتجات الإلكترونية والرقمية في متجر النخبة. اطلب عبر واتساب مباشرة.",
    images: ["/icons/icon-512.png"],
  },
};

export default function ProductsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "المتجر", url: "/products" },
        ]}
      />
      <ProductsSection />
    </>
  );
}
