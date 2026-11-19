"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookHeart,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  buildRecentActivityFeed,
  computeContentHealthReport,
  THREE_PILLARS,
  type ContentHealthWarning,
  type RecentActivityItem,
} from "@/lib/admin-helpers";
import { extractArticleExternalMeta } from "@/data/externalArticlesStore";
import { isPublicTravelHighlight } from "@/data/travelVisibility";

interface OverviewTabProps {
  blogPosts: any[];
  projects: any[];
  travelHighlights: any[];
  diaryEntries: any[];
  categories: any[];
  orphanTagsCount: number;
  orphanCategoriesCount: number;
  onNavigateTab: (tab: string) => void;
  onQuickRefresh: () => Promise<void>;
  isRefreshing?: boolean;
}

function formatSafeDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDomainMeta(domain: RecentActivityItem["domain"] | ContentHealthWarning["domain"]) {
  switch (domain) {
    case "blogs":
      return { label: "Article", icon: FileText, pillClass: "bg-sky-50 text-sky-700 border-sky-200/80" };
    case "projects":
      return { label: "Project", icon: Layers, pillClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80" };
    case "travel":
      return { label: "Travel", icon: Compass, pillClass: "bg-rose-50 text-rose-700 border-rose-200/80" };
    case "diary":
      return { label: "Diary", icon: BookHeart, pillClass: "bg-amber-50 text-amber-700 border-amber-200/80" };
    case "taxonomy":
    default:
      return { label: "Taxonomy", icon: Settings, pillClass: "bg-zinc-100 text-zinc-700 border-zinc-200/80" };
  }
}

function getStatusBadgeClass(tone: RecentActivityItem["statusTone"]) {
  switch (tone) {
    case "published":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    case "featured":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "unlisted":
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    case "draft":
    default:
      return "bg-zinc-100 text-zinc-600 border-zinc-200/80";
  }
}

function HealthScoreRing({ score, strokeClass }: { score: number; strokeClass: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-zinc-100"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${strokeClass} transition-all duration-500`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold font-mono text-zinc-900 leading-none">{score}</span>
        <span className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">pts</span>
      </div>
    </div>
  );
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  blogPosts,
  projects,
  travelHighlights,
  diaryEntries,
  categories,
  orphanTagsCount,
  orphanCategoriesCount,
  onNavigateTab,
  onQuickRefresh,
  isRefreshing = false,
}) => {
  const [auditFilter, setAuditFilter] = useState<"all" | "warning" | "info">("all");
  const [feedDomain, setFeedDomain] = useState<"all" | RecentActivityItem["domain"]>("all");

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories || []) {
      if (c?.id && c?.name) map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  const report = useMemo(
    () =>
      computeContentHealthReport({
        blogPosts,
        projects,
        travelHighlights,
        diaryEntries,
        categoryMap,
        orphanTagsCount,
        orphanCategoriesCount,
        extractExternalMeta: extractArticleExternalMeta,
        isPublicTravel: isPublicTravelHighlight,
      }),
    [
      blogPosts,
      projects,
      travelHighlights,
      diaryEntries,
      categoryMap,
      orphanTagsCount,
      orphanCategoriesCount,
    ]
  );

  const recentFeed = useMemo(
    () =>
      buildRecentActivityFeed({
        blogPosts,
        projects,
        travelHighlights,
        diaryEntries,
        limit: 20,
      }),
    [blogPosts, projects, travelHighlights, diaryEntries]
  );

  const { kpis, warnings, healthScore } = report;

  const warningCount = useMemo(
    () => warnings.filter((w) => w.severity === "warning").length,
    [warnings]
  );
  const infoCount = warnings.length - warningCount;

  const filteredWarnings = useMemo(() => {
    if (auditFilter === "all") return warnings;
    return warnings.filter((w) => w.severity === auditFilter);
  }, [warnings, auditFilter]);

  const filteredFeed = useMemo(() => {
    const list =
      feedDomain === "all"
        ? recentFeed
        : recentFeed.filter((item) => item.domain === feedDomain);
    return list.slice(0, 10);
  }, [recentFeed, feedDomain]);

  const latestDiaryDate = useMemo(() => {
    const sorted = [...(diaryEntries || [])].sort(
      (a, b) => new Date(b.entry_date || 0).getTime() - new Date(a.entry_date || 0).getTime()
    );
    return sorted[0]?.entry_date ? formatSafeDate(sorted[0].entry_date) : "No entries yet";
  }, [diaryEntries]);

  const healthTone =
    healthScore >= 85
      ? {
          label: "Healthy",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          stroke: "text-emerald-500",
        }
      : healthScore >= 60
      ? {
          label: "Needs Review",
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          stroke: "text-amber-500",
        }
      : {
          label: "Action Required",
          badge: "bg-rose-50 text-rose-700 border-rose-200",
          stroke: "text-rose-500",
        };

  const blogLiveRatio =
    kpis.blogs.total > 0 ? Math.round((kpis.blogs.published / kpis.blogs.total) * 100) : 0;
  const travelLiveRatio =
    kpis.travel.total > 0 ? Math.round((kpis.travel.published / kpis.travel.total) * 100) : 0;
  const diaryLiveRatio =
    kpis.diary.total > 0 ? Math.round((kpis.diary.published / kpis.diary.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Operations Strip */}
      <Card className="bg-white border-zinc-200/80 shadow-2xs rounded-2xl overflow-hidden">
        <CardContent className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-4">
            <HealthScoreRing score={healthScore} strokeClass={healthTone.stroke} />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
                  Portfolio Operations Console
                </h2>
                <Badge variant="outline" className={healthTone.badge}>
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {healthTone.label}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500">
                {kpis.blogs.published + kpis.projects.total + kpis.travel.published + kpis.diary.published}{" "}
                live items across 4 collections · Press{" "}
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 border border-zinc-200 rounded text-zinc-600">
                  ⌘K
                </kbd>{" "}
                for quick actions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onQuickRefresh()}
              disabled={isRefreshing}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg h-8 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/admin/blog/new">
              <Button size="sm" variant="outline" className="border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1 text-sky-600" /> Article
              </Button>
            </Link>
            <Link href="/admin/project/new">
              <Button size="sm" variant="outline" className="border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Project
              </Button>
            </Link>
            <Link href="/admin/travel/new">
              <Button size="sm" variant="outline" className="border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1 text-rose-500" /> Travel City
              </Button>
            </Link>
            <Link href="/admin/diary/new">
              <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg h-8 text-xs shadow-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Diary Entry
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Articles KPI */}
        <button
          type="button"
          onClick={() => onNavigateTab("blogs")}
          className="group text-left bg-white border border-zinc-200/80 hover:border-sky-300/80 hover:shadow-md rounded-2xl p-5 transition-all duration-150 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <FileText className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Articles &amp; Blogs
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-zinc-900 tracking-tight">
                {kpis.blogs.total}
              </span>
              <span className="text-xs text-emerald-700 font-medium">
                {kpis.blogs.published} live
              </span>
            </div>
          </div>
          <div className="space-y-1.5 w-full">
            <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${blogLiveRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>
                {kpis.blogs.onsite} on-site · {kpis.blogs.external} external
              </span>
              <span>{kpis.blogs.drafts} draft</span>
            </div>
          </div>
        </button>

        {/* Projects KPI */}
        <button
          type="button"
          onClick={() => onNavigateTab("projects")}
          className="group text-left bg-white border border-zinc-200/80 hover:border-indigo-300/80 hover:shadow-md rounded-2xl p-5 transition-all duration-150 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              3-Pillar Projects
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-zinc-900 tracking-tight">
                {kpis.projects.total}
              </span>
              <span className="text-xs text-amber-600 font-medium">
                {kpis.projects.featured} featured
              </span>
            </div>
          </div>
          <div className="space-y-1 w-full">
            {THREE_PILLARS.map((pillar) => (
              <div key={pillar} className="flex items-center justify-between text-[11px] text-zinc-500">
                <span className="truncate pr-2">{pillar}</span>
                <span className="font-mono font-semibold text-zinc-800">
                  {kpis.projects.byPillar[pillar] || 0}
                </span>
              </div>
            ))}
          </div>
        </button>

        {/* Travel KPI */}
        <button
          type="button"
          onClick={() => onNavigateTab("travel")}
          className="group text-left bg-white border border-zinc-200/80 hover:border-rose-300/80 hover:shadow-md rounded-2xl p-5 transition-all duration-150 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <Compass className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Travel Atlas
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-zinc-900 tracking-tight">
                {kpis.travel.total}
              </span>
              <span className="text-xs text-zinc-500">
                {kpis.travel.countriesCount}{" "}
                {kpis.travel.countriesCount === 1 ? "country" : "countries"}
              </span>
            </div>
          </div>
          <div className="space-y-1.5 w-full">
            <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${travelLiveRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>{kpis.travel.totalSlides} story slides</span>
              <span>{kpis.travel.published} live</span>
            </div>
          </div>
        </button>

        {/* Diary KPI */}
        <button
          type="button"
          onClick={() => onNavigateTab("diary")}
          className="group text-left bg-white border border-zinc-200/80 hover:border-amber-300/80 hover:shadow-md rounded-2xl p-5 transition-all duration-150 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <BookHeart className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Personal Diary
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-zinc-900 tracking-tight">
                {kpis.diary.total}
              </span>
              <span className="text-xs text-emerald-700 font-medium">
                {kpis.diary.published} published
              </span>
            </div>
          </div>
          <div className="space-y-1.5 w-full">
            <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${diaryLiveRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Latest: {latestDiaryDate}</span>
              <span>{kpis.diary.drafts} draft</span>
            </div>
          </div>
        </button>
      </div>

      {/* Main Split: Content Health Audit + Recent Content Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Content Health Audit */}
        <Card className="lg:col-span-2 bg-white border-zinc-200/80 shadow-2xs rounded-2xl flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-zinc-100 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Content Health &amp; Audit
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Automated checks for covers, excerpts, tags &amp; coordinates.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[11px] bg-zinc-50 text-zinc-700 border-zinc-200">
                {warnings.length} {warnings.length === 1 ? "item" : "items"}
              </Badge>
            </div>

            {warnings.length > 0 && (
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg w-fit">
                {(
                  [
                    { id: "all", label: `All (${warnings.length})` },
                    { id: "warning", label: `Warnings (${warningCount})` },
                    { id: "info", label: `Tips (${infoCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAuditFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      auditFilter === tab.id
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[480px] space-y-2.5">
            {filteredWarnings.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-zinc-800">
                  {warnings.length === 0 ? "All checks passing" : "No items in this filter"}
                </p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  {warnings.length === 0
                    ? "Every published item has covers, metadata, and clean taxonomy."
                    : "Switch filter above to view other audit notices."}
                </p>
              </div>
            ) : (
              filteredWarnings.map((w) => {
                const domainMeta = getDomainMeta(w.domain);
                return (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-50 hover:border-zinc-300/80 transition-colors space-y-2"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {w.severity === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-zinc-900">{w.title}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${domainMeta.pillClass}`}>
                            {domainMeta.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{w.description}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {w.editHref ? (
                        <Link href={w.editHref}>
                          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-white">
                            Fix Now <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : w.targetTab ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onNavigateTab(w.targetTab!)}
                          className="h-7 px-2.5 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-white"
                        >
                          Review <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Content Activity */}
        <Card className="lg:col-span-3 bg-white border-zinc-200/80 shadow-2xs rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-zinc-100 space-y-3">
            <div className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Recent Content Activity
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Latest updated or published items across your portfolio.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNavigateTab("settings")}
                className="text-xs text-zinc-600 hover:text-zinc-900 h-8 rounded-lg"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Settings
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg w-fit flex-wrap">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "blogs", label: "Articles" },
                  { id: "projects", label: "Projects" },
                  { id: "travel", label: "Travel" },
                  { id: "diary", label: "Diary" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFeedDomain(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    feedDomain === tab.id
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            {filteredFeed.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-400">
                No recent items in this collection yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredFeed.map((item) => {
                  const meta = getDomainMeta(item.domain);
                  const DomainIcon = meta.icon;
                  return (
                    <div
                      key={item.id}
                      className="group px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/90 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center shrink-0">
                          <DomainIcon className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={item.editHref}
                              className="text-sm font-medium text-zinc-900 hover:text-indigo-600 truncate max-w-[240px] sm:max-w-[340px]"
                            >
                              {item.title}
                            </Link>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${meta.pillClass}`}>
                              {meta.label}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusBadgeClass(item.statusTone)}`}>
                              {item.statusLabel}
                            </Badge>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                            Updated {formatSafeDate(item.dateStr)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.viewHref && (
                          <Link href={item.viewHref} target="_blank" title="Open Live Page">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-lg"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                        <Link href={item.editHref} title="Open in Editor">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-500 hover:text-zinc-900 rounded-lg"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
