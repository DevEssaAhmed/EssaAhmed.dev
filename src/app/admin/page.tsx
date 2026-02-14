"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminPage from "@/legacy-pages/AdminPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  );
}

