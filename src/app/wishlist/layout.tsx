import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المفضلة",
  description: "قائمة المنتجات المفضلة لديك في متجر النخبة.",
  robots: { index: false, follow: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
