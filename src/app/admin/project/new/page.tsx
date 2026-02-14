"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProjectEditorEnhanced from "@/legacy-pages/ProjectEditorEnhanced";

export default function Page() {
  return (
    <ProtectedRoute>
      <ProjectEditorEnhanced />
    </ProtectedRoute>
  );
}

