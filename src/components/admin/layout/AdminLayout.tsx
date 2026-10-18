"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Layers,
  Compass,
  BookHeart,
  Settings,
  Plus,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  projectsCount?: number;
  blogsCount?: number;
  diaryCount?: number;
  travelCount?: number;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  fullWidthContent?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab = "blogs",
  onTabChange,
  projectsCount = 0,
  blogsCount = 0,
  diaryCount = 0,
  travelCount = 0,
  title,
  subtitle,
  actions,
  fullWidthContent = false,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname() || "/admin";
  const router = useRouter();

  const navItems = [
    {
      id: "blogs",
      label: "All Articles & Blogs",
      icon: FileText,
      count: blogsCount,
      accent: "text-secondary",
    },
    {
      id: "projects",
      label: "All Projects (3 Pillars)",
      icon: Layers,
      count: projectsCount,
      accent: "text-primary",
    },
    {
      id: "travel",
      label: "Travel Atlas & IG Cities",
      icon: Compass,
      count: travelCount,
      accent: "text-rose-400",
    },
    {
      id: "diary",
      label: "Personal Diary Entries",
      icon: BookHeart,
      count: diaryCount,
      accent: "text-amber-400",
    },
    {
      id: "settings",
      label: "Profile & Site Settings",
      icon: Settings,
      count: undefined,
      accent: "text-on-surface-variant",
    },
  ];

  const handleNavClick = (tabId: string) => {
    setMobileOpen(false);
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      router.push(`/admin?tab=${tabId}`);
    }
  };

  const activeNavObj = navItems.find((item) => item.id === activeTab);
  const displayTitle = title || activeNavObj?.label || "Notion CMS Workspace";

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface-container-low text-on-surface justify-between">
      <div>
        {/* Workspace Identity Header */}
        <div className="h-14 px-4 border-b border-outline-variant/25 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-display font-bold text-xs text-on-surface shrink-0">
              EA
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-on-surface truncate leading-tight">
                Essa&apos;s Notion CMS
              </div>
              <div className="text-[10px] font-mono text-outline truncate">
                Workspace v2.4
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-on-surface-variant hover:text-on-surface p-1"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Databases Section */}
        <div className="p-3 space-y-1">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-outline font-semibold">
            Content Databases
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === "/admin" && activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors",
                  isActive
                    ? "bg-surface-container-high text-on-surface font-semibold border border-outline-variant/30"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={cn("w-4 h-4 shrink-0", item.accent)} />
                  <span className="truncate">{item.label}</span>
                </div>
                {typeof item.count === "number" && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-mono text-outline">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Full-Page Editor Shortcuts */}
        <div className="p-3 pt-1">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-outline font-semibold">
            Dedicated Editors
          </div>
          <div className="space-y-1">
            <Link
              href="/admin/blog/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-secondary" />
              <span>+ New Article / Import URL</span>
            </Link>
            <Link
              href="/admin/project/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>+ New Project Case Study</span>
            </Link>
            <Link
              href="/admin/travel/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>+ New Travel City Highlight</span>
            </Link>
            <Link
              href="/admin/diary/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ New Diary Entry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-outline-variant/25 flex items-center justify-between text-xs">
        <div className="min-w-0 pr-2">
          <div className="text-on-surface truncate font-medium">
            {user?.email || "Admin User"}
          </div>
          <div className="text-[11px] text-outline">Authenticated Admin</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            try {
              await signOut();
              router.push("/");
            } catch {
              // ignore
            }
          }}
          className="h-8 w-8 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface flex antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Desktop Sidebar (Fixed 240px) */}
      <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-outline-variant/25 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[240px] max-w-[80vw] h-full shadow-2xl z-10 border-r border-outline-variant/30">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sleek Notion Workspace Header */}
        <header className="sticky top-0 z-20 h-14 bg-surface/85 backdrop-blur-md border-b border-outline-variant/25 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-on-surface truncate tracking-tight">
                  {displayTitle}
                </h1>
                {subtitle && (
                  <span className="hidden sm:inline-block text-xs text-outline truncate">
                    — {subtitle}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {actions}

            <button
              type="button"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-on-surface" />
              )}
            </button>

            {/* Quick "+ New" Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-on-surface text-surface hover:opacity-90 font-medium text-xs h-8 px-3 gap-1.5 shadow-sm rounded-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-surface-container-low border-outline-variant/40 text-on-surface shadow-xl p-1"
              >
                <DropdownMenuItem
                  asChild
                  className="focus:bg-surface-container cursor-pointer rounded-md text-xs py-2"
                >
                  <Link href="/admin/blog/new" className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-secondary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">Article / Blog</span>
                      <span className="text-[10px] text-outline">
                        BlockNote or External URL Import
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-surface-container cursor-pointer rounded-md text-xs py-2"
                >
                  <Link href="/admin/project/new" className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">Portfolio Project</span>
                      <span className="text-[10px] text-outline">
                        Assigned to 3 core pillars
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-surface-container cursor-pointer rounded-md text-xs py-2"
                >
                  <Link href="/admin/travel/new" className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-rose-400" />
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">Travel City Highlight</span>
                      <span className="text-[10px] text-outline">
                        Interactive map pin &amp; 9:16 stories
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-surface-container cursor-pointer rounded-md text-xs py-2"
                >
                  <Link href="/admin/diary/new" className="flex items-center gap-2.5">
                    <BookHeart className="w-4 h-4 text-amber-400" />
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">Personal Diary Entry</span>
                      <span className="text-[10px] text-outline">
                        Dated field notes &amp; reflections
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Public Portfolio External Link */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex h-8 px-2.5 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/30"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <span>View Site</span>
                <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Canvas Body */}
        <main
          className={cn(
            "flex-1 p-4 sm:p-6 md:p-8 min-h-[calc(100vh-3.5rem)]",
            fullWidthContent ? "max-w-none w-full" : "max-w-6xl mx-auto w-full"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
