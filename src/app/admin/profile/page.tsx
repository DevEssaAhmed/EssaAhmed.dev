"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileManagePage from "./ProfileManagePage";

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfileManagePage />
    </ProtectedRoute>
  );
}

