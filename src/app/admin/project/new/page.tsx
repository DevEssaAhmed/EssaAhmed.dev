"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ProjectEditorEnhanced = dynamic(() => import("@/components/admin/project/ProjectEditorEnhanced"), {
  ssr: false,
});

export default function Page() {
  return (
    <ProtectedRoute>
      <ProjectEditorEnhanced />
    </ProtectedRoute>
  );
}

