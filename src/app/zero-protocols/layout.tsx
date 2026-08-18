import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "بروتوكولات صفر",
  description: "بروتوكولات الأمان والجودة في متجر النخبة — نلتزم بأعلى معايير الحماية والشفافية.",
  alternates: { canonical: `${SITE_URL}/zero-protocols` },
  openGraph: {
    title: `بروتوكولات صفر | ${SITE_NAME}`,
    description: "بروتوكولات الأمان والجودة في متجر النخبة.",
    url: `${SITE_URL}/zero-protocols`,
    siteName: SITE_NAME,
    locale: "ar_YE",
    type: "website",
  },
};

export default function ZeroProtocolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
