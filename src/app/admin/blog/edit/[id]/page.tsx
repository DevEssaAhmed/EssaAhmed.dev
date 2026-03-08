"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const BlogEditorEnhanced = dynamic(() => import("@/components/admin/blog/BlogEditorEnhanced"), {
  ssr: false,
});

export default function Page() {
  return (
    <ProtectedRoute>
      <BlogEditorEnhanced />
    </ProtectedRoute>
  );
}

