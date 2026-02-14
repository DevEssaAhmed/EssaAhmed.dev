"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminMaintenancePage from "@/legacy-pages/AdminMaintenancePage";

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminMaintenancePage />
    </ProtectedRoute>
  );
}

