import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
  separator?: React.ReactNode;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className,
  separator,
}) => {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: "Home", href: "/", icon: Home }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center overflow-x-auto py-2", className)}
    >
      <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-mono">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Icon = item.icon;

          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-1.5 sm:gap-2"
            >
              {index > 0 && (
                <span
                  role="presentation"
                  aria-hidden="true"
                  className="text-muted-foreground/40 shrink-0 select-none"
                >
                  {separator || <ChevronRight className="w-3.5 h-3.5" />}
                </span>
              )}

              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium transition-colors",
                    isLast
                      ? "text-platinum font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate max-w-[200px] sm:max-w-[320px]">
                    {item.label}
                  </span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-champagne transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded px-1 py-0.5 -mx-1 -my-0.5"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate max-w-[160px] sm:max-w-[240px]">
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
