"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const DiaryEditorEnhanced = dynamic(
  () => import("@/components/admin/diary/DiaryEditorEnhanced"),
  {
    ssr: false,
  }
);

export default function NewDiaryEntryPage() {
  return (
    <ProtectedRoute>
      <DiaryEditorEnhanced />
    </ProtectedRoute>
  );
}
