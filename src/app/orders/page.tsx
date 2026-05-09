"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { OrdersSection } from "@/components/sections/orders-section";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersSection />
    </ProtectedRoute>
  );
}
