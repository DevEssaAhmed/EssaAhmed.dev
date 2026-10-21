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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
    <div className="flex flex-col h-full bg-white text-zinc-800 justify-between">
      <div>
        {/* Workspace Identity Header */}
        <div className="h-14 px-4 border-b border-zinc-200/90 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-display font-bold text-xs text-white shrink-0 shadow-sm">
              EA
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-900 truncate leading-tight">
                Essa&apos;s Notion CMS
              </div>
              <div className="text-[10px] font-mono text-zinc-500 truncate">
                Workspace v2.4
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-zinc-500 hover:text-zinc-900 p-1"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Databases Section */}
        <div className="p-3 space-y-1">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
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
                    ? "bg-zinc-100 text-zinc-900 font-semibold border border-zinc-200/80 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={cn("w-4 h-4 shrink-0", item.accent)} />
                  <span className="truncate">{item.label}</span>
                </div>
                {typeof item.count === "number" && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600 border border-zinc-200">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Full-Page Editor Shortcuts */}
        <div className="p-3 pt-1">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Dedicated Editors
          </div>
          <div className="space-y-1">
            <Link
              href="/admin/blog/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-secondary" />
              <span>+ New Article / Import URL</span>
            </Link>
            <Link
              href="/admin/project/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>+ New Project Case Study</span>
            </Link>
            <Link
              href="/admin/travel/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              <span>+ New Travel City Highlight</span>
            </Link>
            <Link
              href="/admin/diary/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-500" />
              <span>+ New Diary Entry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-zinc-200/90 flex items-center justify-between text-xs">
        <div className="min-w-0 pr-2">
          <div className="text-zinc-900 truncate font-medium">
            {user?.email || "Admin User"}
          </div>
          <div className="text-[11px] text-zinc-500">Authenticated Admin</div>
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
          className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f3f5] text-zinc-900 flex antialiased selection:bg-zinc-200 selection:text-zinc-900 transition-colors duration-200">
      {/* Desktop Sidebar (Fixed 240px) */}
      <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-zinc-200/90 bg-white sticky top-0 h-screen z-30 shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[240px] max-w-[80vw] h-full shadow-2xl z-10 border-r border-zinc-200 bg-white">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sleek Notion Workspace Header */}
        <header className="sticky top-0 z-20 h-14 bg-white/90 backdrop-blur-md border-b border-zinc-200/90 px-4 md:px-8 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-zinc-500 hover:text-zinc-900 p-1 rounded-md hover:bg-zinc-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-zinc-900 truncate tracking-tight">
                  {displayTitle}
                </h1>
                {subtitle && (
                  <span className="hidden sm:inline-block text-xs text-zinc-500 truncate">
                    — {subtitle}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {actions}

            {/* Quick "+ New" Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs h-8 px-3 gap-1.5 shadow-xs rounded-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white border-zinc-200 text-zinc-800 shadow-xl p-1 rounded-lg"
              >
                <DropdownMenuItem
                  asChild
                  className="focus:bg-zinc-50 cursor-pointer rounded-md text-xs py-2 text-zinc-700 hover:text-zinc-900"
                >
                  <Link href="/admin/blog/new" className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">Article / Blog</span>
                      <span className="text-[10px] text-zinc-500">
                        BlockNote or External URL Import
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-zinc-50 cursor-pointer rounded-md text-xs py-2 text-zinc-700 hover:text-zinc-900"
                >
                  <Link href="/admin/project/new" className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">Portfolio Project</span>
                      <span className="text-[10px] text-zinc-500">
                        Assigned to 3 core pillars
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-zinc-50 cursor-pointer rounded-md text-xs py-2 text-zinc-700 hover:text-zinc-900"
                >
                  <Link href="/admin/travel/new" className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-rose-500" />
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">Travel City Highlight</span>
                      <span className="text-[10px] text-zinc-500">
                        Interactive map pin &amp; 9:16 stories
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-zinc-50 cursor-pointer rounded-md text-xs py-2 text-zinc-700 hover:text-zinc-900"
                >
                  <Link href="/admin/diary/new" className="flex items-center gap-2.5">
                    <BookHeart className="w-4 h-4 text-amber-500" />
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">Personal Diary Entry</span>
                      <span className="text-[10px] text-zinc-500">
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
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex h-8 px-2.5 text-xs bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200/90 shadow-2xs"
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
