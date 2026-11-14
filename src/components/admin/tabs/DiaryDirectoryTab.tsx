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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { filterAndSortDiary, type DiarySortOption } from "@/lib/admin-helpers";

interface DiaryDirectoryTabProps {
  diaryEntries: any[];
  onTogglePublish: (entry: any) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export const DiaryDirectoryTab: React.FC<DiaryDirectoryTabProps> = ({
  diaryEntries,
  onTogglePublish,
  onDeleteEntry,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<DiarySortOption>("date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const handleToggle = async (entry: any) => {
    setTogglingId(entry.id);
    try {
      await onTogglePublish(entry);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Controls */}
      <Card className="bg-white border-zinc-200/90 shadow-2xs">
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
                    className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
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
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
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
                className="pl-9 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-full md:w-[190px] bg-white border-zinc-300 text-zinc-900">
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
              <SelectTrigger className="w-full md:w-[175px] bg-white border-zinc-300 text-zinc-900">
                <SelectValue placeholder="Sort entries" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                <SelectItem value="date_desc">Newest Entry Date</SelectItem>
                <SelectItem value="date_asc">Oldest Entry Date</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Diary Entries Table */}
      <Card className="bg-white border-zinc-200/90 shadow-2xs overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <BookHeart className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-sm font-medium text-zinc-700">No diary entries match these filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Entry</th>
                  <th className="py-3 px-4 font-semibold">Topic Tag</th>
                  <th className="py-3 px-4 font-semibold">Visibility</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-500 whitespace-nowrap">
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
                        className={`h-7 px-2.5 text-xs ${
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
                      <div className="inline-flex items-center gap-1">
                        {entry.is_published && (
                          <Link href="/diary" target="_blank" title="View Diary Stream">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}

                        <Link href={`/admin/diary/edit/${entry.id}`} title="Edit Entry">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-600 hover:text-zinc-900"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Delete Entry"
                              className="h-8 w-8 text-zinc-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete diary entry?</AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-500">
                                &ldquo;{entry.title}&rdquo; will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => void onDeleteEntry(entry.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white"
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
      </Card>
    </div>
  );
};
