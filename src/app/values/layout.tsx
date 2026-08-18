import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "قيمنا",
  description: "تعرف على القيم والمبادئ التي تقوم عليها منصة النخبة — الجودة، الثقة، الابتكار، وخدمة العملاء.",
  alternates: { canonical: `${SITE_URL}/values` },
  openGraph: {
    title: `قيمنا | ${SITE_NAME}`,
    description: "تعرف على القيم والمبادئ التي تقوم عليها منصة النخبة.",
    url: `${SITE_URL}/values`,
    siteName: SITE_NAME,
    locale: "ar_YE",
    type: "website",
  },
};

export default function ValuesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
