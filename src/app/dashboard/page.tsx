"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { DashboardSection } from "@/components/sections/dashboard-section";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardSection />
    </ProtectedRoute>
  );
}
