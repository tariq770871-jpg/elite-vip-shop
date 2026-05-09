import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/contact-section";

const SITE_URL = "https://elite-vip-shop.vercel.app";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصل معنا عبر واتساب، تيليجرام أو البريد الإلكتروني. نحن هنا لخدمتك والإجابة على استفساراتك.",
  openGraph: {
    title: "تواصل معنا",
    description:
      "تواصل معنا عبر واتساب، تيليجرام أو البريد الإلكتروني. نحن هنا لخدمتك والإجابة على استفساراتك.",
    url: `${SITE_URL}/contact`,
    type: "website",
    locale: "ar_AR",
    siteName: "Elite VIP Shop - متجر النخبة",
  },
};

export default function ContactPage() {
  return <ContactSection />;
}
