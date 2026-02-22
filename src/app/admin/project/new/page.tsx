"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProjectEditorEnhanced from "@/components/admin/project/ProjectEditorEnhanced";

export default function Page() {
  return (
    <ProtectedRoute>
      <ProjectEditorEnhanced />
    </ProtectedRoute>
  );
}

