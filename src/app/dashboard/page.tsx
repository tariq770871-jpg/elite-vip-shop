"use client";

import { AdminRoute } from "@/components/admin-route";
import { DashboardSection } from "@/components/sections/dashboard-section";

export default function DashboardPage() {
  return (
    <AdminRoute>
      <DashboardSection />
    </AdminRoute>
  );
}
