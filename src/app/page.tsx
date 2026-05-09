"use client";

import { HomeSection } from "@/components/sections/home-section";
import { useCartStore } from "@/store/cart-store";

export default function HomePage() {
  return <HomeSection onOpenCart={() => useCartStore.getState().openCart()} />;
}
