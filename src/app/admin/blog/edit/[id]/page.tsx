"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BlogEditorEnhanced from "@/legacy-pages/BlogEditorEnhanced";

export default function Page() {
  return (
    <ProtectedRoute>
      <BlogEditorEnhanced />
    </ProtectedRoute>
  );
}

