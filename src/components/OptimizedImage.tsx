"use client";

import Image from "next/image";
import { memo } from "react";

type OptimizedImageProps = {
  src?: any;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  sizes?: string;
  [key: string]: unknown;
};

const toNumber = (value: number | string | undefined, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
};

export const OptimizedImage = memo(({
  src,
  alt = "",
  className,
  width,
  height,
  priority = false,
  sizes,
  ...rest
}: OptimizedImageProps) => {
  const resolvedSrc = typeof src === "string" && src.trim() ? src : "/placeholder.svg";

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={toNumber(width, 1200)}
      height={toNumber(height, 800)}
      className={className}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes={sizes ?? "100vw"}
      unoptimized
      {...(rest as Record<string, unknown>)}
    />
  );
});

OptimizedImage.displayName = "OptimizedImage";


