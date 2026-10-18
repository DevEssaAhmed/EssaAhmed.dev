"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, Layers, Tag, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const navItems: NavItem[] = [
  { name: "Latest", path: "/articles", icon: FileText, tag: "ALL" },
  { name: "Categories", path: "/articles/categories", icon: LayoutGrid, tag: "TOPICS" },
  { name: "Series", path: "/articles/series", icon: Layers, tag: "GUIDES" },
  { name: "Tags", path: "/articles/tags", icon: Tag, tag: "INDEX" },
];

export default function ArticlesSubNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Articles sub-navigation"
      className={cn("flex justify-center mb-12 animate-fade-in", className)}
    >
      <div className="inline-flex items-center gap-1 p-1.5 bg-surface-low/90 backdrop-blur-xl border border-border/80 rounded-full shadow-2xl overflow-x-auto max-w-full scrollbar-none">
        {navItems.map((item) => {
          const isActive =
            item.path === "/articles"
              ? pathname === "/articles" ||
                (pathname.startsWith("/articles/") &&
                  !["/articles/categories", "/articles/series", "/articles/tags"].some((p) =>
                    pathname.startsWith(p)
                  ))
              : pathname === item.path || pathname.startsWith(item.path + "/");

          return (
            <Link
              key={item.name}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
                isActive
                  ? "text-[#07090e] font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-high/60 border border-transparent hover:border-border/60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSubNav"
                  className="absolute inset-0 bg-champagne rounded-full shadow-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="font-sans font-medium">{item.name}</span>
                {item.tag && (
                  <span
                    className={cn(
                      "hidden sm:inline-block font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded transition-colors",
                      isActive
                        ? "bg-[#07090e]/15 text-[#07090e]"
                        : "bg-surface-high text-muted-foreground/90 border border-border/60"
                    )}
                  >
                    {item.tag}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
