import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: "sm" | "md";
  className?: string;
}

/**
 * Geometric EA monogram matching public/favicon.svg.
 */
export function BrandMark({ size = "md", className }: BrandMarkProps) {
  const dimensions = size === "sm" ? "w-7 h-7 rounded-lg" : "w-9 h-9 rounded-xl";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 overflow-hidden border border-outline-variant/40 dark:border-outline-variant/50 shadow-sm",
        dimensions,
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="none"
        className="w-full h-full block"
      >
        <rect width="512" height="512" fill="#20242B" />
        <path
          d="M78 126h173v59H142v47h93v58h-93v57h111v59H78V126Z"
          fill="#FAFAFC"
        />
        <path
          d="m278 406 63-280h65l95 280h-69l-17-59h-67l-13 59h-57Zm83-115h40l-21-75-19 75Z"
          fill="#55BDB1"
          fillRule="evenodd"
        />
      </svg>
    </span>
  );
}
