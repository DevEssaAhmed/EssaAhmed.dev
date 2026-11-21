"use client";

import type { HTMLAttributes, PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function SpotlightCard({
  children,
  className,
  onPointerMove,
  ...props
}: SpotlightCardProps) {
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
    onPointerMove?.(e);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={cn("relative overflow-hidden group/spotlight", className)}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-300 spotlight-surface"
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
