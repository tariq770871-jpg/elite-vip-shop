import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجّل دخولك إلى حسابك في متجر النخبة للوصول إلى طلباتك وملفك الشخصي.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
