"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { BlockNoteEditor } from "@blocknote/core";
import {
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  FolderTree,
  Globe,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Tag,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";
import { associateProjectTags } from "@/lib/tagUtils";
import { revalidatePortfolioCache } from "@/lib/revalidate-client";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  blocksToMarkdown,
  markdownToBlocks,
  type BlockNoteContent,
} from "@/lib/blocknote-markdown";
import FileUpload from "@/components/FileUpload";
import HeroStatsManager from "@/components/admin/HeroStatsManager";
import SEOSettings from "@/components/admin/SEOSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const BlockNoteEditorComponent = dynamic(
  () => import("@/components/editor/BlockNoteEditor"),
  { ssr: false }
);

interface SettingsTabProps {
  blogPosts: any[];
  projects: any[];
  onTaxonomyChanged?: () => Promise<void>;
}

const DEFAULT_ABOUT_BLOCKS: BlockNoteContent = [
  {
    id: "about-initial-1",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [],
    children: [],
  },
];

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  blogPosts,
  projects,
  onTaxonomyChanged,
}) => {
  const [subTab, setSubTab] = useState("profile");

  return (
    <div className="space-y-6 max-w-6xl">
      <Tabs value={subTab} onValueChange={setSubTab} className="space-y-6">
        <div className="bg-white border border-zinc-200/90 rounded-xl p-1.5 shadow-2xs overflow-x-auto">
          <TabsList className="bg-transparent h-auto flex flex-nowrap sm:flex-wrap gap-1 justify-start">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-600 hover:text-zinc-900 rounded-lg px-3 py-1.5 text-xs font-medium gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Profile &amp; About
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-600 hover:text-zinc-900 rounded-lg px-3 py-1.5 text-xs font-medium gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Hero Stats
            </TabsTrigger>
            <TabsTrigger
              value="taxonomy"
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-600 hover:text-zinc-900 rounded-lg px-3 py-1.5 text-xs font-medium gap-1.5"
            >
              <FolderTree className="w-3.5 h-3.5" />
              Categories &amp; Series
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-600 hover:text-zinc-900 rounded-lg px-3 py-1.5 text-xs font-medium gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              SEO &amp; Metadata
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-600 hover:text-zinc-900 rounded-lg px-3 py-1.5 text-xs font-medium gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              Maintenance &amp; Cleanup
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="mt-0">
          <ProfileAndAboutSection />
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <HeroStatsManager />
        </TabsContent>

        <TabsContent value="taxonomy" className="mt-0">
          <TaxonomyManagerSection
            blogPosts={blogPosts}
            projects={projects}
            onTaxonomyChanged={onTaxonomyChanged}
          />
        </TabsContent>

        <TabsContent value="seo" className="mt-0">
          <SEOSettings />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-0">
          <MaintenanceSection
            blogPosts={blogPosts}
            projects={projects}
            onTaxonomyChanged={onTaxonomyChanged}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ============================================================================
   1. PROFILE & ABOUT SECTION (with Avatar Upload + BlockNote About Editor)
   ============================================================================ */
function ProfileAndAboutSection() {
  const { profile, loading, hasFullProfile, updateProfile, refreshFullProfile } = useProfile();
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

  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const editorRef = useRef<BlockNoteEditor | null>(null);
  const [aboutContent, setAboutContent] = useState<BlockNoteContent>(DEFAULT_ABOUT_BLOCKS);
  const [aboutKey, setAboutKey] = useState("init");
  const hydratedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    void refreshFullProfile();
  }, [refreshFullProfile]);

  useEffect(() => {
    if (!profile) return;
    const p = profile as any;

    setFormData({
      name: p.name || "",
      username: p.username || "",
      title: p.title || "",
      bio: p.bio || "",
      location: p.location || "",
      email: p.email || "",
      website_url: p.website_url || "",
      github_url: p.github_url || "",
      linkedin_url: p.linkedin_url || "",
    });
    setAvatarUrl(p.avatar_url || "");
    setSkills(Array.isArray(p.skills) ? p.skills : []);

    if (!hasFullProfile) return;

    const json = p.about_content_jsonb;
    const md = typeof p.about_markdown === "string" ? p.about_markdown : "";

    let contentToSet: BlockNoteContent = DEFAULT_ABOUT_BLOCKS;
    let sig = "empty";

    if (json && Array.isArray(json) && json.length > 0) {
      contentToSet = json as BlockNoteContent;
      sig = `json:${JSON.stringify(json)}`;
    } else if (md && md.trim()) {
      contentToSet = markdownToBlocks(md) as BlockNoteContent;
      sig = `md:${md}`;
    }

    if (hydratedSignatureRef.current !== sig) {
      hydratedSignatureRef.current = sig;
      setAboutContent(contentToSet);
      setAboutKey(`about-${sig.length}-${Date.now()}`);
    }
  }, [profile, hasFullProfile]);

  const addSkill = () => {
    const cleaned = newSkill.trim();
    if (cleaned && !skills.includes(cleaned)) {
      setSkills((prev) => [...prev, cleaned]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleRemoveAvatar = async () => {
    const marker = "/storage/v1/object/public/avatars/";
    const idx = avatarUrl.indexOf(marker);
    if (idx !== -1) {
      const storagePath = decodeURIComponent(avatarUrl.slice(idx + marker.length).split("?")[0]);
      if (storagePath) {
        await supabase.storage.from("avatars").remove([storagePath]);
      }
    }
    setAvatarUrl("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const md = editorRef.current ? await blocksToMarkdown(editorRef.current) : "";
      await updateProfile({
        ...formData,
        avatar_url: avatarUrl || null,
        skills,
        about_markdown: md,
        about_content_jsonb: aboutContent,
      });
      void revalidatePortfolioCache({ paths: ["/", "/about"], tags: ["site-shell"] });
      toast.success("Profile and About content updated");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <Card className="bg-white border-zinc-200/90 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-zinc-100">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900">
              Identity, Social Links &amp; Avatar
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Changes reflect across your hero section, navigation, and About page.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/profile">
              <Button type="button" size="sm" variant="outline" className="text-xs border-zinc-200 text-zinc-700">
                Full Profile Page <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              disabled={saving || loading}
              className="bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-200 border border-zinc-300 shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <OptimizedImage
                  src={avatarUrl}
                  alt="Profile avatar"
                  width={160}
                  height={160}
                  sizes="80px"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-zinc-400" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-zinc-800">Profile Avatar</Label>
                {avatarUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleRemoveAvatar()}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700"
                  >
                    Remove Avatar
                  </Button>
                )}
              </div>
              <FileUpload
                label="Upload new avatar image"
                uploadType="avatar"
                accept="image/*"
                maxFiles={1}
                maxSizeMB={5}
                allowUrlInput
                showPreview={false}
                existingFiles={avatarUrl ? [avatarUrl] : []}
                onUploadComplete={(urls) => {
                  if (urls[0]) setAvatarUrl(urls[0]);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Handle / Username</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Headline / Role Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Contact Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Personal Website</Label>
              <Input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData((p) => ({ ...p, website_url: e.target.value }))}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">GitHub URL</Label>
              <Input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData((p) => ({ ...p, github_url: e.target.value }))}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">LinkedIn URL</Label>
              <Input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData((p) => ({ ...p, linkedin_url: e.target.value }))}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-700">Short Bio / Hero Introduction</Label>
            <Textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
              className="bg-white border-zinc-300 text-zinc-900"
            />
          </div>

          {/* Skills Manager */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-700">Core Skills ({skills.length})</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add skill (e.g. Python, Supply Chain, SQL)..."
                className="max-w-sm bg-white border-zinc-300 text-zinc-900"
              />
              <Button type="button" variant="outline" onClick={addSkill} className="border-zinc-300">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2.5 py-1 gap-1.5"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-zinc-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rich BlockNote About Story Editor */}
      <Card className="bg-white border-zinc-200/90 shadow-2xs">
        <CardHeader className="border-b border-zinc-100">
          <CardTitle className="text-base font-semibold text-zinc-900">
            About Story (BlockNote Rich Editor)
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Synced to both structured JSONB and markdown for your /about page.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="min-h-[320px] border border-zinc-200 rounded-lg bg-white p-2">
            <BlockNoteEditorComponent
              key={aboutKey}
              initialContent={aboutContent}
              loading={!hasFullProfile && loading}
              onChange={setAboutContent}
              onEditorReady={(ed) => {
                editorRef.current = ed;
              }}
              placeholder="Write your About page narrative..."
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

/* ============================================================================
   2. TAXONOMY MANAGER (Categories & Series with Usage Counts + Edit Modal)
   ============================================================================ */
function TaxonomyManagerSection({
  blogPosts,
  projects,
  onTaxonomyChanged,
}: {
  blogPosts: any[];
  projects: any[];
  onTaxonomyChanged?: () => Promise<void>;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  const [editingSeries, setEditingSeries] = useState<any | null>(null);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesSlug, setSeriesSlug] = useState("");
  const [seriesDesc, setSeriesDesc] = useState("");
  const [savingSeries, setSavingSeries] = useState(false);

  const loadTaxonomy = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: catData }, { data: serData }] = await Promise.all([
        supabase.from("categories").select("id, name, slug, description").order("name"),
        supabase.from("series").select("id, title, slug, description").order("title"),
      ]);
      setCategories(catData || []);
      setSeriesList(serData || []);
    } catch (err) {
      console.error("Failed loading taxonomy:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTaxonomy();
  }, [loadTaxonomy]);

  const categoryUsageCounts = useMemo(() => {
    const counts = new Map<string, { projects: number; posts: number }>();
    for (const p of projects || []) {
      if (p?.category_id) {
        const cur = counts.get(p.category_id) || { projects: 0, posts: 0 };
        cur.projects += 1;
        counts.set(p.category_id, cur);
      }
    }
    for (const post of blogPosts || []) {
      if (post?.category_id) {
        const cur = counts.get(post.category_id) || { projects: 0, posts: 0 };
        cur.posts += 1;
        counts.set(post.category_id, cur);
      }
    }
    return counts;
  }, [projects, blogPosts]);

  const seriesUsageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of blogPosts || []) {
      if (post?.series_id) {
        counts.set(post.series_id, (counts.get(post.series_id) || 0) + 1);
      }
    }
    return counts;
  }, [blogPosts]);

  const openCategoryModal = (cat?: any) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name || "");
      setCatSlug(cat.slug || "");
      setCatDesc(cat.description || "");
    } else {
      setEditingCategory(null);
      setCatName("");
      setCatSlug("");
      setCatDesc("");
    }
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setSavingCat(true);
    try {
      const payload = {
        name: catName.trim(),
        slug: catSlug.trim() || slugifyText(catName),
        description: catDesc.trim() || null,
      };
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast.success(`Updated category "${payload.name}"`);
      } else {
        const { error } = await supabase.from("categories").insert([payload]);
        if (error) throw error;
        toast.success(`Created category "${payload.name}"`);
      }
      setCatModalOpen(false);
      void revalidatePortfolioCache({ paths: ["/articles", "/articles/categories", "/projects"] });
      await loadTaxonomy();
      if (onTaxonomyChanged) await onTaxonomyChanged();
    } catch (err: any) {
      toast.error(err?.message || "Failed saving category");
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", cat.id);
      if (error) throw error;
      toast.success(`Deleted category "${cat.name}"`);
      void revalidatePortfolioCache({ paths: ["/articles", "/articles/categories", "/projects"] });
      await loadTaxonomy();
      if (onTaxonomyChanged) await onTaxonomyChanged();
    } catch (err: any) {
      toast.error(err?.message || "Failed deleting category");
    }
  };

  const openSeriesModal = (ser?: any) => {
    if (ser) {
      setEditingSeries(ser);
      setSeriesTitle(ser.title || "");
      setSeriesSlug(ser.slug || "");
      setSeriesDesc(ser.description || "");
    } else {
      setEditingSeries(null);
      setSeriesTitle("");
      setSeriesSlug("");
      setSeriesDesc("");
    }
    setSeriesModalOpen(true);
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesTitle.trim()) {
      toast.error("Series title is required.");
      return;
    }
    setSavingSeries(true);
    try {
      const payload = {
        title: seriesTitle.trim(),
        slug: seriesSlug.trim() || slugifyText(seriesTitle),
        description: seriesDesc.trim() || null,
      };
      if (editingSeries) {
        const { error } = await supabase
          .from("series")
          .update(payload)
          .eq("id", editingSeries.id);
        if (error) throw error;
        toast.success(`Updated series "${payload.title}"`);
      } else {
        const { error } = await supabase.from("series").insert([payload]);
        if (error) throw error;
        toast.success(`Created series "${payload.title}"`);
      }
      setSeriesModalOpen(false);
      void revalidatePortfolioCache({ paths: ["/articles", "/articles/series"] });
      await loadTaxonomy();
      if (onTaxonomyChanged) await onTaxonomyChanged();
    } catch (err: any) {
      toast.error(err?.message || "Failed saving series");
    } finally {
      setSavingSeries(false);
    }
  };

  const handleDeleteSeries = async (ser: any) => {
    try {
      const { error } = await supabase.from("series").delete().eq("id", ser.id);
      if (error) throw error;
      toast.success(`Deleted series "${ser.title}"`);
      void revalidatePortfolioCache({ paths: ["/articles", "/articles/series"] });
      await loadTaxonomy();
      if (onTaxonomyChanged) await onTaxonomyChanged();
    } catch (err: any) {
      toast.error(err?.message || "Failed deleting series");
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card className="bg-white border-zinc-200/90 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900">
              Categories ({categories.length})
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Used for both Articles and Project Pillars with live usage counts.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => openCategoryModal()}
            className="bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Category
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="py-6 text-center text-xs text-zinc-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">No categories yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {categories.map((cat) => {
                const usage = categoryUsageCounts.get(cat.id) || { projects: 0, posts: 0 };
                const total = usage.projects + usage.posts;
                return (
                  <div key={cat.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-zinc-900">{cat.name}</span>
                        <span className="text-xs font-mono text-zinc-400">/{cat.slug}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            total === 0
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200"
                          }`}
                        >
                          {usage.projects} projects · {usage.posts} articles
                        </Badge>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-zinc-500 mt-0.5">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openCategoryModal(cat)}
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete category &ldquo;{cat.name}&rdquo;?</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-500">
                              Currently referenced by {usage.projects} project(s) and {usage.posts} article(s).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-zinc-100 border-zinc-200 text-zinc-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => void handleDeleteCategory(cat)}
                              className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                              Delete Category
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
        </CardContent>
      </Card>

      {/* Series */}
      <Card className="bg-white border-zinc-200/90 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900">
              Article Series ({seriesList.length})
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Multi-part writing arcs and multipart editorial guides.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openSeriesModal()}
            className="border-zinc-300 text-zinc-800"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Series
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="py-6 text-center text-xs text-zinc-500">Loading series...</div>
          ) : seriesList.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">No series created yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {seriesList.map((ser) => {
                const count = seriesUsageCounts.get(ser.id) || 0;
                return (
                  <div key={ser.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-zinc-900">{ser.title}</span>
                        <span className="text-xs font-mono text-zinc-400">/{ser.slug}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-zinc-50 text-zinc-700 border-zinc-200"
                        >
                          {count} {count === 1 ? "article" : "articles"}
                        </Badge>
                      </div>
                      {ser.description && (
                        <p className="text-xs text-zinc-500 mt-0.5">{ser.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openSeriesModal(ser)}
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete series &ldquo;{ser.title}&rdquo;?</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-500">
                              Referenced by {count} article(s). Articles will remain but lose their series link.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-zinc-100 border-zinc-200 text-zinc-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => void handleDeleteSeries(ser)}
                              className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                              Delete Series
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
        </CardContent>
      </Card>

      {/* Category Modal */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Name</Label>
              <Input
                value={catName}
                onChange={(e) => {
                  const val = e.target.value;
                  setCatName(val);
                  if (!editingCategory) setCatSlug(slugifyText(val));
                }}
                required
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Slug</Label>
              <Input
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900 font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Description (optional)</Label>
              <Textarea
                rows={2}
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCatModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingCat} className="bg-zinc-900 text-white">
                {savingCat && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Series Modal */}
      <Dialog open={seriesModalOpen} onOpenChange={setSeriesModalOpen}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
          <DialogHeader>
            <DialogTitle>{editingSeries ? "Edit Series" : "Create Article Series"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSeries} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Title</Label>
              <Input
                value={seriesTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setSeriesTitle(val);
                  if (!editingSeries) setSeriesSlug(slugifyText(val));
                }}
                required
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Slug</Label>
              <Input
                value={seriesSlug}
                onChange={(e) => setSeriesSlug(e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900 font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-700">Description (optional)</Label>
              <Textarea
                rows={2}
                value={seriesDesc}
                onChange={(e) => setSeriesDesc(e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSeriesModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingSeries} className="bg-zinc-900 text-white">
                {savingSeries && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save Series
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================================
   3. MAINTENANCE & CLEANUP (Orphan Tags/Categories + Sync Project Tags Backfill)
   ============================================================================ */
function MaintenanceSection({
  blogPosts,
  projects,
  onTaxonomyChanged,
}: {
  blogPosts: any[];
  projects: any[];
  onTaxonomyChanged?: () => Promise<void>;
}) {
  const [orphanTags, setOrphanTags] = useState<string[]>([]);
  const [orphanCategories, setOrphanCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaningTags, setCleaningTags] = useState(false);
  const [cleaningCats, setCleaningCats] = useState(false);
  const [syncingProjects, setSyncingProjects] = useState(false);
  const [syncReport, setSyncReport] = useState<string | null>(null);

  const scanMaintenance = useCallback(async () => {
    setLoading(true);
    try {
      let tagRows: { name: string; total_count: number }[] = [];
      try {
        const { data, error } = await supabase.rpc("get_all_tags_with_counts");
        if (error) throw error;
        tagRows = (data || []).map((t: any) => ({
          name: String(t.name),
          total_count: Number(t.total_count || 0),
        }));
      } catch {
        const { data } = await supabase.from("tags").select("name");
        tagRows = (data || []).map((t: any) => ({ name: String(t.name), total_count: 0 }));
      }
      setOrphanTags(tagRows.filter((t) => t.total_count === 0).map((t) => t.name));

      const { data: catRows } = await supabase.from("categories").select("id, name");
      const usedCatIds = new Set<string>();
      for (const p of projects || []) if (p?.category_id) usedCatIds.add(p.category_id);
      for (const post of blogPosts || []) if (post?.category_id) usedCatIds.add(post.category_id);

      setOrphanCategories(
        (catRows || []).filter((c: any) => !usedCatIds.has(c.id))
      );
    } catch (err) {
      console.error("Maintenance scan error:", err);
    } finally {
      setLoading(false);
    }
  }, [projects, blogPosts]);

  useEffect(() => {
    void scanMaintenance();
  }, [scanMaintenance]);

  const handleCleanupOrphanTags = async () => {
    if (orphanTags.length === 0) return;
    setCleaningTags(true);
    try {
      const { error } = await supabase.from("tags").delete().in("name", orphanTags);
      if (error) throw error;
      toast.success(`Removed ${orphanTags.length} unused tag(s)`);
      void revalidatePortfolioCache({ paths: ["/articles", "/articles/tags"] });
      await scanMaintenance();
      if (onTaxonomyChanged) await onTaxonomyChanged();
    } catch (err: any) {
      toast.error(err?.message || "Failed deleting orphan tags");
    } finally {
      setCleaningTags(false);
    }
  };

  const handleCleanupOrphanCategories = async () => {
    if (orphanCategories.length === 0) return;
    setCleaningCats(true);
    try {
      const ids = orphanCategories.map((c) => c.id);
      const { error } = await supabase.from("categories").delete().in("id", ids);
      if (error) throw error;
      toast.success(`Removed ${ids.length} unused categor${ids.length === 1 ? "y" : "ies"}`);
      void revalidatePortfolioCache({ paths: ["/articles", "/articles/categories", "/projects"] });
      await scanMaintenance();
      if (onTaxonomyChanged) await onTaxonomyChanged();
    } catch (err: any) {
      toast.error(err?.message || "Failed deleting orphan categories");
    } finally {
      setCleaningCats(false);
    }
  };

  const handleSyncProjectTagsBackfill = async () => {
    setSyncingProjects(true);
    setSyncReport(null);
    try {
      const [{ data: projectRows, error: projErr }, { data: ptRows, error: ptErr }] =
        await Promise.all([
          supabase.from("projects").select("id, title, tags"),
          supabase.from("project_tags").select("project_id, tags(name)"),
        ]);

      if (projErr) throw projErr;
      if (ptErr) throw ptErr;

      const junctionByProject = new Map<string, string[]>();
      for (const row of ptRows || []) {
        const pid = (row as any).project_id;
        const tagObj = (row as any).tags;
        const tagName = Array.isArray(tagObj) ? tagObj[0]?.name : tagObj?.name;
        if (pid && tagName) {
          const list = junctionByProject.get(pid) || [];
          if (!list.includes(tagName)) list.push(tagName);
          junctionByProject.set(pid, list);
        }
      }

      let updatedCount = 0;
      for (const proj of projectRows || []) {
        const junctionTags = junctionByProject.get(proj.id) || [];
        const columnTags = Array.isArray(proj.tags)
          ? proj.tags.map((t: any) => String(t).trim()).filter(Boolean)
          : [];

        const targetTags = junctionTags.length > 0 ? junctionTags : columnTags;
        const sortedA = [...targetTags].sort().join("|");
        const sortedB = [...columnTags].sort().join("|");

        if (junctionTags.length === 0 && columnTags.length > 0) {
          const ok = await associateProjectTags(proj.id, columnTags);
          if (ok) updatedCount += 1;
        } else if (sortedA !== sortedB) {
          const { error: upErr } = await supabase
            .from("projects")
            .update({ tags: targetTags })
            .eq("id", proj.id);
          if (!upErr) updatedCount += 1;
        }
      }

      const msg =
        updatedCount === 0
          ? "All projects already have matching tags and junction rows."
          : `Synced tags across ${updatedCount} project(s).`;
      setSyncReport(msg);
      toast.success(msg);
      await scanMaintenance();
      if (onTaxonomyChanged) await onTaxonomyChanged();
    } catch (err: any) {
      console.error("Project tags backfill failed:", err);
      toast.error(err?.message || "Failed syncing project tags");
    } finally {
      setSyncingProjects(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync Project Tags Backfill */}
      <Card className="bg-white border-zinc-200/90 shadow-2xs">
        <CardHeader className="border-b border-zinc-100 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Sync Project Tags Backfill
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Reconciles <code className="font-mono text-[11px]">projects.tags</code> array column with <code className="font-mono text-[11px]">project_tags</code> junction records so public filters and case study cards match.
            </CardDescription>
          </div>
          <Button
            onClick={() => void handleSyncProjectTagsBackfill()}
            disabled={syncingProjects}
            className="bg-zinc-900 text-white hover:bg-zinc-800 shrink-0"
          >
            {syncingProjects ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5" />
            )}
            Sync Project Tags
          </Button>
        </CardHeader>
        {syncReport && (
          <CardContent className="p-4 text-xs text-emerald-700 bg-emerald-50/70 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncReport}</span>
          </CardContent>
        )}
      </Card>

      {/* Orphan Cleanup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-zinc-200/90 shadow-2xs">
          <CardHeader className="border-b border-zinc-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                Orphan Tags ({orphanTags.length})
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Tags with zero project or article associations.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => void scanMaintenance()}
                disabled={loading}
                className="h-8 w-8 text-zinc-500"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
              {orphanTags.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={cleaningTags}
                  onClick={() => void handleCleanupOrphanTags()}
                  className="h-8 text-xs"
                >
                  {cleaningTags && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                  Delete All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {orphanTags.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 py-4">
                <CheckCircle2 className="w-4 h-4" /> No orphan tags detected.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {orphanTags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200/90 shadow-2xs">
          <CardHeader className="border-b border-zinc-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-sky-600" />
                Orphan Categories ({orphanCategories.length})
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Categories unused by any article or project.
              </CardDescription>
            </div>
            {orphanCategories.length > 0 && (
              <Button
                size="sm"
                variant="destructive"
                disabled={cleaningCats}
                onClick={() => void handleCleanupOrphanCategories()}
                className="h-8 text-xs"
              >
                {cleaningCats && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Delete All
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {orphanCategories.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 py-4">
                <CheckCircle2 className="w-4 h-4" /> No orphan categories detected.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {orphanCategories.map((c) => (
                  <Badge key={c.id} variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/maintenance">
          <Button variant="outline" size="sm" className="text-xs border-zinc-200 text-zinc-700">
            Open Standalone Maintenance Console <ExternalLink className="w-3 h-3 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
