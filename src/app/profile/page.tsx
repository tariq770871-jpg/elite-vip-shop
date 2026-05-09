"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { ProfileSection } from "@/components/sections/profile-section";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileSection />
    </ProtectedRoute>
  );
}
