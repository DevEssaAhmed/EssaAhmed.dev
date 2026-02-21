"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, Layers, Tag, FileText } from "lucide-react";

const navItems = [
    { name: "Latest", path: "/articles", icon: FileText },
    { name: "Categories", path: "/articles/categories", icon: LayoutGrid },
    { name: "Series", path: "/articles/series", icon: Layers },
    { name: "Tags", path: "/articles/tags", icon: Tag },
];

export default function ArticlesSubNav() {
    const pathname = usePathname();

    return (
        <div className="flex justify-center mb-12 animate-fade-in">
            <div className="inline-flex items-center p-1.5 bg-background/60 backdrop-blur-xl border border-border/50 rounded-full shadow-sm overflow-x-auto max-w-full">
                {navItems.map((item) => {
                    const isActive =
                        item.path === '/articles'
                            ? pathname === '/articles' || (pathname.startsWith('/articles/') && !['/articles/categories', '/articles/series', '/articles/tags'].some(p => pathname.startsWith(p)))
                            : pathname === item.path || pathname.startsWith(item.path + '/');

                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeSubNav"
                                    className="absolute inset-0 bg-primary rounded-full shadow-soft"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
