"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
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
  ChevronRight,
  User,
  Wrench,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { revalidatePortfolioCache } from "@/lib/revalidate-client";
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

interface AdminPaletteAction {
  id: string;
  label: string;
  description: string;
  group: "Navigate" | "Create" | "System";
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  run: () => void;
}

const SIDEBAR_STORAGE_KEY = "admin_sidebar_collapsed";

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab = "overview",
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
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdIndex, setCmdIndex] = useState(0);
  const [isSyncingCache, setIsSyncingCache] = useState(false);

  const { user, signOut } = useAuth();
  const pathname = usePathname() || "/admin";
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "1") setCollapsed(true);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleSyncLiveCache = useCallback(async () => {
    setIsSyncingCache(true);
    try {
      const res = await revalidatePortfolioCache();
      if (res.ok) {
        toast.success("Live site cache synced", {
          description: "All public pages, sitemap, and RSS feed are up to date.",
        });
      } else {
        toast.error(res.error || "Could not revalidate site cache");
      }
    } finally {
      setIsSyncingCache(false);
    }
  }, []);

  const navItems = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        fullLabel: "Overview & Health",
        icon: LayoutDashboard,
        count: undefined,
        accent: "text-emerald-600",
        activeBg: "bg-emerald-50 text-emerald-700",
      },
      {
        id: "blogs",
        label: "Articles",
        fullLabel: "Articles & Writing",
        icon: FileText,
        count: blogsCount,
        accent: "text-sky-600",
        activeBg: "bg-sky-50 text-sky-700",
      },
      {
        id: "projects",
        label: "Projects",
        fullLabel: "3-Pillar Projects",
        icon: Layers,
        count: projectsCount,
        accent: "text-indigo-600",
        activeBg: "bg-indigo-50 text-indigo-700",
      },
      {
        id: "travel",
        label: "Travel Atlas",
        fullLabel: "Travel Atlas & Stories",
        icon: Compass,
        count: travelCount,
        accent: "text-rose-500",
        activeBg: "bg-rose-50 text-rose-700",
      },
      {
        id: "diary",
        label: "Diary",
        fullLabel: "Personal Diary",
        icon: BookHeart,
        count: diaryCount,
        accent: "text-amber-500",
        activeBg: "bg-amber-50 text-amber-700",
      },
      {
        id: "settings",
        label: "Settings",
        fullLabel: "Profile & Site Settings",
        icon: Settings,
        count: undefined,
        accent: "text-zinc-600",
        activeBg: "bg-zinc-100 text-zinc-900",
      },
    ],
    [blogsCount, projectsCount, travelCount, diaryCount]
  );

  const handleNavClick = useCallback(
    (tabId: string) => {
      setMobileOpen(false);
      if (onTabChange) {
        onTabChange(tabId);
      } else {
        router.push(`/admin?tab=${tabId}`);
      }
    },
    [onTabChange, router]
  );

  const paletteActions = useMemo<AdminPaletteAction[]>(
    () => [
      ...navItems.map((item) => ({
        id: `tab-${item.id}`,
        label: item.fullLabel,
        description: `Switch to ${item.fullLabel} view`,
        group: "Navigate" as const,
        icon: item.icon,
        accent: item.accent,
        run: () => handleNavClick(item.id),
      })),
      {
        id: "nav-profile",
        label: "Full Profile Editor",
        description: "Edit identity, bio, skills, and About story",
        group: "Navigate",
        icon: User,
        accent: "text-indigo-500",
        run: () => router.push("/admin/profile"),
      },
      {
        id: "nav-maintenance",
        label: "Tag & Category Cleanup",
        description: "Inspect and prune orphaned taxonomy records",
        group: "Navigate",
        icon: Wrench,
        accent: "text-zinc-600",
        run: () => router.push("/admin/maintenance"),
      },
      {
        id: "new-article",
        label: "New Article / Import URL",
        description: "Write an on-site article or import from Medium/Substack",
        group: "Create",
        icon: FileText,
        accent: "text-sky-600",
        run: () => router.push("/admin/blog/new"),
      },
      {
        id: "new-project",
        label: "New Project Case Study",
        description: "Create a case study under one of the 3 core pillars",
        group: "Create",
        icon: Layers,
        accent: "text-indigo-600",
        run: () => router.push("/admin/project/new"),
      },
      {
        id: "new-travel",
        label: "New Travel City Highlight",
        description: "Add map pin, cover photo, and 9:16 story slides",
        group: "Create",
        icon: Compass,
        accent: "text-rose-500",
        run: () => router.push("/admin/travel/new"),
      },
      {
        id: "new-diary",
        label: "New Diary Entry",
        description: "Publish a dated field note or reflection",
        group: "Create",
        icon: BookHeart,
        accent: "text-amber-500",
        run: () => router.push("/admin/diary/new"),
      },
      {
        id: "sys-revalidate",
        label: "Sync Live Site Cache",
        description: "Revalidate public pages, sitemap.xml, and RSS feed immediately",
        group: "System",
        icon: Sparkles,
        accent: "text-emerald-600",
        run: () => void handleSyncLiveCache(),
      },
      {
        id: "sys-view-site",
        label: "Open Public Portfolio",
        description: "View live site in a new tab",
        group: "System",
        icon: ExternalLink,
        accent: "text-zinc-600",
        run: () => window.open("/", "_blank", "noopener,noreferrer"),
      },
    ],
    [navItems, handleNavClick, router, handleSyncLiveCache]
  );

  const filteredActions = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return paletteActions;
    return paletteActions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.group.toLowerCase().includes(q)
    );
  }, [cmdQuery, paletteActions]);

  useEffect(() => {
    setCmdIndex(0);
  }, [cmdQuery, cmdOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
        setMobileOpen(false);
      } else if (
        e.key === "[" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target as HTMLElement | null)?.isContentEditable
      ) {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCollapsed]);

  const activeNavObj = navItems.find((item) => item.id === activeTab);
  const displayTitle = title || activeNavObj?.fullLabel || "Portfolio CMS";
  const userInitials = (user?.email || "EA").slice(0, 2).toUpperCase();

  const renderSidebar = (isMobile = false) => {
    const isCompact = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full bg-white text-zinc-800 justify-between select-none">
        <div className="flex flex-col min-h-0 overflow-y-auto">
          {/* Workspace Brand Header */}
          <div
            className={cn(
              "h-14 border-b border-zinc-200/80 flex items-center shrink-0",
              isCompact ? "justify-center px-2" : "justify-between px-4"
            )}
          >
            <Link
              href="/admin"
              className="flex items-center gap-2.5 min-w-0 group"
              title="Portfolio CMS Home"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 border border-zinc-800 flex items-center justify-center font-display font-bold text-xs text-white shrink-0 shadow-xs group-hover:scale-[1.03] transition-transform">
                EA
              </div>
              {!isCompact && (
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900 truncate leading-tight tracking-tight">
                    Portfolio Studio
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 truncate flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    essaahmed.dev
                  </div>
                </div>
              )}
            </Link>
            {isMobile ? (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 p-1.5 rounded-lg hover:bg-zinc-100"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            ) : !isCompact ? (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="text-zinc-400 hover:text-zinc-800 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                title="Collapse sidebar ([)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Quick Command Trigger */}
          <div className={cn("pt-3", isCompact ? "px-2" : "px-3")}>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setCmdOpen(true);
              }}
              title="Quick Jump & Actions (⌘K)"
              className={cn(
                "w-full flex items-center rounded-lg border border-zinc-200/90 bg-zinc-50/80 hover:bg-zinc-100/80 text-zinc-500 hover:text-zinc-800 transition-colors",
                isCompact
                  ? "justify-center h-9 px-0"
                  : "justify-between px-2.5 py-2 text-xs"
              )}
            >
              <span className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 shrink-0" />
                {!isCompact && <span className="truncate">Quick jump...</span>}
              </span>
              {!isCompact && (
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-500">
                  ⌘K
                </kbd>
              )}
            </button>
          </div>

          {/* Primary Collections */}
          <div className={cn("py-3 space-y-1", isCompact ? "px-2" : "px-3")}>
            {!isCompact && (
              <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Workspace
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === "/admin" && activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={isCompact ? item.fullLabel : undefined}
                  className={cn(
                    "relative w-full flex items-center rounded-lg text-[13px] transition-all duration-150",
                    isCompact
                      ? "justify-center h-9 px-0"
                      : "justify-between px-2.5 py-2",
                    isActive
                      ? "bg-zinc-900 text-white font-medium shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-white" : item.accent
                      )}
                    />
                    {!isCompact && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCompact && typeof item.count === "number" && (
                    <span
                      className={cn(
                        "ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium",
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Create Links */}
          {!isCompact && (
            <div className="px-3 pb-3">
              <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Quick Create
              </div>
              <div className="space-y-0.5">
                {[
                  { href: "/admin/blog/new", label: "New Article", color: "text-sky-600" },
                  { href: "/admin/project/new", label: "New Case Study", color: "text-indigo-600" },
                  { href: "/admin/travel/new", label: "New Travel Pin", color: "text-rose-500" },
                  { href: "/admin/diary/new", label: "New Diary Note", color: "text-amber-500" },
                ].map((shortcut) => (
                  <Link
                    key={shortcut.href}
                    href={shortcut.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors"
                  >
                    <Plus className={cn("w-3.5 h-3.5 shrink-0", shortcut.color)} />
                    <span className="truncate">{shortcut.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Consoles */}
          <div className={cn("pb-3", isCompact ? "px-2 border-t border-zinc-100 pt-3" : "px-3")}>
            {!isCompact && (
              <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Consoles
              </div>
            )}
            <div className="space-y-0.5">
              <Link
                href="/admin/profile"
                onClick={() => setMobileOpen(false)}
                title={isCompact ? "Full Profile Editor" : undefined}
                className={cn(
                  "flex items-center rounded-lg text-xs transition-colors",
                  isCompact ? "justify-center h-9 px-0" : "gap-2.5 px-2.5 py-2",
                  pathname === "/admin/profile"
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80"
                )}
              >
                <User className="w-4 h-4 text-indigo-500 shrink-0" />
                {!isCompact && <span className="truncate">Full Profile Editor</span>}
              </Link>
              <Link
                href="/admin/maintenance"
                onClick={() => setMobileOpen(false)}
                title={isCompact ? "Tag & Category Cleanup" : undefined}
                className={cn(
                  "flex items-center rounded-lg text-xs transition-colors",
                  isCompact ? "justify-center h-9 px-0" : "gap-2.5 px-2.5 py-2",
                  pathname === "/admin/maintenance"
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80"
                )}
              >
                <Wrench className="w-4 h-4 text-zinc-500 shrink-0" />
                {!isCompact && <span className="truncate">Taxonomy Cleanup</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div
          className={cn(
            "p-3 border-t border-zinc-200/80 flex items-center text-xs shrink-0 bg-zinc-50/50",
            isCompact ? "flex-col gap-2" : "justify-between"
          )}
        >
          {isCompact ? (
            <>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
                title="Expand sidebar ([)"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
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
                className="h-8 w-8 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-zinc-900 truncate font-medium text-xs leading-tight">
                    {user?.email || "Admin User"}
                  </div>
                  <div className="text-[10px] text-zinc-500">Administrator</div>
                </div>
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
                className="h-8 w-8 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-zinc-900 flex antialiased selection:bg-zinc-900/10 selection:text-zinc-900">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-zinc-200/80 bg-white sticky top-0 h-screen z-30 transition-[width] duration-200 ease-out",
          collapsed ? "w-[68px]" : "w-[252px]"
        )}
      >
        {renderSidebar(false)}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[264px] max-w-[84vw] h-full shadow-2xl z-10 border-r border-zinc-200 bg-white">
            {renderSidebar(true)}
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Operations Header */}
        <header className="sticky top-0 z-20 h-14 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 px-4 md:px-7 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-zinc-600 hover:text-zinc-900 p-1.5 rounded-lg hover:bg-zinc-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-xs font-mono text-zinc-400">
                Studio
              </span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-zinc-300 shrink-0" />
              <h1 className="text-sm font-semibold text-zinc-900 truncate tracking-tight">
                {displayTitle}
              </h1>
              {subtitle && (
                <span className="hidden xl:inline-block text-xs text-zinc-400 truncate pl-1">
                  · {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {actions}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleSyncLiveCache()}
              disabled={isSyncingCache}
              title="Revalidate public site cache immediately"
              className="hidden lg:inline-flex h-8 px-2.5 text-xs bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border-zinc-200/90 shadow-2xs gap-1.5"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5 text-emerald-600", isSyncingCache && "animate-spin")}
              />
              <span>{isSyncingCache ? "Syncing..." : "Sync Live"}</span>
            </Button>

            {/* Quick "+ New" Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-zinc-900 text-white hover:bg-zinc-800 font-medium text-xs h-8 px-3 gap-1.5 shadow-xs rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 bg-white border-zinc-200 text-zinc-800 shadow-xl p-1.5 rounded-xl"
              >
                <DropdownMenuItem
                  asChild
                  className="focus:bg-zinc-50 cursor-pointer rounded-lg text-xs py-2.5 px-2.5 text-zinc-700 hover:text-zinc-900"
                >
                  <Link href="/admin/blog/new" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">Article / Blog</span>
                      <span className="text-[10px] text-zinc-500">
                        Rich editor or External URL Import
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-zinc-50 cursor-pointer rounded-lg text-xs py-2.5 px-2.5 text-zinc-700 hover:text-zinc-900"
                >
                  <Link href="/admin/project/new" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
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
                  className="focus:bg-zinc-50 cursor-pointer rounded-lg text-xs py-2.5 px-2.5 text-zinc-700 hover:text-zinc-900"
                >
                  <Link href="/admin/travel/new" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                      <Compass className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">Travel City Highlight</span>
                      <span className="text-[10px] text-zinc-500">
                        Map pin, essays &amp; 9:16 stories
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="focus:bg-zinc-50 cursor-pointer rounded-lg text-xs py-2.5 px-2.5 text-zinc-700 hover:text-zinc-900"
                >
                  <Link href="/admin/diary/new" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <BookHeart className="w-3.5 h-3.5 text-amber-500" />
                    </div>
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

            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex h-8 px-2.5 text-xs bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border-zinc-200/90 shadow-2xs rounded-lg"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <span>View Site</span>
                <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main
          className={cn(
            "flex-1 p-4 sm:p-6 md:p-7 min-h-[calc(100vh-3.5rem)]",
            fullWidthContent ? "max-w-[1440px] mx-auto w-full" : "max-w-6xl mx-auto w-full"
          )}
        >
          {children}
        </main>
      </div>

      {/* Admin Quick Command Palette (Cmd+K) */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-[100] bg-zinc-950/45 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin command palette"
            className="w-full max-w-lg rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCmdIndex((prev) =>
                      filteredActions.length > 0 ? (prev + 1) % filteredActions.length : 0
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCmdIndex((prev) =>
                      filteredActions.length > 0
                        ? (prev - 1 + filteredActions.length) % filteredActions.length
                        : 0
                    );
                  } else if (e.key === "Enter") {
                    const selected = filteredActions[cmdIndex];
                    if (selected) {
                      e.preventDefault();
                      setCmdOpen(false);
                      setCmdQuery("");
                      selected.run();
                    }
                  }
                }}
                placeholder="Jump to workspace tab, create content, or sync cache..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-100 rounded border border-zinc-200">
                ESC
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
              {filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = idx === cmdIndex;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onMouseEnter={() => setCmdIndex(idx)}
                    onClick={() => {
                      setCmdOpen(false);
                      setCmdQuery("");
                      action.run();
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                      isSelected ? "bg-zinc-100 text-zinc-900" : "hover:bg-zinc-50 text-zinc-700"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-center shrink-0">
                        <Icon className={cn("w-4 h-4", action.accent)} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-900 truncate">
                            {action.label}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">
                            {action.group}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {action.description}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform",
                        isSelected ? "text-zinc-900 translate-x-0.5" : "text-zinc-300"
                      )}
                    />
                  </button>
                );
              })}
              {filteredActions.length === 0 && (
                <div className="py-8 text-center text-sm text-zinc-400">
                  No matching commands found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
