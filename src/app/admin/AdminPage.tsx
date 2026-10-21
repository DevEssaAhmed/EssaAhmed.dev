"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useNavigate, useLocation } from "@/lib/router-compat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  TrendingUp,
  Calendar,
  Folder,
  PenTool,
  Settings,
  CalendarRange,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Globe,
  Compass,
  BookHeart,
  Layers,
  Table as TableIcon,
  LayoutGrid,
  Clock,
  ArrowUpRight,
  Tag,
  Check,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  MapPin,
  User,
  Mail,
  Github,
  Linkedin,
  Loader2,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  extractArticleExternalMeta,
  encodeArticleExternalMeta,
  detectPlatformFromUrl,
} from "@/data/externalArticlesStore";
import {
  loadTravelHighlightsLocal,
  saveTravelHighlightsLocal,
  fetchTravelHighlightsFromSupabase,
  deleteTravelHighlightFromSupabase,
  TravelCityHighlight,
  DEFAULT_TRAVEL_HIGHLIGHTS,
} from "@/data/travelData";
import { getMarkdownExcerpt } from "@/lib/markdownUtils";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useProfile } from "@/contexts/ProfileContext";
import HeroStatsManager from "@/components/admin/HeroStatsManager";
import SEOSettings from "@/components/admin/SEOSettings";

// Core 3 Pillars Definition
const THREE_PILLARS = [
  "Workflow Automation",
  "Supply Chain & Demand Planning",
  "Analytics & Decision Systems",
] as const;

type PillarType = (typeof THREE_PILLARS)[number];

function inferProjectPillar(project: any): PillarType {
  const text = `${project.title || ""} ${project.description || ""} ${(project.tags || []).join(" ")}`.toLowerCase();
  if (
    text.includes("supply chain") ||
    text.includes("demand") ||
    text.includes("s&op") ||
    text.includes("inventory") ||
    text.includes("procurement") ||
    text.includes("vendor") ||
    text.includes("logistics")
  ) {
    return "Supply Chain & Demand Planning";
  }
  if (
    text.includes("workflow") ||
    text.includes("automation") ||
    text.includes("pipeline") ||
    text.includes("etl") ||
    text.includes("airflow") ||
    text.includes("webhook") ||
    text.includes("n8n") ||
    text.includes("zapier")
  ) {
    return "Workflow Automation";
  }
  return "Analytics & Decision Systems";
}

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab state: "blogs" | "projects" | "travel" | "diary" | "settings"
  const [activeTab, setActiveTab] = useState<string>("blogs");

  // Databases data
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [travelHighlights, setTravelHighlights] = useState<TravelCityHighlight[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync tab with ?tab= query parameter on mount and when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const tabParam = sp.get("tab");
      if (tabParam && ["blogs", "projects", "travel", "diary", "settings"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Fetch all database records
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Blog Posts
      const { data: blogData, error: blogErr } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (blogErr) console.warn("Error fetching blog posts:", blogErr);
      setBlogPosts(blogData || []);

      // 2. Fetch Projects
      const { data: projData, error: projErr } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (projErr) console.warn("Error fetching projects:", projErr);
      setProjects(projData || []);

      // 3. Fetch Travel Highlights (from Supabase travel_highlights table + local fallback)
      const mergedTravel = await fetchTravelHighlightsFromSupabase();
      setTravelHighlights(mergedTravel);

      // 4. Fetch Diary Entries
      const { data: diaryData, error: diaryErr } = await supabase
        .from("diary_entries")
        .select("*")
        .order("entry_date", { ascending: false });
      if (diaryErr) console.warn("Error fetching diary entries:", diaryErr);
      setDiaryEntries(diaryData || []);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load some admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Deletion Handlers
  const deleteBlogPost = async (id: string, title: string) => {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Deleted article: ${title}`);
    } catch (err: any) {
      console.error("Error deleting blog post:", err);
      toast.error(err.message || "Failed to delete article");
    }
  };

  const deleteProject = async (id: string, title: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Deleted project: ${title}`);
    } catch (err: any) {
      console.error("Error deleting project:", err);
      toast.error(err.message || "Failed to delete project");
    }
  };

  const deleteTravelCity = async (id: string, cityName: string) => {
    try {
      await deleteTravelHighlightFromSupabase(id);
      const updated = travelHighlights.filter((c) => c.id !== id);
      setTravelHighlights(updated);
      saveTravelHighlightsLocal(updated);
      toast.success(`Deleted travel destination: ${cityName}`);
    } catch (err: any) {
      console.error("Error deleting travel destination:", err);
      toast.error("Failed to delete travel destination");
    }
  };

  const deleteDiaryEntry = async (id: string, title: string) => {
    try {
      const { error } = await supabase.from("diary_entries").delete().eq("id", id);
      if (error) throw error;
      setDiaryEntries((prev) => prev.filter((d) => d.id !== id));
      toast.success(`Deleted diary entry: ${title}`);
    } catch (err: any) {
      console.error("Error deleting diary entry:", err);
      toast.error(err.message || "Failed to delete diary entry");
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      blogsCount={blogPosts.length}
      projectsCount={projects.length}
      travelCount={travelHighlights.length}
      diaryCount={diaryEntries.length}
      title={
        activeTab === "blogs"
          ? "All Articles & Blogs"
          : activeTab === "projects"
          ? "All Projects (3 Pillars)"
          : activeTab === "travel"
          ? "Travel Atlas & IG Cities"
          : activeTab === "diary"
          ? "Personal Diary Entries"
          : "Profile & Site Settings"
      }
      subtitle="Database Directory"
      fullWidthContent={true}
    >
      <div className="space-y-6">
        {/* TAB 1: ARTICLES & BLOGS DIRECTORY */}
        {activeTab === "blogs" && (
          <ArticlesDirectoryTab
            blogPosts={blogPosts}
            isLoading={isLoading}
            onDelete={deleteBlogPost}
            onArticleImported={(newPost) => {
              setBlogPosts((prev) => [newPost, ...prev]);
            }}
          />
        )}

        {/* TAB 2: PROJECTS DIRECTORY (TABLE + 3-PILLAR KANBAN) */}
        {activeTab === "projects" && (
          <ProjectsDirectoryTab
            projects={projects}
            isLoading={isLoading}
            onDelete={deleteProject}
          />
        )}

        {/* TAB 3: TRAVEL ATLAS & IG STORIES DIRECTORY */}
        {activeTab === "travel" && (
          <TravelDirectoryTab
            travelHighlights={travelHighlights}
            isLoading={isLoading}
            onDelete={deleteTravelCity}
          />
        )}

        {/* TAB 4: PERSONAL DIARY ENTRIES DIRECTORY */}
        {activeTab === "diary" && (
          <DiaryDirectoryTab
            diaryEntries={diaryEntries}
            isLoading={isLoading}
            onDelete={deleteDiaryEntry}
          />
        )}

        {/* TAB 5: PROFILE & SITE SETTINGS */}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </AdminLayout>
  );
}

/* =========================================================================
   TAB 1: ARTICLES & BLOGS DIRECTORY
   ========================================================================= */
interface ArticlesDirectoryTabProps {
  blogPosts: any[];
  isLoading: boolean;
  onDelete: (id: string, title: string) => Promise<void>;
  onArticleImported: (newPost: any) => void;
}

function ArticlesDirectoryTab({
  blogPosts,
  isLoading,
  onDelete,
  onArticleImported,
}: ArticlesDirectoryTabProps) {
  const navigate = useNavigate();

  // Importer bar state
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Filters & Search
  const [sourceFilter, setSourceFilter] = useState<"all" | "onsite" | "external">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = importUrl.trim();
    if (!url) {
      toast.error("Please enter an article URL");
      return;
    }

    try {
      setIsImporting(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Please sign in as an administrator before importing an article.");
      }

      const res = await fetch("/api/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Import failed with status ${res.status}`);
      }

      const imported = await res.json();

      // Encode meta via externalArticlesStore
      const encoded = encodeArticleExternalMeta({
        isExternal: true,
        externalUrl: imported.external_url || url,
        platform: imported.platform || detectPlatformFromUrl(url),
      });

      // Insert directly into Supabase blog_posts
      const { data: newRow, error: insertError } = await supabase
        .from("blog_posts")
        .insert([
          {
            title: imported.title || "Imported External Article",
            slug: imported.slug || `imported-${Date.now()}`,
            excerpt: imported.excerpt || "",
            content: imported.excerpt || imported.title || "",
            image_url: imported.image_url || null,
            featured_image_url: imported.image_url || null,
            published: true,
            unlisted: false,
            reading_time: imported.reading_time || 5,
            is_external: encoded.is_external,
            external_url: encoded.external_url,
            platform: encoded.platform,
            pillar: null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success(`Imported: "${newRow.title}" from ${imported.platform || "External"}`);
      setImportUrl("");
      if (newRow) {
        onArticleImported(newRow);
      }
    } catch (err: any) {
      console.error("Article import error:", err);
      toast.error(err.message || "Failed to fetch metadata from URL");
    } finally {
      setIsImporting(false);
    }
  };

  // Filtered Articles
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const meta = extractArticleExternalMeta(post);

      // Source filter
      if (sourceFilter === "onsite" && meta.isExternal) return false;
      if (sourceFilter === "external" && !meta.isExternal) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (post.title || "").toLowerCase().includes(q);
        const excerptMatch = (post.excerpt || "").toLowerCase().includes(q);
        const platformMatch = (meta.platform || "").toLowerCase().includes(q);
        if (!titleMatch && !excerptMatch && !platformMatch) return false;
      }

      return true;
    });
  }, [blogPosts, sourceFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1-CLICK EXTERNAL ARTICLE IMPORTER BAR */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                <span>1-Click External Article Importer</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300 py-0 px-1.5 font-normal">
                  Auto-Metadata
                </Badge>
              </h2>
              <p className="text-xs text-zinc-600">
                Paste any article URL from Medium, dev.to, freeCodeCamp, or Substack. We extract title, excerpt, cover image, and canonical links.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleImport} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="url"
              placeholder="https://medium.com/@username/your-article or https://dev.to/..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              className="pl-9 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 h-9 shadow-2xs"
              disabled={isImporting}
            />
          </div>

          <Button
            type="submit"
            disabled={isImporting || !importUrl.trim()}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shrink-0 shadow-xs"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <span>Fetch Metadata &amp; Create</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* FILTER PILLS, SEARCH & NEW BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Pills */}
          <div className="flex items-center bg-zinc-200/80 p-0.5 rounded-lg border border-zinc-300/70 shadow-2xs">
            <button
              type="button"
              onClick={() => setSourceFilter("all")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                sourceFilter === "all"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60"
              )}
            >
              All ({blogPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("onsite")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                sourceFilter === "onsite"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60"
              )}
            >
              Site Articles ({blogPosts.filter((p) => !extractArticleExternalMeta(p).isExternal).length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("external")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                sourceFilter === "external"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60"
              )}
            >
              External ({blogPosts.filter((p) => extractArticleExternalMeta(p).isExternal).length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search title, platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 rounded-lg focus:border-zinc-500 shadow-2xs"
            />
          </div>

          <Button
            asChild
            size="sm"
            className="h-8 px-3 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs gap-1.5 shrink-0 rounded-lg shadow-xs"
          >
            <Link href="/admin/blog/new">
              <Plus className="w-3.5 h-3.5" />
              <span>New Article</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* NOTION DATABASE TABLE OF ALL ARTICLES */}
      <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-zinc-100" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-zinc-900">No articles match your filter</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Create an article on-site or use the 1-Click URL Importer at the top.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90 text-zinc-600 font-semibold">
                  <th className="py-3 px-4 w-[40%]">Article &amp; Excerpt</th>
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {filteredPosts.map((post) => {
                  const meta = extractArticleExternalMeta(post);
                  const isPublished = post.published && !post.unlisted;
                  const isUnlisted = post.published && post.unlisted;

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-zinc-50/90 transition-colors group"
                    >
                      {/* Title & Excerpt */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          {post.image_url ? (
                            <img
                              src={post.image_url}
                              alt=""
                              className="w-10 h-10 rounded-md object-cover border border-zinc-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-500">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-zinc-900 truncate text-xs flex items-center gap-1.5">
                              <span>{post.title}</span>
                              {meta.isExternal && (
                                <ArrowUpRight className="w-3 h-3 text-zinc-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate mt-0.5 line-clamp-1">
                              {post.excerpt || getMarkdownExcerpt(post.content || "", 90)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {meta.isExternal && meta.platform ? (
                          <a
                            href={meta.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                          >
                            <span>{meta.platform}</span>
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        ) : isUnlisted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                            Unlisted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-zinc-600 whitespace-nowrap text-[11px] font-mono">
                        {new Date(post.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-xs bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-2xs"
                          >
                            <Link href={`/admin/blog/edit/${post.id}`}>
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              <span>Edit Page</span>
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-zinc-900 font-semibold">Delete Article</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-600">
                                  Are you sure you want to delete &quot;{post.title}&quot;? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(post.id, post.title)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TAB 2: PROJECTS DIRECTORY (NOTION TABLE + 3-PILLAR KANBAN)
   ========================================================================= */
interface ProjectsDirectoryTabProps {
  projects: any[];
  isLoading: boolean;
  onDelete: (id: string, title: string) => Promise<void>;
}

function ProjectsDirectoryTab({
  projects,
  isLoading,
  onDelete,
}: ProjectsDirectoryTabProps) {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [pillarFilter, setPillarFilter] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const pillar = inferProjectPillar(p);
      if (pillarFilter !== "all" && pillar !== pillarFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (p.title || "").toLowerCase().includes(q);
        const descMatch = (p.description || "").toLowerCase().includes(q);
        const tagMatch = (p.tags || []).some((t: string) => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [projects, pillarFilter, searchQuery]);

  // Group by Pillar for Kanban
  const kanbanColumns = useMemo(() => {
    const groups: Record<PillarType, any[]> = {
      "Workflow Automation": [],
      "Supply Chain & Demand Planning": [],
      "Analytics & Decision Systems": [],
    };
    for (const p of filteredProjects) {
      const pillar = inferProjectPillar(p);
      groups[pillar].push(p);
    }
    return groups;
  }, [filteredProjects]);

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-zinc-200/80 p-0.5 rounded-lg border border-zinc-300/70 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors",
                viewMode === "table"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60"
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Notion Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors",
                viewMode === "kanban"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>3-Pillar Kanban</span>
            </button>
          </div>

          {/* Pillar Selector Filter (Table View) */}
          {viewMode === "table" && (
            <select
              value={pillarFilter}
              onChange={(e) => setPillarFilter(e.target.value)}
              className="h-8 px-2.5 text-xs bg-white border border-zinc-300 text-zinc-800 rounded-lg focus:border-zinc-500 focus:outline-none shadow-2xs"
            >
              <option value="all">All 3 Pillars</option>
              {THREE_PILLARS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 rounded-lg focus:border-zinc-500 shadow-2xs"
            />
          </div>

          <Button
            asChild
            size="sm"
            className="h-8 px-3 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs gap-1.5 shrink-0 rounded-lg shadow-xs"
          >
            <Link href="/admin/project/new">
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* VIEW: NOTION TABLE */}
      {viewMode === "table" && (
        <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-zinc-100" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Folder className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-zinc-900">No projects found</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Add a new project to showcase your engineering achievements.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/90 text-zinc-600 font-semibold">
                    <th className="py-3 px-4 w-[35%]">Project Name</th>
                    <th className="py-3 px-3">Pillar</th>
                    <th className="py-3 px-3">Key Technologies</th>
                    <th className="py-3 px-3">Metrics</th>
                    <th className="py-3 px-3">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80">
                  {filteredProjects.map((p) => {
                    const pillar = inferProjectPillar(p);
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-zinc-50/90 transition-colors group"
                      >
                        {/* Title & Preview */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt=""
                                className="w-10 h-10 rounded-md object-cover border border-zinc-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-500">
                                <Layers className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-zinc-900 truncate text-xs flex items-center gap-1.5">
                                <span>{p.title}</span>
                                {p.featured && (
                                  <Badge className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 py-0 px-1 font-normal">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                                {getMarkdownExcerpt(p.description || "", 80)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Pillar */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {pillar}
                          </span>
                        </td>

                        {/* Tags */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(p.tags || []).slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
                              >
                                {tag}
                              </span>
                            ))}
                            {(p.tags || []).length > 3 && (
                              <span className="text-[10px] text-zinc-500">
                                +{(p.tags || []).length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Metrics */}
                        <td className="py-3 px-3 text-zinc-500 text-[11px] whitespace-nowrap font-mono">
                          <span className="flex items-center gap-2">
                            <span>{p.views || 0} views</span>
                            <span>·</span>
                            <span>{p.likes || 0} likes</span>
                          </span>
                        </td>

                        {/* Created */}
                        <td className="py-3 px-3 text-zinc-500 whitespace-nowrap text-[11px] font-mono">
                          {new Date(p.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-2xs"
                            >
                              <Link href={`/admin/project/edit/${p.id}`}>
                                <Edit className="w-3.5 h-3.5 mr-1" />
                                <span>Edit Project</span>
                              </Link>
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-zinc-900 font-semibold">Delete Project</AlertDialogTitle>
                                  <AlertDialogDescription className="text-zinc-600">
                                    Are you sure you want to delete &quot;{p.title}&quot;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(p.id, p.title)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW: 3-PILLAR KANBAN BOARD */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {THREE_PILLARS.map((pillar) => {
            const list = kanbanColumns[pillar] || [];
            const colorClass =
              pillar === "Workflow Automation"
                ? "border-emerald-500 bg-emerald-500 text-emerald-700"
                : pillar === "Supply Chain & Demand Planning"
                ? "border-blue-500 bg-blue-500 text-blue-700"
                : "border-purple-500 bg-purple-500 text-purple-700";

            return (
              <div
                key={pillar}
                className="flex flex-col rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-4 min-h-[420px] shadow-2xs"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", colorClass)} />
                    <h3 className="text-xs font-semibold text-zinc-900 truncate">{pillar}</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-white text-zinc-700 border-zinc-200 py-0 px-1.5 font-mono shadow-2xs">
                    {list.length}
                  </Badge>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {list.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-lg">
                      No projects in this pillar
                    </div>
                  ) : (
                    list.map((proj) => (
                      <div
                        key={proj.id}
                        className="rounded-lg border border-zinc-200/90 bg-white p-3.5 hover:border-zinc-300 hover:shadow-xs transition-all group"
                      >
                        {proj.image_url && (
                          <img
                            src={proj.image_url}
                            alt=""
                            className="w-full h-24 rounded-md object-cover mb-2.5 border border-zinc-200"
                          />
                        )}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-xs font-medium text-zinc-900 truncate group-hover:text-emerald-700 transition-colors">
                            {proj.title}
                          </h4>
                          {proj.featured && (
                            <Badge className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 py-0 px-1 shrink-0 font-normal">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 mb-2.5">
                          {getMarkdownExcerpt(proj.description || "", 90)}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(proj.tags || []).slice(0, 3).map((t: string) => (
                            <span
                              key={t}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {proj.views || 0} views
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-[11px] bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-2xs"
                            >
                              <Link href={`/admin/project/edit/${proj.id}`}>
                                <Edit className="w-3 h-3 mr-1" />
                                <span>Edit</span>
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#18191e] border-zinc-800 text-zinc-100">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                  <AlertDialogDescription className="text-zinc-400">
                                    Delete &quot;{proj.title}&quot;?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(proj.id, proj.title)}
                                    className="bg-red-600 hover:bg-red-500 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TAB 3: TRAVEL ATLAS & IG HIGHLIGHTS DIRECTORY
   ========================================================================= */
interface TravelDirectoryTabProps {
  travelHighlights: TravelCityHighlight[];
  isLoading: boolean;
  onDelete: (id: string, cityName: string) => Promise<void>;
}

function TravelDirectoryTab({
  travelHighlights,
  isLoading,
  onDelete,
}: TravelDirectoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return travelHighlights.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.city_name.toLowerCase().includes(q) ||
        c.country_name.toLowerCase().includes(q) ||
        (c.subtitle || "").toLowerCase().includes(q)
      );
    });
  }, [travelHighlights, searchQuery]);

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search cities or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 rounded-lg focus:border-zinc-500 shadow-2xs"
          />
        </div>

        <Button
          asChild
          size="sm"
          className="h-8 px-3 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs gap-1.5 shrink-0 rounded-lg shadow-xs"
        >
          <Link href="/admin/travel/new">
            <Plus className="w-3.5 h-3.5" />
            <span>New City Highlight</span>
          </Link>
        </Button>
      </div>

      {/* NOTION DIRECTORY GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl bg-zinc-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200/90 bg-white text-center py-16 px-4 shadow-xs">
          <Compass className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-zinc-900">No travel cities found</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Create an interactive travel destination highlight with vertical story slides.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((city) => {
            const slideCount = city.story_slides?.length || 0;
            const isPublished = city.is_published !== false;

            return (
              <div
                key={city.id}
                className="rounded-xl border border-zinc-200/90 bg-white p-5 hover:border-zinc-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  {/* Top Bar with Story Ring */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Circular Instagram gradient story ring */}
                      <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                        <img
                          src={city.cover_image_url || "/placeholder.svg"}
                          alt={city.city_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{city.flag}</span>
                          <h3 className="text-sm font-semibold text-zinc-900 truncate">
                            {city.city_name}
                          </h3>
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {city.country_name}
                        </div>
                      </div>
                    </div>

                    <Badge
                      className={cn(
                        "text-[10px] font-normal py-0 px-2 rounded-full",
                        isPublished
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      )}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {/* Subtitle / Description */}
                  <p className="text-xs text-zinc-600 line-clamp-2 mb-4">
                    {city.subtitle || city.essay_title || "Field notes & vertical photo slides"}
                  </p>

                  {/* Lat / Lng badge & Story Slides Badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 font-mono">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span>
                        {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                      <span>{slideCount} story slides</span>
                    </span>
                    <span className="text-zinc-500 font-mono">{city.month || city.year}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-2xs"
                  >
                    <Link href={`/admin/travel/edit/${city.id}`}>
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      <span>Edit Highlight</span>
                    </Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-900 font-semibold">Delete Travel Highlight</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-600">
                          Are you sure you want to delete {city.city_name}, {city.country_name}? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(city.id, city.city_name)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   TAB 4: PERSONAL DIARY ENTRIES DIRECTORY
   ========================================================================= */
interface DiaryDirectoryTabProps {
  diaryEntries: any[];
  isLoading: boolean;
  onDelete: (id: string, title: string) => Promise<void>;
}

function DiaryDirectoryTab({
  diaryEntries,
  isLoading,
  onDelete,
}: DiaryDirectoryTabProps) {
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique years from entries
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add("2026");
    years.add("2025");
    years.add("2024");
    diaryEntries.forEach((entry) => {
      if (entry.entry_date) {
        const y = new Date(entry.entry_date).getFullYear().toString();
        if (y && !isNaN(Number(y))) years.add(y);
      }
    });
    return ["All", ...Array.from(years).sort().reverse()];
  }, [diaryEntries]);

  const filteredEntries = useMemo(() => {
    return diaryEntries.filter((entry) => {
      // Year filter
      if (selectedYear !== "All" && entry.entry_date) {
        const y = new Date(entry.entry_date).getFullYear().toString();
        if (y !== selectedYear) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (entry.title || "").toLowerCase().includes(q);
        const excerptMatch = (entry.excerpt || "").toLowerCase().includes(q);
        const contentMatch = (entry.content || "").toLowerCase().includes(q);
        if (!titleMatch && !excerptMatch && !contentMatch) return false;
      }
      return true;
    });
  }, [diaryEntries, selectedYear, searchQuery]);

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Year Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-200/80 p-1 rounded-lg border border-zinc-300/70 shadow-2xs">
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                selectedYear === year
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60"
              )}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search diary entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 rounded-lg focus:border-zinc-500 shadow-2xs"
            />
          </div>

          <Button
            asChild
            size="sm"
            className="h-8 px-3 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs gap-1.5 shrink-0 rounded-lg shadow-xs"
          >
            <Link href="/admin/diary/new">
              <Plus className="w-3.5 h-3.5" />
              <span>New Diary Entry</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* NOTION DATABASE TABLE OF DIARY ENTRIES */}
      <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-zinc-100" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 px-4">
            <BookHeart className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-zinc-900">No diary entries found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Click &quot;New Diary Entry&quot; to write a field note or reflection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90 text-zinc-600 font-semibold">
                  <th className="py-3 px-4 w-[20%]">Entry Date</th>
                  <th className="py-3 px-4 w-[30%]">Title</th>
                  <th className="py-3 px-4 w-[30%]">Excerpt / Notes</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-zinc-50/90 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-600 font-mono text-xs">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>
                          {entry.entry_date
                            ? new Date(entry.entry_date).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Undated"}
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 truncate text-xs">
                        {entry.title || "Untitled Entry"}
                      </div>
                    </td>

                    {/* Excerpt */}
                    <td className="py-3 px-4">
                      <div className="text-zinc-500 truncate text-[11px] line-clamp-1 max-w-md">
                        {entry.excerpt || getMarkdownExcerpt(entry.content || "", 90)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {entry.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-2xs"
                        >
                          <Link href={`/admin/diary/edit/${entry.id}`}>
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            <span>Edit Entry</span>
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-zinc-900 font-semibold">Delete Diary Entry</AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-600">
                                Delete &quot;{entry.title}&quot;? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(entry.id, entry.title)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TAB 5: SETTINGS TAB (ProfileManagement + CategorySeriesManager)
   ========================================================================= */
function SettingsTab() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* 1. Profile Management */}
      <ProfileManagement />

      {/* 2. Category & Series Manager */}
      <CategorySeriesManager />

      {/* 3. SEO & Meta Settings */}
      <SEOSettings />
    </div>
  );
}

function ProfileManagement() {
  const { profile, loading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    title: "",
    bio: "",
    location: "",
    email: "",
    website_url: "",
    github_url: "",
    linkedin_url: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        title: profile.title || "",
        bio: profile.bio || "",
        location: profile.location || "",
        email: profile.email || "",
        website_url: profile.website_url || "",
        github_url: profile.github_url || "",
        linkedin_url: profile.linkedin_url || "",
      });
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        ...formData,
        skills,
      });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.error("Profile save error:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const val = newSkill.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setNewSkill("");
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  return (
    <Card className="border border-zinc-200/90 bg-white text-zinc-900 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-900">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Profile &amp; Personal Info</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-1">
              Your public persona, titles, bio, and social links displayed across the portfolio.
            </CardDescription>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-7 text-xs border-zinc-300 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 bg-white shadow-2xs"
          >
            <Link href="/admin/profile">Open Full Editor ↗</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-zinc-700 font-medium">Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-700 font-medium">Username</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-700 font-medium">Professional Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-700 font-medium">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-zinc-700 font-medium">Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs resize-none focus:border-zinc-500 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-zinc-700 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-zinc-400" /> Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-700 font-medium flex items-center gap-1">
                <Github className="w-3 h-3 text-zinc-400" /> GitHub URL
              </Label>
              <Input
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-700 font-medium flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-zinc-400" /> LinkedIn URL
              </Label>
              <Input
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Skills Management */}
          <div>
            <Label className="text-xs text-zinc-700 font-medium">Skills &amp; Technologies</Label>
            <div className="flex gap-2 mt-1 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill and press Enter..."
                className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
              />
              <Button
                type="button"
                onClick={addSkill}
                size="sm"
                variant="outline"
                className="h-8 border-zinc-300 text-xs bg-white text-zinc-700 hover:bg-zinc-50 shadow-2xs"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-xs bg-zinc-100 text-zinc-700 border-zinc-200 pr-1.5 py-0.5"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="ml-1.5 text-zinc-400 hover:text-zinc-900"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="h-8 px-4 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold shadow-xs"
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CategorySeriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category dialog
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // New Series dialog
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesSlug, setNewSeriesSlug] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const [isAddingSeries, setIsAddingSeries] = useState(false);

  const fetchTaxonomy = async () => {
    try {
      setLoading(true);
      const { data: catData } = await supabase.from("categories").select("*").order("name");
      const { data: seriesData } = await supabase.from("series").select("*").order("title");
      setCategories(catData || []);
      setSeriesList(seriesData || []);
    } catch (e) {
      console.warn("Error fetching categories/series:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug =
      newCatSlug.trim() ||
      newCatName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: newCatName.trim(), slug, description: newCatDesc.trim() }])
        .select()
        .single();
      if (error) throw error;
      toast.success(`Created category "${data.name}"`);
      setCategories((prev) => [...prev, data]);
      setNewCatName("");
      setNewCatSlug("");
      setNewCatDesc("");
      setIsAddingCat(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Deleted category "${name}"`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeriesTitle.trim()) return;
    const slug =
      newSeriesSlug.trim() ||
      newSeriesTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    try {
      const { data, error } = await supabase
        .from("series")
        .insert([{ title: newSeriesTitle.trim(), slug, description: newSeriesDesc.trim() }])
        .select()
        .single();
      if (error) throw error;
      toast.success(`Created series "${data.title}"`);
      setSeriesList((prev) => [...prev, data]);
      setNewSeriesTitle("");
      setNewSeriesSlug("");
      setNewSeriesDesc("");
      setIsAddingSeries(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create series");
    }
  };

  const handleDeleteSeries = async (id: string, title: string) => {
    try {
      const { error } = await supabase.from("series").delete().eq("id", id);
      if (error) throw error;
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Deleted series "${title}"`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete series");
    }
  };

  return (
    <Card className="border border-zinc-200/90 bg-white text-zinc-900 shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-900">
          <Tag className="w-4 h-4 text-blue-600" />
          <span>Categories &amp; Series Manager</span>
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 mt-1">
          Organize articles and projects into thematic taxonomies and multi-part article series.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Categories ({categories.length})
            </h4>
            <Dialog open={isAddingCat} onOpenChange={setIsAddingCat}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-300 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 bg-white shadow-2xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold text-zinc-900">Create Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs text-zinc-700 font-medium">Category Name *</Label>
                    <Input
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Workflow Automation"
                      className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-700 font-medium">Slug (Optional)</Label>
                    <Input
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="workflow-automation"
                      className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-700 font-medium">Description</Label>
                    <Input
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Category description..."
                      className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button type="submit" size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs shadow-xs">
                      Create Category
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <span className="text-xs text-zinc-400">No categories created yet.</span>
            ) : (
              categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-zinc-100 border border-zinc-200 text-zinc-700"
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({c.slug})</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(c.id, c.name)}
                    className="ml-1 text-zinc-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Series Section */}
        <div className="pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Article Series ({seriesList.length})
            </h4>
            <Dialog open={isAddingSeries} onOpenChange={setIsAddingSeries}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-300 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 bg-white shadow-2xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Series
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold text-zinc-900">Create Article Series</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSeries} className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs text-zinc-700 font-medium">Series Title *</Label>
                    <Input
                      value={newSeriesTitle}
                      onChange={(e) => setNewSeriesTitle(e.target.value)}
                      placeholder="e.g. Masterclass in S&OP Demand Planning"
                      className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-700 font-medium">Slug (Optional)</Label>
                    <Input
                      value={newSeriesSlug}
                      onChange={(e) => setNewSeriesSlug(e.target.value)}
                      placeholder="sop-demand-planning"
                      className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-700 font-medium">Description</Label>
                    <Input
                      value={newSeriesDesc}
                      onChange={(e) => setNewSeriesDesc(e.target.value)}
                      placeholder="Series description..."
                      className="mt-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-500 shadow-2xs"
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button type="submit" size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs shadow-xs">
                      Create Series
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2">
            {seriesList.length === 0 ? (
              <span className="text-xs text-zinc-400">No article series created yet.</span>
            ) : (
              seriesList.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-zinc-100 border border-zinc-200 text-zinc-700"
                >
                  <span>{s.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({s.slug})</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSeries(s.id, s.title)}
                    className="ml-1 text-zinc-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
