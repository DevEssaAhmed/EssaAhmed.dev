"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Search, TrendingUp, Hash, BookOpen, Flame } from "lucide-react";
import OptimizedFooter from "@/components/OptimizedFooter";
import ArticlesSubNav from "@/components/ArticlesSubNav";

interface TagInfo {
  name: string;
  slug: string;
  count: number;
  articleCount: number;
  trending?: boolean;
}

type TagsPageProps = {
  initialTags?: TagInfo[];
};

const getTagSize = (count: number, max: number) => {
  const ratio = max > 0 ? count / max : 0;
  if (ratio > 0.75) return "text-xl font-bold";
  if (ratio > 0.5) return "text-lg font-semibold";
  if (ratio > 0.25) return "text-base font-medium";
  return "text-sm font-normal";
};

const TagsPage = ({ initialTags = [] }: TagsPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "trending">("all");
  const tags = initialTags;

  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, tags]
  );
  const trendingTags = useMemo(() => filteredTags.filter((tag) => tag.trending), [filteredTags]);
  const displayTags = activeFilter === "trending" ? trendingTags : filteredTags;
  const maxCount = filteredTags.length > 0 ? filteredTags[0].count : 1;

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between transition-colors duration-200">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-6 py-12 md:py-16 flex-1">
        <div className="mb-10 pb-8 border-b border-outline-variant/30">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="font-code text-xs uppercase tracking-[0.14em] text-outline">
              01 / TAGS
            </span>
            <span className="text-outline-variant" aria-hidden="true">
              ·
            </span>
            <span className="font-code text-xs text-primary">
              {tags.length} {tags.length === 1 ? "Topic" : "Topics"}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            Browse by Tag
          </h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl leading-relaxed">
            Explore articles by topic, from analytics and machine learning to systems and tooling.
          </p>
          <ArticlesSubNav className="mt-8 mb-0 justify-start" />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl mb-10 animate-fade-up">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-surface-container-lowest dark:bg-surface-container-low border-outline-variant/55 dark:border-outline-variant/30 text-on-surface placeholder:text-outline focus-visible:outline-none focus-visible:border-primary/60 font-code text-sm shadow-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilter("trending")}
              className={`rounded-xl h-11 px-4 gap-2 transition-all font-code text-xs ${
                activeFilter === "trending"
                  ? "bg-on-surface text-surface font-semibold hover:opacity-90"
                  : "bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:border-primary/40"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Trending
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilter("all")}
              className={`rounded-xl h-11 px-4 gap-2 transition-all font-code text-xs ${
                activeFilter === "all"
                  ? "bg-on-surface text-surface font-semibold hover:opacity-90"
                  : "bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:border-primary/40"
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              All
            </Button>
          </div>
        </div>

        {displayTags.length > 0 ? (
          <div className="flex flex-wrap gap-3 justify-start animate-fade-up" style={{ animationDelay: "200ms" }}>
            {displayTags.map((tag) => (
              <Link key={tag.slug} href={`/articles/tags/${tag.slug}`}>
                <div className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/40 dark:border-outline-variant/30 bg-surface-container-low dark:bg-surface-container text-on-surface hover:border-primary/40 hover:bg-surface-container-high transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                  <Hash className="w-3 h-3 text-primary/70 shrink-0" />
                  <span className={`text-on-surface group-hover:text-primary transition-colors ${getTagSize(tag.count, maxCount)}`}>
                    {tag.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-1 text-[10px] px-1.5 py-0 h-4 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30 font-code"
                  >
                    {tag.count}
                  </Badge>
                  {tag.trending && <TrendingUp className="w-3 h-3 text-primary shrink-0" />}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="w-full relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low p-16 text-center shadow-sm">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 mb-6 rounded-2xl bg-surface-container border border-primary/30 flex items-center justify-center mx-auto">
                <Tag className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-on-surface mb-3">
                {searchTerm
                  ? "No Tags Found"
                  : activeFilter === "trending" && tags.length > 0
                  ? "No Trending Tags Yet"
                  : "No Tags Yet"}
              </h3>
              <p className="text-base text-on-surface-variant max-w-lg mx-auto mb-8">
                {searchTerm
                  ? `No tags match "${searchTerm}". Try a different search term.`
                  : activeFilter === "trending" && tags.length > 0
                  ? "No topics have 3 or more published articles yet. Browse all available tags instead."
                  : "Tags will appear here once articles are published."}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm("")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full px-8 h-12 transition-all duration-200"
                  >
                    Clear Search
                  </Button>
                )}
                {!searchTerm && activeFilter === "trending" && tags.length > 0 && (
                  <Button
                    onClick={() => setActiveFilter("all")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full px-8 h-12 transition-all duration-200"
                  >
                    Show All Tags ({tags.length})
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-8 h-12 border border-outline-variant/30 bg-surface-container text-on-surface hover:bg-surface-container-high transition-all duration-200"
                >
                  <Link href="/articles">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read Articles
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <OptimizedFooter />
    </div>
  );
};

export default TagsPage;
