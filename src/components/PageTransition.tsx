"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <div key={pathname} className="w-full animate-page-enter">
        {children}
      </div>
    </div>
  );
}
