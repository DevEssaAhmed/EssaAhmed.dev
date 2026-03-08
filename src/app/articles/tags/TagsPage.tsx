"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Search, TrendingUp, Hash, BookOpen, Flame } from "lucide-react";
import Footer from "@/components/Footer";
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

const TAG_COLORS = [
  "from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-500/60 hover:from-violet-500/30 hover:to-purple-500/30",
  "from-sky-500/20 to-blue-500/20 border-sky-500/30 hover:border-sky-500/60 hover:from-sky-500/30 hover:to-blue-500/30",
  "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-500/60 hover:from-emerald-500/30 hover:to-teal-500/30",
  "from-rose-500/20 to-pink-500/20 border-rose-500/30 hover:border-rose-500/60 hover:from-rose-500/30 hover:to-pink-500/30",
  "from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-500/60 hover:from-amber-500/30 hover:to-orange-500/30",
  "from-cyan-500/20 to-indigo-500/20 border-cyan-500/30 hover:border-cyan-500/60 hover:from-cyan-500/30 hover:to-indigo-500/30",
];

const getTagColor = (index: number) => TAG_COLORS[index % TAG_COLORS.length];

const getTagSize = (count: number, max: number) => {
  const ratio = max > 0 ? count / max : 0;
  if (ratio > 0.75) return "text-xl font-bold";
  if (ratio > 0.5) return "text-lg font-semibold";
  if (ratio > 0.25) return "text-base font-medium";
  return "text-sm font-normal";
};

const TagsPage = ({ initialTags = [] }: TagsPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "trending">("trending");
  const tags = initialTags;

  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, tags]
  );
  const trendingTags = useMemo(() => filteredTags.filter((tag) => tag.trending), [filteredTags]);
  const displayTags = activeFilter === "trending" ? trendingTags : filteredTags;
  const maxCount = filteredTags.length > 0 ? filteredTags[0].count : 1;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Tag className="w-3.5 h-3.5" />
              <span>{tags.length} Topics</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Browse by Tag
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Explore articles by topic, from analytics and machine learning to systems and tooling.
            </p>
          </div>

          <div className="mb-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <ArticlesSubNav />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-card/50 border-border/60 focus:border-primary/40"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant={activeFilter === "trending" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("trending")}
                className={`rounded-full h-11 px-4 gap-2 transition-all ${activeFilter === "trending" ? "bg-gradient-primary hover:shadow-glow" : "hover:border-primary/40"}`}
              >
                <Flame className="w-3.5 h-3.5" />
                Trending
              </Button>
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className={`rounded-full h-11 px-4 gap-2 transition-all ${activeFilter === "all" ? "bg-gradient-primary hover:shadow-glow" : "hover:border-primary/40"}`}
              >
                <Hash className="w-3.5 h-3.5" />
                All
              </Button>
            </div>
          </div>

          {displayTags.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center animate-fade-up" style={{ animationDelay: "200ms" }}>
              {displayTags.map((tag, index) => (
                <Link key={tag.slug} href={`/articles/tags/${tag.slug}`}>
                  <div className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-gradient-to-r backdrop-blur-sm transition-all duration-300 cursor-pointer hover:shadow-soft hover:-translate-y-0.5 ${getTagColor(index)}`}>
                    <Hash className="w-3 h-3 text-foreground/60 shrink-0" />
                    <span className={`text-foreground/90 group-hover:text-foreground transition-colors ${getTagSize(tag.count, maxCount)}`}>
                      {tag.name}
                    </span>
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 rounded-full bg-foreground/10 text-foreground/70 font-normal">
                      {tag.count}
                    </Badge>
                    {tag.trending && <TrendingUp className="w-3 h-3 text-amber-500 shrink-0" />}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="w-full relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 p-16 text-center shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
                  <Tag className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight mb-3">
                  {searchTerm ? "No Tags Found" : "No Tags Yet"}
                </h3>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
                  {searchTerm
                    ? `No tags match "${searchTerm}". Try a different search term.`
                    : "Tags will appear here once articles are published."}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {searchTerm && (
                    <Button onClick={() => setSearchTerm("")} className="bg-gradient-primary hover:shadow-glow transition-all duration-300 rounded-xl px-8 h-12">
                      Clear Search
                    </Button>
                  )}
                  <Button asChild variant="outline" className="rounded-xl px-8 h-12 hover:bg-muted transition-all duration-300">
                    <Link href="/articles"><BookOpen className="w-4 h-4 mr-2" />Read Articles</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TagsPage;

