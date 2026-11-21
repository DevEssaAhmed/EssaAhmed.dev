import { useId } from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  sm: "w-7 h-7 rounded-lg",
  md: "w-9 h-9 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
};

/**
 * Geometric EA monogram with Cobalt-to-Emerald apex chevron and signal pill.
 * Coordinates match public/favicon.svg on a 64x64 optical grid.
 */
export function BrandMark({ size = "md", className }: BrandMarkProps) {
  const uid = useId().replace(/:/g, "");
  const tileBgId = `ea-tile-bg-${uid}`;
  const tileGlowId = `ea-tile-glow-${uid}`;
  const accentGradId = `ea-accent-grad-${uid}`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 overflow-hidden border border-white/15 dark:border-white/15 shadow-sm ring-1 ring-black/5 dark:ring-white/5",
        SIZE_CLASSES[size],
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        className="w-full h-full block"
      >
        <defs>
          <linearGradient
            id={tileBgId}
            x1="4"
            y1="2"
            x2="60"
            y2="62"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#161922" />
            <stop offset="100%" stopColor="#0B0D12" />
          </linearGradient>
          <radialGradient
            id={tileGlowId}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(18 14) rotate(45) scale(48)"
          >
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={accentGradId}
            x1="30.5"
            y1="17"
            x2="52"
            y2="47"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill={`url(#${tileBgId})`} />
        <rect width="64" height="64" fill={`url(#${tileGlowId})`} />
        <path
          d="M12 17H27.5V22.2H17.2V29.4H25V34.6H17.2V41.8H27.5V47H12V17Z"
          fill="#F8FAFC"
        />
        <path
          d="M38.6 17H43.9L52 47H46.5L41.25 26.8L36 47H30.5L38.6 17Z"
          fill={`url(#${accentGradId})`}
        />
        <rect x="38.25" y="39.4" width="6" height="4.4" rx="2.2" fill="#F8FAFC" />
      </svg>
    </span>
  );
}
