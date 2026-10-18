"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type DiaryEntry = Database["public"]["Tables"]["diary_entries"]["Row"];
type ViewMode = "year" | "timeline";

const PAGE_SIZE = 10;

interface DiaryPageProps {
  initialEntries?: DiaryEntry[];
  initialViewMode?: ViewMode;
  initialYear?: number | "all" | null;
}

function formatReadableDate(isoDate: string): string {
  try {
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export default function DiaryPage({
  initialEntries = [],
  initialViewMode = "year",
  initialYear = "all",
}: DiaryPageProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>(initialEntries);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(initialEntries.length >= PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [selectedYear, setSelectedYear] = useState<number | "all">(initialYear ?? "all");
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState<number>(0);

  const hasHydratedRef = useRef<boolean>(false);

  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(entries.map((entry) => new Date(`${entry.entry_date}T00:00:00`).getFullYear()))
    ).sort((a, b) => b - a);
    return years;
  }, [entries]);

  const fetchEntries = useCallback(
    async (pageIndex: number, append: boolean) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        let query = supabase
          .from("diary_entries")
          .select("*")
          .eq("is_published", true)
          .order("entry_date", { ascending: false })
          .order("created_at", { ascending: false })
          .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);

        if (selectedYear !== "all") {
          const startDate = `${selectedYear}-01-01`;
          const endDate = `${selectedYear}-12-31`;
          query = query.gte("entry_date", startDate).lte("entry_date", endDate);
        }

        const { data, error } = await query;
        if (error) throw error;

        const nextRows = data || [];
        setHasMore(nextRows.length === PAGE_SIZE);
        setEntries((prev) => (append ? [...prev, ...nextRows] : nextRows));
      } catch {
        // Keep current entries on transient error
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedYear]
  );

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      if (initialEntries.length > 0) return;
    }
    setPage(0);
    fetchEntries(0, false);
  }, [fetchEntries, initialEntries.length]);

  const groupedByYear = useMemo(() => {
    const map = new Map<number, DiaryEntry[]>();
    entries.forEach((entry) => {
      const year = new Date(`${entry.entry_date}T00:00:00`).getFullYear();
      const list = map.get(year) || [];
      list.push(entry);
      map.set(year, list);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [entries]);

  const toggleExpanded = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-12 pb-20">
        {/* SECTION 1: HERO & CONTROLS */}
        <section className="pb-10 border-b border-outline-variant/20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-secondary text-label-sm font-label-sm uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Personal Log · Field Notes</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-on-surface mb-3">
                Personal Diary &amp; Field Notes
              </h1>
              <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl leading-relaxed">
                Unfiltered notes on engineering systems, supply chain architecture lessons, travel reflections, and continuous learning.
              </p>
            </div>

            {user && (
              <Link
                href="/admin/diary/new"
                className="px-4 py-2.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-code hover:bg-primary/25 transition-colors self-start md:self-end shrink-0"
              >
                + New Diary Entry →
              </Link>
            )}
          </div>

          {/* Filter & View Mode Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
            {/* Year Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                aria-pressed={selectedYear === "all"}
                onClick={() => setSelectedYear("all")}
                className={
                  selectedYear === "all"
                    ? "min-h-11 px-3.5 py-1.5 rounded-full bg-on-surface text-surface text-xs font-semibold transition-all"
                    : "min-h-11 px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs transition-all"
                }
              >
                All Years ({entries.length})
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  aria-pressed={selectedYear === yr}
                  onClick={() => setSelectedYear(yr)}
                  className={
                    selectedYear === yr
                      ? "min-h-11 px-3.5 py-1.5 rounded-full bg-on-surface text-surface text-xs font-semibold transition-all"
                      : "min-h-11 px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs transition-all"
                  }
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <button
                type="button"
                aria-pressed={viewMode === "year"}
                onClick={() => setViewMode("year")}
                className={`min-h-11 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "year"
                    ? "bg-surface-container-high text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                By Year
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "timeline"}
                onClick={() => setViewMode("timeline")}
                className={`min-h-11 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "timeline"
                    ? "bg-surface-container-high text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Timeline View
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: DIARY ENTRIES */}
        <section className="pt-10">
          {loading ? (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-surface-container-low border border-outline-variant/20 animate-pulse"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-12 text-center">
              <p className="text-on-surface font-headline-sm mb-1">No diary entries published yet</p>
              <p className="text-on-surface-variant text-sm">
                Field notes and personal reflections will appear here once published.
              </p>
            </div>
          ) : viewMode === "year" ? (
            <div className="space-y-12">
              {groupedByYear.map(([year, yearEntries]) => (
                <div key={year} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-display font-bold text-on-surface">{year}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-code text-on-surface-variant">
                      {yearEntries.length} {yearEntries.length === 1 ? "entry" : "entries"}
                    </span>
                    <div className="flex-1 h-px bg-outline-variant/20" />
                  </div>

                  <div className="space-y-4">
                    {yearEntries.map((entry) => {
                      const isExpanded = Boolean(expandedMap[entry.id]);
                      const wordCount = (entry.content || "").trim().split(/\s+/).filter(Boolean).length;
                      const readMins = Math.max(1, Math.ceil(wordCount / 200));

                      return (
                        <article
                          key={entry.id}
                          className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 sm:p-8 hover:border-outline-variant/60 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5 text-xs font-code">
                              <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/25 text-primary font-semibold">
                                {formatReadableDate(entry.entry_date)}
                              </span>
                              {(entry as any).topic_tag && (
                                <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface-variant">
                                  {(entry as any).topic_tag}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs font-code text-outline">
                              <span>{readMins} min read</span>
                              {user && (
                                <Link
                                  href={`/admin/diary/edit/${entry.id}`}
                                  className="text-primary hover:underline"
                                >
                                  Edit →
                                </Link>
                              )}
                            </div>
                          </div>

                          <h2 className="text-xl sm:text-2xl font-display font-bold text-on-surface tracking-tight mb-3">
                            {entry.title || formatReadableDate(entry.entry_date)}
                          </h2>

                          {entry.image_url && (
                            <div className="my-4 rounded-xl overflow-hidden border border-outline-variant/30 max-h-80">
                              <img
                                src={entry.image_url}
                                alt={entry.image_alt || entry.title || "Diary photo"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}

                          <div
                            className={`text-on-surface-variant font-body-lg text-body-lg leading-relaxed whitespace-pre-line ${
                              !isExpanded && (entry.content || "").length > 360 ? "line-clamp-4" : ""
                            }`}
                          >
                            {entry.content}
                          </div>

                          {(entry.content || "").length > 360 && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(entry.id)}
                              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              <span>{isExpanded ? "Show less" : "Read full entry"}</span>
                              <span className="material-symbols-outlined text-[15px]">
                                {isExpanded ? "expand_less" : "expand_more"}
                              </span>
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l border-outline-variant/30 space-y-8">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="relative rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 sm:p-8"
                >
                  <span className="absolute -left-[31px] sm:-left-[39px] top-7 w-3.5 h-3.5 rounded-full bg-secondary ring-4 ring-surface" />
                  <div className="flex items-center justify-between gap-2 text-xs font-code text-outline mb-2">
                    <span className="text-secondary font-semibold">
                      {formatReadableDate(entry.entry_date)}
                    </span>
                    {user && (
                      <Link
                        href={`/admin/diary/edit/${entry.id}`}
                        className="text-primary hover:underline"
                      >
                        Edit →
                      </Link>
                    )}
                  </div>
                  <h2 className="text-xl font-display font-bold text-on-surface mb-2">
                    {entry.title || formatReadableDate(entry.entry_date)}
                  </h2>
                  <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed whitespace-pre-line">
                    {entry.content}
                  </p>
                </article>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="pt-8 text-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchEntries(next, true);
                }}
                className="px-6 py-2.5 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface transition-all"
              >
                {loadingMore ? "Loading..." : "Load Older Entries"}
              </button>
            </div>
          )}
        </section>
      </main>

      <OptimizedFooter />
    </div>
  );
}
