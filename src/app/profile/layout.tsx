import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الملف الشخصي",
  description: "إعدادات حسابك وبياناتك الشخصية في متجر النخبة.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
