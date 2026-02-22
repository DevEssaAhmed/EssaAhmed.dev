"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminPage from "./AdminPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  );
}

