"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminMaintenancePage from "./AdminMaintenancePage";

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminMaintenancePage />
    </ProtectedRoute>
  );
}

