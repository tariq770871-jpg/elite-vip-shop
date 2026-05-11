import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حساباً جديداً في متجر النخبة واستمتع بمزايا حصرية وعروض خاصة.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
