import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `غير متصل | ${SITE_NAME}`,
  description: "لا يوجد اتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.",
  robots: { index: false, follow: false },
};

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
