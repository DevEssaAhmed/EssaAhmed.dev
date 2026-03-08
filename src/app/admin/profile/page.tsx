"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ProfileManagePage = dynamic(() => import("./ProfileManagePage"), {
  ssr: false,
});

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfileManagePage />
    </ProtectedRoute>
  );
}

