"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookHeart,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
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
import { filterAndSortDiary, type DiarySortOption } from "@/lib/admin-helpers";

interface DiaryDirectoryTabProps {
  diaryEntries: any[];
  onTogglePublish: (entry: any) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onBatchPublish?: (ids: string[], isPublished: boolean) => Promise<void>;
  onBatchDelete?: (ids: string[]) => Promise<void>;
}

export const DiaryDirectoryTab: React.FC<DiaryDirectoryTabProps> = ({
  diaryEntries,
  onTogglePublish,
  onDeleteEntry,
  onBatchPublish,
  onBatchDelete,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<DiarySortOption>("date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchBusy, setBatchBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    | { mode: "single"; entry: any }
    | { mode: "batch"; ids: string[] }
    | null
  >(null);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    for (const e of diaryEntries) {
      const y = String(e.entry_date || "").slice(0, 4);
      if (/^\d{4}$/.test(y)) years.add(y);
    }
    return ["All", ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [diaryEntries]);

  const availableTopics = useMemo(() => {
    const topics = new Set<string>();
    for (const e of diaryEntries) {
      if (e.topic_tag && String(e.topic_tag).trim()) {
        topics.add(String(e.topic_tag).trim());
      }
    }
    return Array.from(topics).sort();
  }, [diaryEntries]);

  const filteredEntries = useMemo(
    () =>
      filterAndSortDiary(diaryEntries, {
        selectedYear,
        statusFilter,
        topicFilter,
        searchQuery,
        sortBy,
      }),
    [diaryEntries, selectedYear, statusFilter, topicFilter, searchQuery, sortBy]
  );

  const visibleSelectedIds = useMemo(
    () => filteredEntries.filter((e) => selectedIds.has(e.id)).map((e) => e.id),
    [filteredEntries, selectedIds]
  );

  const allVisibleSelected =
    filteredEntries.length > 0 && visibleSelectedIds.length === filteredEntries.length;

  const toggleSelectAll = () => {
    if (allVisibleSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredEntries.map((e) => e.id)));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggle = async (entry: any) => {
    setTogglingId(entry.id);
    try {
      await onTogglePublish(entry);
    } finally {
      setTogglingId(null);
    }
  };

  const handleBatchPublishClick = async (isPublished: boolean) => {
    if (!onBatchPublish || visibleSelectedIds.length === 0) return;
    setBatchBusy(true);
    try {
      await onBatchPublish(visibleSelectedIds, isPublished);
      setSelectedIds(new Set());
    } finally {
      setBatchBusy(false);
    }
  };

  const hasActiveFilters =
    selectedYear !== "All" ||
    statusFilter !== "all" ||
    topicFilter !== "all" ||
    searchQuery.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Filters & Controls */}
      <Card className="bg-white border-zinc-200/80 shadow-2xs rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                {(["all", "published", "draft"] as const).map((status) => (
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
                    {status === "all" ? "All Entries" : status}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
                      selectedYear === yr
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-zinc-500">
                {filteredEntries.length} / {diaryEntries.length} entries
              </span>
              <Link href="/admin/diary/new">
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg h-8 text-xs shadow-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Diary Entry
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, excerpt, body text, or topic..."
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

            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-full md:w-[190px] bg-white border-zinc-200 text-zinc-900 rounded-lg h-9 text-xs">
                <SelectValue placeholder="Topic Tag" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                <SelectItem value="all">All Topic Tags</SelectItem>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as DiarySortOption)}>
              <SelectTrigger className="w-full md:w-[175px] bg-white border-zinc-200 text-zinc-900 rounded-lg h-9 text-xs">
                <SelectValue placeholder="Sort entries" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                <SelectItem value="date_desc">Newest Entry Date</SelectItem>
                <SelectItem value="date_asc">Oldest Entry Date</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedYear("All");
                  setStatusFilter("all");
                  setTopicFilter("all");
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
            {onBatchPublish && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={batchBusy}
                  onClick={() => void handleBatchPublishClick(true)}
                  className="h-7 text-xs bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/20"
                >
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={batchBusy}
                  onClick={() => void handleBatchPublishClick(false)}
                  className="h-7 text-xs bg-white/10 text-zinc-100 hover:bg-white/20"
                >
                  Set Draft
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

      {/* Diary Entries Table */}
      <Card className="bg-white border-zinc-200/80 shadow-2xs rounded-2xl overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
              <BookHeart className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-800">No diary entries match these filters</p>
            <div className="pt-1 flex items-center justify-center gap-2">
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedYear("All");
                    setStatusFilter("all");
                    setTopicFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/admin/diary/new">
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Diary Entry
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
                      aria-label="Select all visible diary entries"
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Entry</th>
                  <th className="py-3 px-4 font-semibold">Topic Tag</th>
                  <th className="py-3 px-4 font-semibold">Visibility</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {filteredEntries.map((entry) => {
                  const isChecked = selectedIds.has(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isChecked ? "bg-amber-50/40" : "hover:bg-zinc-50/80"
                      }`}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(entry.id)}
                          aria-label={`Select ${entry.title || "diary entry"}`}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs text-zinc-500 whitespace-nowrap">
                        {entry.entry_date || "—"}
                      </td>

                      <td className="py-3.5 px-4 max-w-[380px]">
                        <Link
                          href={`/admin/diary/edit/${entry.id}`}
                          className="font-medium text-zinc-900 hover:text-indigo-600 line-clamp-1"
                        >
                          {entry.title || "Untitled Entry"}
                        </Link>
                        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                          {entry.excerpt || String(entry.content || "").slice(0, 120) || "No content yet"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {entry.topic_tag ? (
                          <Badge
                            variant="outline"
                            className="text-[11px] bg-amber-50 text-amber-800 border-amber-200 font-normal"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {entry.topic_tag}
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={togglingId === entry.id}
                          onClick={() => void handleToggle(entry)}
                          className={`h-7 px-2.5 text-xs rounded-lg ${
                            entry.is_published
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                          }`}
                        >
                          {togglingId === entry.id && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          {entry.is_published ? "Published" : "Draft"}
                        </Button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-0.5">
                          {entry.is_published && (
                            <Link href="/diary" target="_blank" title="View Diary Stream">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-lg"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}

                          <Link href={`/admin/diary/edit/${entry.id}`} title="Edit Entry">
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
                            title="Delete Entry"
                            onClick={() => setDeleteTarget({ mode: "single", entry })}
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
                ? `Delete ${deleteTarget.ids.length} selected diary entry(s)?`
                : "Delete diary entry?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              {deleteTarget?.mode === "batch"
                ? "These diary entries will be permanently removed."
                : `“${deleteTarget?.entry?.title || "Untitled Entry"}” will be permanently deleted.`}
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
                  await onDeleteEntry(current.entry.id);
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
