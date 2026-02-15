"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "@/components/OptimizedImage";

type DiaryEntry = {
  id: string;
  entry_date: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  image_alt: string | null;
  is_published: boolean;
  created_at: string;
};

type DiaryPageProps = {
  initialEntries?: DiaryEntry[];
};

const PAGE_SIZE = 20;

const formatEntryDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatMonthYear = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

const toPreview = (entry: DiaryEntry): string => {
  if (entry.excerpt && entry.excerpt.trim()) return entry.excerpt.trim();
  const trimmed = entry.content.trim();
  if (trimmed.length <= 280) return trimmed;
  return `${trimmed.slice(0, 280).trim()}...`;
};

const DiaryPage = ({ initialEntries = [] }: DiaryPageProps) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(initialEntries);
  const [offset, setOffset] = useState(initialEntries.length);
  const [hasMore, setHasMore] = useState(initialEntries.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(initialEntries.length === 0);
  const seenIds = useRef(new Set(initialEntries.map((entry) => entry.id)));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialEntries.length > 0) return;

    const loadInitial = async () => {
      setInitialLoading(true);
      try {
        const { data, error } = await supabase
          .from("diary_entries")
          .select("*")
          .eq("is_published", true)
          .order("entry_date", { ascending: false })
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1);

        if (error) throw error;
        const rows = (data || []) as DiaryEntry[];
        seenIds.current = new Set(rows.map((row) => row.id));
        setEntries(rows);
        setOffset(rows.length);
        setHasMore(rows.length === PAGE_SIZE);
      } catch (error) {
        console.error("Failed to load diary entries:", error);
        setEntries([]);
        setHasMore(false);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitial();
  }, [initialEntries.length]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("is_published", true)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      const rows = (data || []) as DiaryEntry[];
      const deduped = rows.filter((row) => !seenIds.current.has(row.id));

      deduped.forEach((row) => seenIds.current.add(row.id));
      setEntries((prev) => [...prev, ...deduped]);
      setOffset((prev) => prev + rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Failed to load more diary entries:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, offset]);

  useEffect(() => {
    if (!hasMore || initialLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entriesList) => {
        const target = entriesList[0];
        if (target.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, initialLoading, loadMore]);

  const timeline = useMemo(() => {
    return entries.map((entry, index) => {
      const previous = entries[index - 1];
      const currentDate = new Date(entry.entry_date);
      const prevDate = previous ? new Date(previous.entry_date) : null;

      const shouldShowYear =
        !previous || currentDate.getFullYear() !== prevDate?.getFullYear();

      const shouldShowMonth =
        !previous ||
        currentDate.getFullYear() !== prevDate?.getFullYear() ||
        currentDate.getMonth() !== prevDate?.getMonth();

      return { entry, shouldShowYear, shouldShowMonth };
    });
  }, [entries]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navigation />

      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
      </div>

      <main className="pt-24 pb-16 relative">
        <div className="max-w-4xl mx-auto px-6">
          <header className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Private Writing, Publicly Shared
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Diary
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A running timeline of moments, lessons, and experiments from real life.
            </p>
          </header>

          {initialLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border-border/60">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-4 w-44 rounded bg-muted" />
                    <div className="h-6 w-3/5 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center">
                <p className="text-muted-foreground">
                  No diary entries yet. Add entries from your admin panel.
                </p>
              </CardContent>
            </Card>
          ) : (
            <section className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-1/2" />

              <div className="space-y-4">
                {timeline.map(({ entry, shouldShowYear, shouldShowMonth }, index) => {
                  const alignedRight = index % 2 === 0;
                  const preview = toPreview(entry);
                  const fullContent = entry.content.trim();
                  const isExpanded = !!expanded[entry.id];
                  const hasExpandableContent = fullContent.length > preview.length;
                  const displayedContent = isExpanded || !hasExpandableContent ? fullContent : preview;

                  return (
                    <div key={entry.id} className="relative">
                      {shouldShowYear && (
                        <div className="sticky top-20 z-10 w-fit ml-0 md:mx-auto mb-4">
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-primary text-primary-foreground shadow-soft">
                            {new Date(entry.entry_date).getFullYear()}
                          </span>
                        </div>
                      )}

                      {shouldShowMonth && (
                        <div className="mb-4 ml-10 md:ml-0 md:text-center">
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-muted text-muted-foreground">
                            {formatMonthYear(entry.entry_date)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`relative pl-10 md:pl-0 ${
                          alignedRight ? "md:ml-auto md:w-[48%]" : "md:mr-auto md:w-[48%]"
                        }`}
                      >
                        <div
                          className={`absolute top-7 w-3 h-3 rounded-full bg-primary ring-4 ring-background ${
                            alignedRight
                              ? "left-3 md:left-[-1.65rem]"
                              : "left-3 md:left-auto md:right-[-1.65rem]"
                          }`}
                        />

                        <Card className="group border-border/60 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 bg-card/95 backdrop-blur-sm overflow-hidden">
                          <CardContent className="p-0">
                            <div className="h-1 w-full bg-gradient-primary" />
                            <div className="p-6">
                              <div className="inline-flex items-center text-xs text-muted-foreground mb-3">
                                <CalendarDays className="w-3 h-3 mr-1" />
                                {formatEntryDate(entry.entry_date)}
                              </div>
                              <h2 className="text-xl font-semibold mb-2">{entry.title}</h2>

                              <div className="flex items-start gap-4">
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line flex-1">
                                  {displayedContent}
                                </p>
                                {entry.image_url && (
                                  <div className="hidden sm:block shrink-0">
                                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-border rotate-[-2deg] group-hover:rotate-0 transition-transform duration-300">
                                      <OptimizedImage
                                        src={entry.image_url}
                                        alt={entry.image_alt || entry.title}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {entry.image_url && (
                                <div className="sm:hidden mt-4">
                                  <div className="w-full h-40 rounded-xl overflow-hidden border border-border">
                                    <OptimizedImage
                                      src={entry.image_url}
                                      alt={entry.image_alt || entry.title}
                                      width={640}
                                      height={320}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              )}

                              {hasExpandableContent && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpanded(entry.id)}
                                  className="mt-3 h-auto px-0 text-primary hover:text-primary"
                                >
                                  {isExpanded ? "Show less" : "Read more"}
                                  <ChevronDown
                                    className={`w-4 h-4 ml-1 transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div ref={sentinelRef} className="py-8 flex justify-center">
                  {loadingMore ? (
                    <div className="inline-flex items-center text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading more entries...
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Scroll to load more</span>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DiaryPage;
