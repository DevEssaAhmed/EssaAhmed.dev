"use client";

import React, { useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
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
      return { label: "Article", icon: FileText, pillClass: "bg-sky-50 text-sky-700 border-sky-200" };
    case "projects":
      return { label: "Project", icon: Layers, pillClass: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case "travel":
      return { label: "Travel", icon: Compass, pillClass: "bg-rose-50 text-rose-700 border-rose-200" };
    case "diary":
      return { label: "Diary", icon: BookHeart, pillClass: "bg-amber-50 text-amber-700 border-amber-200" };
    case "taxonomy":
    default:
      return { label: "Taxonomy", icon: Settings, pillClass: "bg-zinc-100 text-zinc-700 border-zinc-200" };
  }
}

function getStatusBadgeClass(tone: RecentActivityItem["statusTone"]) {
  switch (tone) {
    case "published":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "featured":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "unlisted":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "draft":
    default:
      return "bg-zinc-100 text-zinc-600 border-zinc-200";
  }
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
        limit: 10,
      }),
    [blogPosts, projects, travelHighlights, diaryEntries]
  );

  const { kpis, warnings, healthScore } = report;

  const healthTone =
    healthScore >= 85
      ? { label: "Excellent", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" }
      : healthScore >= 60
      ? { label: "Needs Review", badge: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500" }
      : { label: "Attention Needed", badge: "bg-rose-50 text-rose-700 border-rose-200", bar: "bg-rose-500" };

  return (
    <div className="space-y-6">
      {/* Header Banner + Quick Create Strip */}
      <Card className="bg-white border-zinc-200/90 shadow-2xs">
        <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-zinc-900">Portfolio Operations & Content Health</h2>
              <Badge variant="outline" className={healthTone.badge}>
                Health {healthScore}% · {healthTone.label}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              Live overview across Articles, 3-Pillar Projects, Travel Atlas, Personal Diary, and taxonomy hygiene.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onQuickRefresh()}
              disabled={isRefreshing}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            <Link href="/admin/blog/new">
              <Button size="sm" variant="outline" className="border-zinc-200 text-zinc-800 hover:bg-zinc-50">
                <Plus className="w-3.5 h-3.5 mr-1 text-sky-600" /> Article
              </Button>
            </Link>
            <Link href="/admin/project/new">
              <Button size="sm" variant="outline" className="border-zinc-200 text-zinc-800 hover:bg-zinc-50">
                <Plus className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Project
              </Button>
            </Link>
            <Link href="/admin/travel/new">
              <Button size="sm" variant="outline" className="border-zinc-200 text-zinc-800 hover:bg-zinc-50">
                <Plus className="w-3.5 h-3.5 mr-1 text-rose-600" /> Travel City
              </Button>
            </Link>
            <Link href="/admin/diary/new">
              <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
                <Plus className="w-3.5 h-3.5 mr-1" /> Diary Entry
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => onNavigateTab("blogs")}
          className="bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-colors cursor-pointer"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Articles & Blogs
            </CardTitle>
            <FileText className="w-4 h-4 text-sky-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-zinc-900">{kpis.blogs.total}</div>
            <div className="flex flex-wrap gap-1.5 text-xs text-zinc-600">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                {kpis.blogs.published} Live
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                {kpis.blogs.drafts} Draft
              </span>
              {kpis.blogs.unlisted > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                  {kpis.blogs.unlisted} Unlisted
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400">
              {kpis.blogs.onsite} On-Site · {kpis.blogs.external} External
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => onNavigateTab("projects")}
          className="bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-colors cursor-pointer"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              3-Pillar Projects
            </CardTitle>
            <Layers className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">{kpis.projects.total}</span>
              <span className="text-xs text-amber-600 font-medium">
                {kpis.projects.featured} Featured
              </span>
            </div>
            <div className="space-y-1">
              {THREE_PILLARS.map((pillar) => (
                <div key={pillar} className="flex items-center justify-between text-[11px] text-zinc-600">
                  <span className="truncate pr-2">{pillar}</span>
                  <span className="font-mono font-medium text-zinc-800">{kpis.projects.byPillar[pillar] || 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => onNavigateTab("travel")}
          className="bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-colors cursor-pointer"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Travel Atlas
            </CardTitle>
            <Compass className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">{kpis.travel.total}</span>
              <span className="text-xs text-zinc-500">{kpis.travel.countriesCount} countries</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                {kpis.travel.published} Published
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                {kpis.travel.drafts} Draft
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              {kpis.travel.totalSlides} 9:16 story slides configured
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => onNavigateTab("diary")}
          className="bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-colors cursor-pointer"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Personal Diary
            </CardTitle>
            <BookHeart className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-zinc-900">{kpis.diary.total}</div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                {kpis.diary.published} Live
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                {kpis.diary.drafts} Draft
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              {kpis.projects.totalViews.toLocaleString()} project views · {kpis.projects.totalLikes.toLocaleString()} likes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Split: Health Audit + Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Content Health Audit */}
        <Card className="lg:col-span-2 bg-white border-zinc-200/90 shadow-2xs flex flex-col">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Content Health & Audit
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Automated readiness checks across SEO, covers, tags, and travel pins.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs bg-zinc-50 text-zinc-700 border-zinc-200">
                {warnings.length} {warnings.length === 1 ? "issue" : "issues"}
              </Badge>
            </div>
            <div className="pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Readiness Score</span>
                <span className="font-mono font-semibold text-zinc-900">{healthScore}/100</span>
              </div>
              <Progress value={healthScore} className="h-2 bg-zinc-100" />
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[460px] space-y-2.5">
            {warnings.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-medium text-zinc-800">All checks passing</p>
                <p className="text-xs text-zinc-500">
                  All published entries have covers, metadata, and synced taxonomy.
                </p>
              </div>
            ) : (
              warnings.map((w) => {
                const domainMeta = getDomainMeta(w.domain);
                return (
                  <div
                    key={w.id}
                    className="p-3 rounded-lg border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-50 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        {w.severity === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-zinc-900 truncate">{w.title}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${domainMeta.pillClass}`}>
                              {domainMeta.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{w.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {w.editHref ? (
                        <Link href={w.editHref}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-zinc-700 hover:text-zinc-900">
                            Fix Now <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : w.targetTab ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onNavigateTab(w.targetTab!)}
                          className="h-7 px-2 text-xs text-zinc-700 hover:text-zinc-900"
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

        {/* Recent Activity Table */}
        <Card className="lg:col-span-3 bg-white border-zinc-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Recent Content Activity
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 mt-0.5">
                Latest updated or published items across every CMS collection.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigateTab("settings")}
              className="text-xs text-zinc-600 hover:text-zinc-900"
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Site Settings
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentFeed.length === 0 ? (
              <div className="p-10 text-center text-sm text-zinc-500">No content items found yet.</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {recentFeed.map((item) => {
                  const meta = getDomainMeta(item.domain);
                  const DomainIcon = meta.icon;
                  return (
                    <div
                      key={item.id}
                      className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-md bg-zinc-50 border border-zinc-200/80 flex items-center justify-center shrink-0">
                          <DomainIcon className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={item.editHref}
                              className="text-sm font-medium text-zinc-900 hover:text-indigo-600 truncate max-w-[260px] sm:max-w-[340px]"
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
                            {formatSafeDate(item.dateStr)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.viewHref && (
                          <Link href={item.viewHref} target="_blank" title="Open Live Page">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                        <Link href={item.editHref} title="Open in Editor">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-600 hover:text-zinc-900">
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
