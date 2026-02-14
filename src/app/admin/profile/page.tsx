"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileManagePage from "@/legacy-pages/ProfileManagePage";

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfileManagePage />
    </ProtectedRoute>
  );
}

