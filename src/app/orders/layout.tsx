import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "طلباتي",
  description: "تتبع وإدارة طلباتك في متجر النخبة.",
  robots: { index: false, follow: false },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
