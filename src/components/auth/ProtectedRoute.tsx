"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname() || "/admin";
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const nextTarget = `${pathname}${search}`;
      const loginUrl =
        nextTarget && nextTarget !== "/admin"
          ? `/admin/login?next=${encodeURIComponent(nextTarget)}`
          : "/admin/login";
      router.replace(loginUrl);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] text-zinc-900 flex items-center justify-center p-4">
        <Card className="bg-white border border-zinc-200/90 rounded-2xl shadow-lg w-full max-w-sm">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-700">
              {loading ? "Verifying admin session..." : "Redirecting to sign in..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
