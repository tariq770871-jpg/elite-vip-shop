import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور",
  description: "أعد تعيين كلمة مرور حسابك في متجر النخبة عبر البريد الإلكتروني.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
