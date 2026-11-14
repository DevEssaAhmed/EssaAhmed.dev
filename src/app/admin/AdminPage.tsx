"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLocation } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { createOrGetCategory } from "@/lib/tagUtils";
import {
  detectPlatformFromUrl,
  encodeArticleExternalMeta,
} from "@/data/externalArticlesStore";
import {
  deleteTravelHighlightFromSupabase,
  fetchTravelHighlightsFromSupabase,
  saveTravelHighlightsLocal,
  TravelCityHighlight,
  upsertTravelHighlightInSupabase,
} from "@/data/travelData";
import { isPublicTravelHighlight } from "@/data/travelVisibility";
import { type PillarType } from "@/lib/admin-helpers";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { ArticlesDirectoryTab } from "@/components/admin/tabs/ArticlesDirectoryTab";
import { ProjectsDirectoryTab } from "@/components/admin/tabs/ProjectsDirectoryTab";
import { TravelDirectoryTab } from "@/components/admin/tabs/TravelDirectoryTab";
import { DiaryDirectoryTab } from "@/components/admin/tabs/DiaryDirectoryTab";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";

const VALID_TABS = new Set(["overview", "blogs", "projects", "travel", "diary", "settings"]);

const TAB_HEADER_META: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview & Content Health",
    subtitle: "Portfolio Operations Console",
  },
  blogs: {
    title: "All Articles & Blogs",
    subtitle: "Editorial & External Syndicate Directory",
  },
  projects: {
    title: "All Projects (3 Pillars)",
    subtitle: "Case Studies & Engineering Pillars",
  },
  travel: {
    title: "Travel Atlas & IG Cities",
    subtitle: "Interactive Pins, 9:16 Stories & Essays",
  },
  diary: {
    title: "Personal Diary Entries",
    subtitle: "Chronological Field Notes & Reflections",
  },
  settings: {
    title: "Profile & Site Settings",
    subtitle: "Identity, Taxonomy, SEO & Maintenance",
  },
};

function resolveInitialTab(searchStr: string): string {
  const sp = new URLSearchParams(searchStr || "");
  const tab = sp.get("tab") || "";
  return VALID_TABS.has(tab) ? tab : "overview";
}

export default function AdminPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return resolveInitialTab(window.location.search);
    }
    return "overview";
  });

  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [travelHighlights, setTravelHighlights] = useState<TravelCityHighlight[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [orphanTagsCount, setOrphanTagsCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync URL query param -> activeTab when navigating between ?tab=... links
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const paramTab = sp.get("tab");
    if (paramTab && VALID_TABS.has(paramTab)) {
      setActiveTab(paramTab);
    } else if (!paramTab) {
      setActiveTab("overview");
    }
  }, [location.search]);

  const handleTabChange = (newTab: string) => {
    const safeTab = VALID_TABS.has(newTab) ? newTab : "overview";
    setActiveTab(safeTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", safeTab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const fetchAllData = useCallback(async (backgroundRefresh = false) => {
    if (backgroundRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [blogRes, projRes, catRes, mergedTravel, diaryRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select(
            "id,title,slug,excerpt,content,image_url,published,unlisted,reading_time,views,likes,category_id,series_id,is_external,external_url,platform,video_type,video_url,created_at,updated_at,categories(id,name),series(id,title)"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select(
            "id,title,description,image_url,tags,featured,views,likes,created_at,updated_at,category_id,categories(id,name)"
          )
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("id,name,slug,description").order("name"),
        fetchTravelHighlightsFromSupabase(),
        supabase
          .from("diary_entries")
          .select(
            "id,title,excerpt,content,entry_date,topic_tag,is_published,image_url,image_alt,created_at,updated_at"
          )
          .order("entry_date", { ascending: false }),
      ]);

      if (blogRes.error) console.warn("Error fetching blog posts:", blogRes.error);
      setBlogPosts(blogRes.data || []);

      if (projRes.error) console.warn("Error fetching projects:", projRes.error);
      setProjects(projRes.data || []);

      if (catRes.error) console.warn("Error fetching categories:", catRes.error);
      setCategories(catRes.data || []);

      setTravelHighlights(mergedTravel || []);

      if (diaryRes.error) console.warn("Error fetching diary entries:", diaryRes.error);
      setDiaryEntries(diaryRes.data || []);

      // Best-effort orphan tag audit count for Overview Health
      try {
        const { data: tagStats, error: tagErr } = await supabase.rpc("get_all_tags_with_counts");
        if (!tagErr && Array.isArray(tagStats)) {
          setOrphanTagsCount(tagStats.filter((t: any) => Number(t.total_count || 0) === 0).length);
        }
      } catch {
        setOrphanTagsCount(0);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load some admin data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllData(false);
  }, [fetchAllData]);

  const orphanCategoriesCount = useMemo(() => {
    const usedIds = new Set<string>();
    for (const p of projects) if (p?.category_id) usedIds.add(p.category_id);
    for (const post of blogPosts) if (post?.category_id) usedIds.add(post.category_id);
    return categories.filter((c) => !usedIds.has(c.id)).length;
  }, [categories, projects, blogPosts]);

  // -------------------------------------------------------------------------
  // Article Mutations
  // -------------------------------------------------------------------------
  const handleImportExternalArticle = async (url: string): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session expired — please sign in again to import external articles.");
        return false;
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
      const encoded = encodeArticleExternalMeta({
        isExternal: true,
        externalUrl: imported.external_url || url,
        platform: imported.platform || detectPlatformFromUrl(url),
      });

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
        .select("*, categories(id,name), series(id,title)")
        .single();

      if (insertError) throw insertError;

      if (newRow) {
        setBlogPosts((prev) => [newRow, ...prev]);
        toast.success(`Imported "${newRow.title}" (${encoded.platform || "External"})`);
      }
      return true;
    } catch (err: any) {
      console.error("Article import error:", err);
      toast.error(err?.message || "Failed to import article from URL");
      return false;
    }
  };

  const handleUpdateArticleStatus = async (
    post: any,
    mode: "published" | "draft" | "unlisted"
  ) => {
    const updates = {
      published: mode !== "draft",
      unlisted: mode === "unlisted",
    };
    try {
      const { error } = await supabase.from("blog_posts").update(updates).eq("id", post.id);
      if (error) throw error;
      setBlogPosts((prev) =>
        prev.map((item) => (item.id === post.id ? { ...item, ...updates } : item))
      );
      toast.success(`Article marked as ${mode}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed updating article status");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Article deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed deleting article");
    }
  };

  // -------------------------------------------------------------------------
  // Project Mutations
  // -------------------------------------------------------------------------
  const handleToggleProjectFeatured = async (project: any) => {
    const nextFeatured = !project.featured;
    try {
      const { error } = await supabase
        .from("projects")
        .update({ featured: nextFeatured })
        .eq("id", project.id);
      if (error) throw error;
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: nextFeatured } : p))
      );
      toast.success(nextFeatured ? "Marked as Featured" : "Removed from Featured");
    } catch (err: any) {
      toast.error(err?.message || "Failed updating featured flag");
    }
  };

  const handleChangeProjectPillar = async (project: any, pillar: PillarType) => {
    try {
      const resolvedCategory = await createOrGetCategory(pillar);
      if (!resolvedCategory?.id) {
        throw new Error(`Could not resolve category for "${pillar}"`);
      }

      const { error } = await supabase
        .from("projects")
        .update({ category_id: resolvedCategory.id })
        .eq("id", project.id);
      if (error) throw error;

      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                category_id: resolvedCategory.id,
                categories: { id: resolvedCategory.id, name: resolvedCategory.name },
              }
            : p
        )
      );
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === resolvedCategory.id);
        return exists
          ? prev
          : [...prev, resolvedCategory].sort((a, b) => String(a.name).localeCompare(String(b.name)));
      });
      toast.success(`Moved project to ${pillar}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed switching project pillar");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await supabase.from("project_tags").delete().eq("project_id", id);
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed deleting project");
    }
  };

  // -------------------------------------------------------------------------
  // Travel Mutations
  // -------------------------------------------------------------------------
  const handleToggleTravelPublish = async (city: any) => {
    const nextPublished = !city.is_published;
    const candidate = { ...city, is_published: nextPublished } as TravelCityHighlight;

    if (nextPublished && !isPublicTravelHighlight(candidate)) {
      toast.error(
        "Cannot publish yet: open the Travel Editor to ensure valid coordinates, a cover image, and at least one 9:16 slide image."
      );
      return;
    }

    try {
      await upsertTravelHighlightInSupabase(candidate);
      const updatedList = travelHighlights.map((item) =>
        item.id === city.id ? candidate : item
      );
      setTravelHighlights(updatedList);
      saveTravelHighlightsLocal(updatedList);
      toast.success(nextPublished ? `Published ${city.city_name}` : `${city.city_name} set to Draft`);
    } catch (err: any) {
      toast.error(err?.message || "Failed updating travel destination visibility");
    }
  };

  const handleDeleteTravelCity = async (id: string) => {
    try {
      await deleteTravelHighlightFromSupabase(id);
      const updatedList = travelHighlights.filter((c) => c.id !== id);
      setTravelHighlights(updatedList);
      saveTravelHighlightsLocal(updatedList);
      toast.success("Travel destination deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed deleting travel destination");
    }
  };

  // -------------------------------------------------------------------------
  // Diary Mutations
  // -------------------------------------------------------------------------
  const handleToggleDiaryPublish = async (entry: any) => {
    const nextPublished = !entry.is_published;
    try {
      const { error } = await supabase
        .from("diary_entries")
        .update({ is_published: nextPublished })
        .eq("id", entry.id);
      if (error) throw error;
      setDiaryEntries((prev) =>
        prev.map((d) => (d.id === entry.id ? { ...d, is_published: nextPublished } : d))
      );
      toast.success(nextPublished ? "Diary entry published" : "Diary entry moved to Draft");
    } catch (err: any) {
      toast.error(err?.message || "Failed toggling diary status");
    }
  };

  const handleDeleteDiaryEntry = async (id: string) => {
    try {
      const { error } = await supabase.from("diary_entries").delete().eq("id", id);
      if (error) throw error;
      setDiaryEntries((prev) => prev.filter((d) => d.id !== id));
      toast.success("Diary entry deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed deleting diary entry");
    }
  };

  const headerMeta = TAB_HEADER_META[activeTab] || TAB_HEADER_META.overview;

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      blogsCount={blogPosts.length}
      projectsCount={projects.length}
      travelCount={travelHighlights.length}
      diaryCount={diaryEntries.length}
      title={headerMeta.title}
      subtitle={headerMeta.subtitle}
      fullWidthContent={true}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-zinc-400" />
          <p className="text-sm font-medium">Loading portfolio CMS workspace...</p>
        </div>
      ) : (
        <>
          {activeTab === "overview" && (
            <OverviewTab
              blogPosts={blogPosts}
              projects={projects}
              travelHighlights={travelHighlights}
              diaryEntries={diaryEntries}
              categories={categories}
              orphanTagsCount={orphanTagsCount}
              orphanCategoriesCount={orphanCategoriesCount}
              onNavigateTab={handleTabChange}
              onQuickRefresh={() => fetchAllData(true)}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === "blogs" && (
            <ArticlesDirectoryTab
              posts={blogPosts}
              categories={categories}
              isLoading={isLoading}
              onImportExternal={handleImportExternalArticle}
              onUpdateStatus={handleUpdateArticleStatus}
              onDeletePost={handleDeleteArticle}
            />
          )}

          {activeTab === "projects" && (
            <ProjectsDirectoryTab
              projects={projects}
              categories={categories}
              onToggleFeatured={handleToggleProjectFeatured}
              onChangePillar={handleChangeProjectPillar}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeTab === "travel" && (
            <TravelDirectoryTab
              travelHighlights={travelHighlights}
              onTogglePublish={handleToggleTravelPublish}
              onDeleteCity={handleDeleteTravelCity}
            />
          )}

          {activeTab === "diary" && (
            <DiaryDirectoryTab
              diaryEntries={diaryEntries}
              onTogglePublish={handleToggleDiaryPublish}
              onDeleteEntry={handleDeleteDiaryEntry}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              blogPosts={blogPosts}
              projects={projects}
              onTaxonomyChanged={() => fetchAllData(true)}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
}
