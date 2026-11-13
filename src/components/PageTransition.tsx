"use client";

import React from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-surface text-on-surface min-h-screen">{children}</div>;
}
