"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HashLink } from "@/lib/hash-link-compat";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  User,
  Home,
  FolderOpen,
  BookOpen,
  UserCircle,
  Search,
  Command,
  ArrowRight,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useContentAvailability } from "@/contexts/ContentAvailabilityContext";

const NavIcon = memo(({ name }: { name: string }) => {
  switch (name) {
    case "Home":
      return <Home className="w-4 h-4" />;
    case "FolderOpen":
      return <FolderOpen className="w-4 h-4" />;
    case "BookOpen":
      return <BookOpen className="w-4 h-4" />;
    case "UserCircle":
      return <UserCircle className="w-4 h-4" />;
    default:
      return null;
  }
});
NavIcon.displayName = "NavIcon";

const ABOUT_SUBNAV = [
  { name: "Overview", href: "/about#overview" },
  { name: "Diary", href: "/diary" },
  { name: "Talks & Sessions", href: "/talks" },
  { name: "Travel Highlights", href: "/travel" },
] as const;

const Navigation = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuWasOpen = useRef(false);
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { profile } = useProfile();
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { hasProjects, hasArticles, hasTravel } = useContentAvailability();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = useMemo(() => {
    const items: Array<{ name: string; path: string; icon: string }> = [
      { name: "Home", path: "/", icon: "Home" },
    ];
    if (hasProjects) {
      items.push({ name: "Projects", path: "/projects", icon: "FolderOpen" });
    }
    if (hasArticles) {
      items.push({ name: "Articles", path: "/articles", icon: "BookOpen" });
    }
    return items;
  }, [hasProjects, hasArticles]);

  const aboutSubnav = useMemo(
    () => ABOUT_SUBNAV.filter((item) => item.href !== "/travel" || hasTravel),
    [hasTravel]
  );

  const cmdActions = useMemo(() => {
    const list: Array<{ label: string; sub: string; path: string; action?: () => void }> = [
      { label: "Home Overview", sub: "3 Core Pillars, Capabilities & Overview", path: "/" },
    ];
    if (hasProjects) {
      list.push({
        label: "Projects & Case Studies",
        sub: "Automation, Supply Chain S&OP & Analytics",
        path: "/projects",
      });
    }
    if (hasArticles) {
      list.push({
        label: "Articles & External Writing",
        sub: "On-site deep dives, Medium, dev.to & Substack",
        path: "/articles",
      });
    }
    list.push({
      label: "Diary & Field Notes",
      sub: "Personal notes, experiments, and learning",
      path: "/diary",
    });
    list.push({
      label: "About & Experience",
      sub: "Career timeline, credentials & toolkit",
      path: "/about",
    });
    if (hasTravel) {
      list.push({
        label: "Travel Highlights",
        sub: "Field dispatches, interactive maps & photo reels",
        path: "/travel",
      });
    }
    list.push({
      label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      sub: "Toggle portfolio appearance between Stitch Light & Dark themes",
      path: "#theme",
      action: () => toggleTheme(),
    });
    if (isAdmin) {
      list.push({
        label: "Notion Admin CMS Hub",
        sub: "Manage Articles, Projects, Travel & Diary",
        path: "/admin",
      });
    }
    return list;
  }, [hasProjects, hasArticles, hasTravel, theme, toggleTheme, isAdmin]);

  const filteredCmdActions = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return cmdActions;
    return cmdActions.filter(
      (a) => a.label.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q)
    );
  }, [cmdQuery, cmdActions]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      mobileMenuWasOpen.current = true;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const focusFrame = window.requestAnimationFrame(() => {
        mobileMenuRef.current
          ?.querySelector<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
          )
          ?.focus();
      });

      const trapTab = (event: KeyboardEvent) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          mobileMenuRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
          ) || []
        ).filter((element) => element.getClientRects().length > 0);
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", trapTab);

      return () => {
        window.cancelAnimationFrame(focusFrame);
        document.removeEventListener("keydown", trapTab);
        document.body.style.overflow = previousOverflow;
      };
    } else {
      if (mobileMenuWasOpen.current) {
        mobileMenuWasOpen.current = false;
        mobileMenuTriggerRef.current?.focus();
      }
    }
  }, [isOpen]);

  const isActivePath = useCallback(
    (path: string) => {
      if (path === "/") return pathname === "/";
      if (path === "/articles") {
        return pathname.startsWith("/articles") || pathname.startsWith("/blog");
      }
      return pathname.startsWith(path);
    },
    [pathname]
  );

  const commandPaletteModal =
    isMounted && cmdOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={() => setCmdOpen(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl overflow-hidden text-on-surface"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/30">
                <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder="Jump to page, pillar, or toggle theme..."
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
                />
                <kbd className="px-2 py-0.5 text-[10px] font-mono text-on-surface-variant bg-surface-container rounded border border-outline-variant/30">
                  ESC
                </kbd>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredCmdActions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setCmdOpen(false);
                      setCmdQuery("");
                      if (item.action) {
                        item.action();
                      } else {
                        router.push(item.path);
                      }
                    }}
                    className="w-full min-h-11 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left hover:bg-surface-container transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                        {item.label}
                      </div>
                      <div className="text-xs text-on-surface-variant">{item.sub}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-outline group-hover:text-on-surface group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
                {filteredCmdActions.length === 0 && (
                  <div className="py-8 text-center text-sm text-on-surface-variant">
                    No matching destinations found.
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const mobileMenu =
    isMounted
      ? createPortal(
          <AnimatePresence>
            {isOpen ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden"
                  onClick={() => setIsOpen(false)}
                />
                <motion.div
                  id="mobile-menu"
                  ref={mobileMenuRef}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                  className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface border-l border-outline-variant/30 z-[999] md:hidden shadow-2xl overflow-hidden"
                  role="dialog"
                  aria-label="Mobile navigation menu"
                  aria-modal="true"
                >
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between p-5 border-b border-outline-variant/30 bg-surface-container-low shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center font-display font-bold text-xs text-on-surface">
                          EA
                        </div>
                        <div>
                          <div className="font-display font-semibold text-on-surface text-sm">
                            {profile?.name || "Essa Ahmed"}
                          </div>
                          <div className="text-[11px] font-mono text-on-surface-variant">
                            Automation · S&OP · Analytics
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="h-11 w-11 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                        aria-label="Close navigation menu"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
                      <div className="text-[10px] font-mono font-semibold text-outline uppercase tracking-widest px-3 py-2">
                        Navigation
                      </div>
                      {navItems.map((item) => {
                        const isActive = isActivePath(item.path);
                        return (
                          <Link
                            key={item.name}
                            onClick={() => setIsOpen(false)}
                            href={item.path}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                              isActive
                                ? "bg-surface-container-high border-outline-variant/40 text-on-surface font-semibold"
                                : "border-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                            }`}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                isActive
                                  ? "bg-on-surface text-surface shadow-sm"
                                  : "bg-surface-container border border-outline-variant/30 text-on-surface-variant"
                              }`}
                            >
                              <NavIcon name={item.icon} />
                            </div>
                            <span className="text-sm tracking-wide flex items-center gap-2">
                              {item.name}
                            </span>
                          </Link>
                        );
                      })}
                      <details className="rounded-xl">
                        <summary
                          className={`w-full list-none cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                            pathname.startsWith("/about") || pathname.startsWith("/diary")
                              ? "bg-surface-container-high border-outline-variant/40 text-on-surface font-semibold"
                              : "border-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container border border-outline-variant/30 text-on-surface-variant">
                            <NavIcon name="UserCircle" />
                          </span>
                          <span className="text-sm tracking-wide flex-1 text-left">About</span>
                          <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        </summary>
                        <div className="ml-8 mt-1 mb-2 border-l border-outline-variant/40 pl-4 flex flex-col gap-1">
                          {aboutSubnav.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="rounded-lg px-3 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                              aria-current={
                                item.href === "/diary" && pathname.startsWith("/diary")
                                  ? "page"
                                  : undefined
                              }
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </details>
                    </div>

                    <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low space-y-2 shrink-0">
                      <HashLink
                        smooth
                        to="/#contact"
                        className="block"
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          size="default"
                          className="w-full bg-on-surface hover:opacity-90 text-surface rounded-xl font-semibold transition-all"
                        >
                          Contact Me
                        </Button>
                      </HashLink>
                      {isAdmin && (
                        <Button
                          asChild
                          size="default"
                          variant="outline"
                          className="w-full rounded-xl font-medium border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface transition-all"
                        >
                          <Link href="/admin" onClick={() => setIsOpen(false)}>
                            Admin CMS Hub
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <header
        className="sticky top-6 z-50 px-4 md:px-6 w-full max-w-[1080px] mx-auto"
        aria-label="Main Navigation"
      >
        <div className="flex justify-between items-center h-16 px-4 sm:px-5 w-full bg-surface-container-low/85 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-xl transition-colors duration-200">
          {/* Left: Dedicated 40x40 Logo & Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 min-w-[150px] group shrink-0"
            aria-label="Navigate to home page"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/40 group-hover:border-primary/50 flex items-center justify-center font-display font-bold text-on-surface tracking-wider text-xs shadow-inner transition-colors">
              EA
            </div>
            <span className="text-headline-sm font-display font-bold text-on-surface tracking-tight whitespace-nowrap">
              {profile?.name || "Essa Ahmed"}
            </span>
          </Link>

          {/* Center: Spaced Navigation Links (Filtered by Published Content Availability) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-label-md font-label-md">
            {navItems.map((item) => {
              const active = isActivePath(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="relative min-h-11 px-3.5 py-1.5 rounded-full transition-colors duration-150 flex items-center gap-1.5 text-on-surface"
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-surface-container-high/90 border border-outline-variant/30 rounded-full -z-10 shadow-xs"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={
                      active
                        ? "text-on-surface font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
            <details className="group relative">
              <summary
                className={`min-h-11 list-none cursor-pointer px-3.5 py-1.5 rounded-full transition-colors duration-150 flex items-center gap-1.5 ${
                  pathname.startsWith("/about") || pathname.startsWith("/diary")
                    ? "text-on-surface font-semibold bg-surface-container-high/90 border border-outline-variant/30"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span>About</span>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </summary>
              <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-outline-variant/40 bg-surface-container-low p-1.5 shadow-xl">
                {aboutSubnav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(event) => {
                      const disclosure = event.currentTarget.closest("details");
                      if (disclosure) disclosure.open = false;
                    }}
                    className="block rounded-lg px-3 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                    aria-current={
                      item.href === "/diary" && pathname.startsWith("/diary")
                        ? "page"
                        : undefined
                    }
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </details>
          </nav>

          {/* Right: Search Command Badge, Theme Toggle, Contact CTA, and Authenticated-Only Admin Icon */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-label-sm font-code transition-colors"
              aria-label="Open command palette (Cmd+K)"
            >
              <Search className="w-4 h-4 text-on-surface-variant" />
              <span>⌘K</span>
            </button>

            <motion.button
              type="button"
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="w-11 h-11 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors overflow-hidden"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-on-surface" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <HashLink smooth to="/#contact">
              <span className="bg-on-surface text-surface font-display text-label-md font-semibold px-4 py-2 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-150 inline-flex items-center whitespace-nowrap">
                Contact Me
              </span>
            </HashLink>

            {isAdmin && (
              <Link
                href="/admin"
                className="w-11 h-11 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors"
                aria-label="Go to Admin CMS Hub"
                title="Admin CMS Hub (Signed In)"
              >
                <User className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="h-11 w-11 inline-flex items-center justify-center rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface overflow-hidden"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-on-surface" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="h-11 w-11 inline-flex items-center justify-center rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <Button
              variant="ghost"
              size="icon"
              ref={mobileMenuTriggerRef}
              onClick={() => setIsOpen(!isOpen)}
              className="h-11 w-11 rounded-xl text-on-surface hover:bg-surface-container"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls={isOpen ? "mobile-menu" : undefined}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileMenu}
        {commandPaletteModal}
      </header>
    </>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;
