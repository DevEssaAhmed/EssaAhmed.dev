"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  Kanban,
  Layers,
  LayoutList,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  filterAndSortProjects,
  resolveProjectPillar,
  THREE_PILLARS,
  type PillarType,
  type ProjectSortOption,
} from "@/lib/admin-helpers";

interface ProjectsDirectoryTabProps {
  projects: any[];
  categories: any[];
  onToggleFeatured: (project: any) => Promise<void>;
  onChangePillar: (project: any, pillar: PillarType) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

const PILLAR_COLORS: Record<PillarType, string> = {
  "Workflow Automation": "bg-sky-50 text-sky-700 border-sky-200",
  "Supply Chain & Demand Planning": "bg-amber-50 text-amber-700 border-amber-200",
  "Analytics & Decision Systems": "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export const ProjectsDirectoryTab: React.FC<ProjectsDirectoryTabProps> = ({
  projects,
  categories,
  onToggleFeatured,
  onChangePillar,
  onDeleteProject,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<ProjectSortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDeleteProject, setPendingDeleteProject] = useState<any | null>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories || []) {
      if (c?.id && c?.name) map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  const filteredProjects = useMemo(
    () =>
      filterAndSortProjects(projects, {
        pillarFilter,
        featuredOnly,
        searchQuery,
        sortBy,
        categoryMap,
      }),
    [projects, pillarFilter, featuredOnly, searchQuery, sortBy, categoryMap]
  );

  const pillarBuckets = useMemo(() => {
    const map = new Map<PillarType, any[]>();
    for (const p of THREE_PILLARS) map.set(p, []);
    for (const proj of filteredProjects) {
      const pillar = resolveProjectPillar(proj, categoryMap);
      map.get(pillar)?.push(proj);
    }
    return map;
  }, [filteredProjects, categoryMap]);

  const handleToggleFeaturedClick = async (project: any) => {
    setBusyId(project.id);
    try {
      await onToggleFeatured(project);
    } finally {
      setBusyId(null);
    }
  };

  const handlePillarSelect = async (project: any, nextPillar: PillarType) => {
    setBusyId(project.id);
    try {
      await onChangePillar(project, nextPillar);
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyUrl = async (project: any) => {
    const targetUrl = `${window.location.origin}/projects/${project.id}`;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedId(project.id);
      toast.success("Case study URL copied");
      setTimeout(() => setCopiedId((prev) => (prev === project.id ? null : prev)), 1500);
    } catch {
      toast.error("Could not copy URL");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar & Filters */}
      <Card className="bg-white border-zinc-200/90 shadow-2xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === "kanban"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  Kanban (3 Pillars)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setFeaturedOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  featuredOnly
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${featuredOnly ? "fill-amber-500 text-amber-500" : ""}`} />
                Featured Only
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500">
                {filteredProjects.length} / {projects.length} projects
              </span>
              <Link href="/admin/project/new">
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Case Study
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPillarFilter("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                pillarFilter === "all"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              All Pillars
            </button>
            {THREE_PILLARS.map((pillar) => (
              <button
                key={pillar}
                type="button"
                onClick={() => setPillarFilter(pillar)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  pillarFilter === pillar
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {pillar}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, description, or tech tags..."
                className="pl-9 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as ProjectSortOption)}>
              <SelectTrigger className="w-full md:w-[180px] bg-white border-zinc-300 text-zinc-900">
                <SelectValue placeholder="Sort projects" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main View */}
      {viewMode === "table" ? (
        <Card className="bg-white border-zinc-200/90 shadow-2xs overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Layers className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-sm font-medium text-zinc-700">No projects match these filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    <th className="py-3 px-4 font-semibold">Case Study</th>
                    <th className="py-3 px-4 font-semibold">Domain Pillar</th>
                    <th className="py-3 px-4 font-semibold">Featured</th>
                    <th className="py-3 px-4 font-semibold">Engagement</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {filteredProjects.map((project) => {
                    const pillar = resolveProjectPillar(project, categoryMap);
                    const tags: string[] = Array.isArray(project.tags) ? project.tags : [];

                    return (
                      <tr key={project.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3.5 px-4 max-w-[360px]">
                          <div className="flex items-start gap-3">
                            {project.image_url ? (
                              <img
                                src={project.image_url}
                                alt=""
                                className="w-12 h-9 rounded object-cover border border-zinc-200 shrink-0 mt-0.5"
                              />
                            ) : (
                              <div className="w-12 h-9 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                                <Layers className="w-4 h-4 text-zinc-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link
                                href={`/admin/project/edit/${project.id}`}
                                className="font-medium text-zinc-900 hover:text-indigo-600 line-clamp-1"
                              >
                                {project.title}
                              </Link>
                              <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                                {project.description || "No summary provided"}
                              </p>
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {tags.length > 3 && (
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      +{tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Select
                              value={pillar}
                              disabled={busyId === project.id}
                              onValueChange={(val) =>
                                void handlePillarSelect(project, val as PillarType)
                              }
                            >
                              <SelectTrigger
                                className={`h-7 w-[220px] text-xs font-medium border ${PILLAR_COLORS[pillar]}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                                {THREE_PILLARS.map((p) => (
                                  <SelectItem key={p} value={p}>
                                    {p}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {busyId === project.id && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === project.id}
                            onClick={() => void handleToggleFeaturedClick(project)}
                            className={`h-7 px-2.5 text-xs ${
                              project.featured
                                ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                                : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900"
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 mr-1 ${
                                project.featured ? "fill-amber-500 text-amber-500" : ""
                              }`}
                            />
                            {project.featured ? "Featured" : "Standard"}
                          </Button>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-mono text-zinc-500">
                          {Number(project.views || 0).toLocaleString()} views ·{" "}
                          {Number(project.likes || 0).toLocaleString()} likes
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => void handleCopyUrl(project)}
                              title="Copy Case Study URL"
                              className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                            >
                              {copiedId === project.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>

                            <Link
                              href={`/projects/${project.id}`}
                              target="_blank"
                              title="View Live Case Study"
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </Link>

                            <Link href={`/admin/project/edit/${project.id}`} title="Edit Project">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-zinc-600 hover:text-zinc-900"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </Link>

                            <Button
                              size="icon"
                              variant="ghost"
                              title="Delete Project"
                              onClick={() => setPendingDeleteProject(project)}
                              className="h-8 w-8 text-zinc-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        /* Kanban View across 3 Pillars */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {THREE_PILLARS.map((pillar) => {
            const colItems = pillarBuckets.get(pillar) || [];
            return (
              <div
                key={pillar}
                className="rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <Badge variant="outline" className={`font-semibold ${PILLAR_COLORS[pillar]}`}>
                    {pillar}
                  </Badge>
                  <span className="text-xs font-mono text-zinc-500">{colItems.length}</span>
                </div>

                <div className="space-y-3">
                  {colItems.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-lg bg-white/60">
                      No projects in this pillar
                    </div>
                  ) : (
                    colItems.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-colors"
                      >
                        <CardContent className="p-3.5 space-y-2.5">
                          {project.image_url && (
                            <img
                              src={project.image_url}
                              alt=""
                              className="w-full h-28 object-cover rounded-md border border-zinc-100"
                            />
                          )}
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/admin/project/edit/${project.id}`}
                              className="text-sm font-semibold text-zinc-900 hover:text-indigo-600 line-clamp-2"
                            >
                              {project.title}
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleToggleFeaturedClick(project)}
                              title={project.featured ? "Unfeature" : "Mark as Featured"}
                              className="shrink-0 p-1 rounded hover:bg-zinc-100"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  project.featured
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-zinc-300 hover:text-amber-400"
                                }`}
                              />
                            </button>
                          </div>

                          <p className="text-xs text-zinc-500 line-clamp-2">
                            {project.description || "No summary provided"}
                          </p>

                          <div className="pt-1 flex items-center justify-between gap-2 border-t border-zinc-100">
                            <Select
                              value={pillar}
                              disabled={busyId === project.id}
                              onValueChange={(val) =>
                                void handlePillarSelect(project, val as PillarType)
                              }
                            >
                              <SelectTrigger className="h-7 w-[150px] text-[11px] bg-zinc-50 border-zinc-200 text-zinc-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                                {THREE_PILLARS.map((p) => (
                                  <SelectItem key={p} value={p} className="text-xs">
                                    {p}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="flex items-center gap-0.5">
                              <Link href={`/projects/${project.id}`} target="_blank" title="View Live">
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500 hover:text-zinc-900">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                              <Link href={`/admin/project/edit/${project.id}`} title="Edit">
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-600 hover:text-zinc-900">
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Delete"
                                onClick={() => setPendingDeleteProject(project)}
                                className="h-7 w-7 text-zinc-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shared Light-Theme Delete Dialog (replaces legacy dark #18191e Kanban modal) */}
      <AlertDialog
        open={Boolean(pendingDeleteProject)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteProject(null);
        }}
      >
        <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case Study?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              &ldquo;{pendingDeleteProject?.title}&rdquo; will be permanently deleted along with its tag associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDeleteProject) return;
                const targetId = pendingDeleteProject.id;
                setPendingDeleteProject(null);
                await onDeleteProject(targetId);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
