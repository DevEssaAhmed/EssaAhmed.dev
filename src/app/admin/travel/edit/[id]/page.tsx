"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const TravelHighlightEditor = dynamic(
  () => import("@/components/admin/travel/TravelHighlightEditor"),
  {
    ssr: false,
  }
);

export default function EditTravelHighlightPage() {
  return (
    <ProtectedRoute>
      <TravelHighlightEditor />
    </ProtectedRoute>
  );
}
