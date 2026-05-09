import type { Metadata } from "next";
import { HomeSection } from "@/components/sections/home-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

const SITE_URL = "https://elite-vip-shop.vercel.app";
const SITE_NAME = "Elite VIP Shop - متجر النخبة";

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "منصة النخبة المتكاملة — متجر منتجات، تطبيقات وأدوات، خدمات رقمية، تداول، وربح من الإنترنت. أفضل المنتجات بأسعار تنافسية مع ضمان الجودة.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SITE_NAME,
    description:
      "منصة النخبة المتكاملة — متجر منتجات، تطبيقات وأدوات، خدمات رقمية، تداول، وربح من الإنترنت. أفضل المنتجات بأسعار تنافسية.",
    url: SITE_URL,
    type: "website",
    locale: "ar_AR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "منصة النخبة المتكاملة — متجر منتجات، تطبيقات وأدوات، خدمات رقمية، تداول، وربح من الإنترنت.",
    images: ["/icons/icon-512.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: "الرئيسية", url: "/" }]} />
      <HomeSection />
    </>
  );
}
