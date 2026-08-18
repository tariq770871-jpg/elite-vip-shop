import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "النقد والاقتراحات",
  description: "شاركنا نقدك واقتراحاتك لتحسين متجر النخبة. نسعى دائماً لتطوير خدماتنا بناءً على رأيك.",
  alternates: { canonical: `${SITE_URL}/criticism` },
  openGraph: {
    title: `النقد والاقتراحات | ${SITE_NAME}`,
    description: "شاركنا نقدك واقتراحاتك لتحسين متجر النخبة.",
    url: `${SITE_URL}/criticism`,
    siteName: SITE_NAME,
    locale: "ar_YE",
    type: "website",
  },
};

export default function CriticismLayout({ children }: { children: React.ReactNode }) {
  return children;
}
