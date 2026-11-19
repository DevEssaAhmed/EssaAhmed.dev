"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
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
import { filterAndSortArticles, type ArticleSortOption } from "@/lib/admin-helpers";
import { extractArticleExternalMeta } from "@/data/externalArticlesStore";

interface ArticlesDirectoryTabProps {
  posts: any[];
  categories: any[];
  isLoading?: boolean;
  onImportExternal: (url: string) => Promise<boolean>;
  onUpdateStatus: (post: any, mode: "published" | "draft" | "unlisted") => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onBatchUpdateStatus?: (ids: string[], mode: "published" | "draft" | "unlisted") => Promise<void>;
  onBatchDelete?: (ids: string[]) => Promise<void>;
}

function getPostStatusMode(post: any): "published" | "draft" | "unlisted" {
  if (post?.published && post?.unlisted) return "unlisted";
  if (post?.published) return "published";
  return "draft";
}

export const ArticlesDirectoryTab: React.FC<ArticlesDirectoryTabProps> = ({
  posts,
  categories,
  onImportExternal,
  onUpdateStatus,
  onDeletePost,
  onBatchUpdateStatus,
  onBatchDelete,
}) => {
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const [sourceFilter, setSourceFilter] = useState<"all" | "onsite" | "external">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "unlisted">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<ArticleSortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchBusy, setBatchBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    | { mode: "single"; post: any }
    | { mode: "batch"; ids: string[] }
    | null
  >(null);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories || []) {
      if (c?.id && c?.name) map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  const filteredPosts = useMemo(
    () =>
      filterAndSortArticles(posts, {
        sourceFilter,
        statusFilter,
        categoryFilter,
        searchQuery,
        sortBy,
        extractExternalMeta: extractArticleExternalMeta,
      }),
    [posts, sourceFilter, statusFilter, categoryFilter, searchQuery, sortBy]
  );

  const visibleSelectedIds = useMemo(
    () => filteredPosts.filter((p) => selectedIds.has(p.id)).map((p) => p.id),
    [filteredPosts, selectedIds]
  );

  const allVisibleSelected =
    filteredPosts.length > 0 && visibleSelectedIds.length === filteredPosts.length;

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map((p) => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = importUrl.trim();
    if (!cleaned) {
      toast.error("Please paste an article URL first.");
      return;
    }
    setIsImporting(true);
    try {
      const ok = await onImportExternal(cleaned);
      if (ok) setImportUrl("");
    } finally {
      setIsImporting(false);
    }
  };

  const handleStatusChange = async (post: any, mode: "published" | "draft" | "unlisted") => {
    setUpdatingId(post.id);
    try {
      await onUpdateStatus(post, mode);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBatchStatus = async (mode: "published" | "draft" | "unlisted") => {
    if (!onBatchUpdateStatus || visibleSelectedIds.length === 0) return;
    setBatchBusy(true);
    try {
      await onBatchUpdateStatus(visibleSelectedIds, mode);
      setSelectedIds(new Set());
    } finally {
      setBatchBusy(false);
    }
  };

  const handleCopyUrl = async (post: any) => {
    const meta = extractArticleExternalMeta(post);
    const targetUrl =
      meta.isExternal && meta.externalUrl
        ? meta.externalUrl
        : `${window.location.origin}/articles/${post.slug}`;

    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedId(post.id);
      toast.success("Article URL copied to clipboard");
      setTimeout(() => setCopiedId((prev) => (prev === post.id ? null : prev)), 1500);
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const hasActiveFilters =
    sourceFilter !== "all" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    searchQuery.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* 1-Click External Article Importer */}
      <Card className="bg-white border-zinc-200/80 shadow-2xs rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                  <Link2 className="w-3.5 h-3.5 text-sky-600" />
                </span>
                1-Click External Article Importer
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 mt-1">
                Paste any Medium, Substack, dev.to, Hashnode, Kaggle, or LinkedIn URL to auto-extract metadata and publish.
              </CardDescription>
            </div>
            <Link href="/admin/blog/new">
              <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg h-8 text-xs shadow-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Write On-Site Article
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleImportSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <Input
              type="url"
              placeholder="https://medium.com/@you/your-article-slug..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              disabled={isImporting}
              className="flex-1 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-9 text-sm"
            />
            <Button
              type="submit"
              disabled={isImporting || !importUrl.trim()}
              className="bg-sky-600 hover:bg-sky-700 text-white shrink-0 rounded-lg h-9 text-xs font-medium"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Import &amp; Publish
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card className="bg-white border-zinc-200/80 shadow-2xs rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                {(["all", "onsite", "external"] as const).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSourceFilter(src)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      sourceFilter === src
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {src === "all" ? "All Sources" : src === "onsite" ? "On-Site" : "External"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                {(["all", "published", "draft", "unlisted"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                      statusFilter === status
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {status === "all" ? "All Status" : status}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-zinc-500">
              {filteredPosts.length} / {posts.length} articles
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, excerpt, slug, or platform..."
                className="pl-9 pr-8 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-9 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[190px] bg-white border-zinc-200 text-zinc-900 rounded-lg h-9 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as ArticleSortOption)}>
              <SelectTrigger className="w-full md:w-[170px] bg-white border-zinc-200 text-zinc-900 rounded-lg h-9 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="reading_time">Longest Read</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSourceFilter("all");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs text-zinc-600 hover:text-zinc-900 h-9 rounded-lg"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch Action Bar */}
      {visibleSelectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-zinc-900 text-white shadow-lg">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-white/15">
              {visibleSelectedIds.length} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-zinc-300 hover:text-white underline-offset-2 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {onBatchUpdateStatus && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={batchBusy}
                  onClick={() => void handleBatchStatus("published")}
                  className="h-7 text-xs bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/20"
                >
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={batchBusy}
                  onClick={() => void handleBatchStatus("draft")}
                  className="h-7 text-xs bg-white/10 text-zinc-100 hover:bg-white/20"
                >
                  Set Draft
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={batchBusy}
                  onClick={() => void handleBatchStatus("unlisted")}
                  className="h-7 text-xs bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border border-purple-400/20"
                >
                  Unlist
                </Button>
              </>
            )}
            {onBatchDelete && (
              <Button
                size="sm"
                variant="destructive"
                disabled={batchBusy}
                onClick={() => setDeleteTarget({ mode: "batch", ids: visibleSelectedIds })}
                className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Directory Table */}
      <Card className="bg-white border-zinc-200/80 shadow-2xs rounded-2xl overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-800">No articles match these filters</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try clearing active filters or write a new on-site article.
            </p>
            <div className="pt-1 flex items-center justify-center gap-2">
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSourceFilter("all");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/admin/blog/new">
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Article
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  <th className="py-3 pl-4 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all visible articles"
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 font-semibold">Article</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Category &amp; Metrics</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {filteredPosts.map((post) => {
                  const meta = extractArticleExternalMeta(post);
                  const mode = getPostStatusMode(post);
                  const isChecked = selectedIds.has(post.id);
                  const categoryName =
                    post.categories?.name ||
                    (post.category_id && categoryMap.get(post.category_id)) ||
                    "Uncategorized";
                  const liveHref =
                    meta.isExternal && meta.externalUrl
                      ? meta.externalUrl
                      : `/articles/${post.slug}`;

                  return (
                    <tr
                      key={post.id}
                      className={`group transition-colors ${
                        isChecked ? "bg-sky-50/50" : "hover:bg-zinc-50/80"
                      }`}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(post.id)}
                          aria-label={`Select ${post.title || "article"}`}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-3 max-w-[380px]">
                        <div className="flex items-start gap-3">
                          {post.image_url ? (
                            <div className="w-12 h-9 rounded-lg overflow-hidden border border-zinc-200/90 shrink-0 mt-0.5 bg-zinc-100">
                              <OptimizedImage
                                src={post.image_url}
                                alt={post.title || "Article thumbnail"}
                                width={96}
                                height={72}
                                sizes="48px"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-9 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center shrink-0 mt-0.5">
                              {meta.isExternal ? (
                                <Globe className="w-4 h-4 text-sky-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-zinc-400" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link
                                href={`/admin/blog/edit/${post.id}`}
                                className="font-medium text-zinc-900 hover:text-indigo-600 line-clamp-1"
                              >
                                {post.title || "Untitled Article"}
                              </Link>
                              {meta.isExternal && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 border-sky-200"
                                >
                                  {meta.platform || "External"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                              {post.excerpt || (meta.isExternal ? meta.externalUrl : `/${post.slug}`)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Select
                            value={mode}
                            disabled={updatingId === post.id}
                            onValueChange={(val) =>
                              void handleStatusChange(post, val as "published" | "draft" | "unlisted")
                            }
                          >
                            <SelectTrigger
                              className={`h-7 w-[124px] text-xs font-medium border rounded-lg ${
                                mode === "published"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : mode === "unlisted"
                                  ? "bg-purple-50 border-purple-200 text-purple-700"
                                  : "bg-zinc-100 border-zinc-200 text-zinc-700"
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="unlisted">Unlisted</SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingId === post.id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className="text-[11px] bg-zinc-50 text-zinc-700 border-zinc-200 font-normal"
                          >
                            {categoryName}
                          </Badge>
                          <div className="text-[11px] font-mono text-zinc-400">
                            {post.reading_time || 5}m read · {Number(post.views || 0).toLocaleString()} views
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-0.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => void handleCopyUrl(post)}
                            title="Copy URL"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-lg"
                          >
                            {copiedId === post.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          {(post.published || meta.isExternal) && (
                            <a
                              href={liveHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Live"
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-lg"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}

                          <Link href={`/admin/blog/edit/${post.id}`} title="Edit Article">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-zinc-600 hover:text-zinc-900 rounded-lg"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </Link>

                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete Article"
                            onClick={() => setDeleteTarget({ mode: "single", post })}
                            className="h-8 w-8 text-zinc-400 hover:text-rose-600 rounded-lg"
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

      {/* Shared Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.mode === "batch"
                ? `Delete ${deleteTarget.ids.length} selected article(s)?`
                : "Delete this article?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              {deleteTarget?.mode === "batch"
                ? "These articles will be permanently removed from your portfolio."
                : `“${deleteTarget?.post?.title || "Untitled Article"}” will be permanently deleted from your portfolio.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteTarget) return;
                const current = deleteTarget;
                setDeleteTarget(null);
                if (current.mode === "single") {
                  await onDeletePost(current.post.id);
                } else if (onBatchDelete) {
                  setBatchBusy(true);
                  try {
                    await onBatchDelete(current.ids);
                    setSelectedIds(new Set());
                  } finally {
                    setBatchBusy(false);
                  }
                }
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
