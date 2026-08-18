import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/contact-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصل معنا عبر واتساب، تيليجرام أو البريد الإلكتروني. نحن هنا لخدمتك والإجابة على استفساراتك بسرعة واحترافية.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "تواصل معنا | Elite VIP Shop",
    description:
      "تواصل معنا عبر واتساب، تيليجرام أو البريد الإلكتروني. نحن هنا لخدمتك والإجابة على استفساراتك بسرعة واحترافية.",
    url: `${SITE_URL}/contact`,
    type: "website",
    locale: "ar_YE",
    siteName: SITE_NAME,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "تواصل معنا - متجر النخبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تواصل معنا | Elite VIP Shop",
    description:
      "تواصل معنا عبر واتساب، تيليجرام أو البريد الإلكتروني. نحن هنا لخدمتك.",
    images: ["/icons/icon-512.png"],
  },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "تواصل معنا", url: "/contact" },
        ]}
      />
      <ContactSection />
    </>
  );
}
