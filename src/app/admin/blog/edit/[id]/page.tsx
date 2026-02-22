"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BlogEditorEnhanced from "@/components/admin/blog/BlogEditorEnhanced";

export default function Page() {
  return (
    <ProtectedRoute>
      <BlogEditorEnhanced />
    </ProtectedRoute>
  );
}

