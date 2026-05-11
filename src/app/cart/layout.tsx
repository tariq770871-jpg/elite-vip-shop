import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سلة التسوق",
  description: "راجع المنتجات في سلة التسوق وأكمل طلبك عبر واتساب.",
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
