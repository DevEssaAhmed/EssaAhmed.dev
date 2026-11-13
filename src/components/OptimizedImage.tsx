"use client";

import Image from "next/image";
import { memo } from "react";
import { isOptimizableImageSrc } from "@/lib/image-optimization";

type OptimizedImageProps = {
  src?: any;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
  node?: unknown;
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

export const OptimizedImage = memo(
  ({
    src,
    alt = "",
    className,
    width,
    height,
    priority = false,
    loading,
    sizes,
    node: _node,
    ...rest
  }: OptimizedImageProps) => {
    const resolvedSrc =
      typeof src === "string" && src.trim() ? src : "/placeholder.svg";

    // Only optimize local non-SVG assets and configured remote hosts; skip SVGs and arbitrary URLs
    const isOptimizable = isOptimizableImageSrc(resolvedSrc);

    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        width={toNumber(width, 1200)}
        height={toNumber(height, 800)}
        className={className}
        priority={priority}
        loading={priority ? undefined : loading ?? "lazy"}
        sizes={sizes ?? "100vw"}
        unoptimized={!isOptimizable}
        {...(rest as Record<string, unknown>)}
      />
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
