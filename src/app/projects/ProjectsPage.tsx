"use client";

import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FolderSearch, Search, X, Layers, Database, Sparkles } from "lucide-react";

type ProjectItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  demoUrl?: string;
  githubUrl?: string;
  views: number;
  likes: number;
  comments: number;
};

type ProjectsPageProps = {
  initialProjects?: ProjectItem[];
};

const ProjectsPage = ({ initialProjects = [] }: ProjectsPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Derive all unique categories from projects
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialProjects.forEach((p) => {
      if (p.category && p.category.trim() && p.category !== "Uncategorized") {
        cats.add(p.category.trim());
      }
    });
    return ["All", ...Array.from(cats).sort()];
  }, [initialProjects]);

  // Filter projects by category and search query
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = p.title?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q));
      const catMatch = p.category?.toLowerCase().includes(q);

      return Boolean(titleMatch || descMatch || tagMatch || catMatch);
    });
  }, [initialProjects, selectedCategory, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategory !== "All";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-foreground selection:bg-champagne/20 selection:text-champagne relative">
      <Navigation />

      {/* Ambient background spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-hero-spotlight pointer-events-none opacity-40"
        aria-hidden="true"
      />

      <div className="pt-24 lg:pt-28 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          {/* Executive Header */}
          <header className="mb-12 pb-8 border-b border-border/80">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-border font-mono text-[11px] uppercase tracking-wider text-champagne">
                <Sparkles className="w-3.5 h-3.5 text-champagne" aria-hidden="true" />
                Case Studies &amp; Data Systems
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-low border border-border font-mono text-[11px] text-ink-muted">
                <Database className="w-3.5 h-3.5 text-metric" aria-hidden="true" />
                Audited Production Deployments
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
              Featured Projects &amp; Architectures
            </h1>
            <p className="text-base sm:text-lg text-ink-soft max-w-3xl font-light leading-relaxed">
              High-throughput data engineering pipelines, manufacturing quality assurance suites, automated rejection tracking, and executive telemetry dashboards built for enterprise operations.
            </p>

            {/* Quick Metrics Strip */}
            <div className="mt-6 pt-6 border-t border-border/40 flex flex-wrap items-center gap-6 text-xs font-mono text-ink-muted">
              <div>
                <span className="text-white font-semibold">{initialProjects.length}</span> Published Studies
              </div>
              <div className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
              <div>
                <span className="text-white font-semibold">{categories.length > 1 ? categories.length - 1 : 1}</span> Technical Disciplines
              </div>
              <div className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
              <div>
                <span className="text-tertiary font-semibold">100%</span> Telemetry Verified
              </div>
            </div>
          </header>

          {initialProjects.length > 0 ? (
            <div>
              {/* Search and Category Filter Toolbar */}
              <div className="mb-10 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  {/* Category Filter Tabs */}
                  <div
                    className="inline-flex flex-wrap p-1.5 rounded-2xl bg-surface-low border border-border gap-1.5"
                    role="tablist"
                    aria-label="Filter case studies by category"
                  >
                    {categories.map((category) => {
                      const isActive = selectedCategory === category;
                      return (
                        <button
                          key={category}
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setSelectedCategory(category)}
                          className={`font-mono text-xs px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-champagne text-[#090c13] font-semibold shadow-soft"
                              : "text-ink-soft hover:text-white hover:bg-surface-high font-normal"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Input Box */}
                  <div className="relative w-full md:w-80">
                    <div className="relative flex items-center">
                      <Search
                        className="absolute left-3.5 w-4 h-4 text-ink-muted pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects, tags..."
                        aria-label="Search projects by title, description, or tags"
                        className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-low border border-border text-sm text-platinum placeholder:text-ink-muted focus:outline-none focus:border-champagne/60 transition-colors font-sans"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search query"
                          className="absolute right-3 text-ink-muted hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter Results Summary */}
                <div className="flex items-center justify-between text-xs font-mono text-ink-muted px-1">
                  <span>
                    Showing <strong className="text-white font-medium">{filteredProjects.length}</strong> of{" "}
                    <strong className="text-white font-medium">{initialProjects.length}</strong> case studies
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-champagne hover:underline transition-all"
                    >
                      Clear active filters
                    </button>
                  )}
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                  {filteredProjects.map((p) => (
                    <ProjectCard key={p.id} {...p} />
                  ))}
                </div>
              ) : (
                /* No search/filter match empty state */
                <div className="w-full relative overflow-hidden rounded-3xl border border-border bg-surface-low p-12 text-center shadow-xl my-8">
                  <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                    <div className="w-20 h-20 mb-5 rounded-2xl bg-surface-high border border-border flex items-center justify-center">
                      <FolderSearch className="w-9 h-9 text-champagne" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-2xl font-bold tracking-tight text-white mb-2">
                      No matching case studies
                    </h3>
                    <p className="text-sm text-ink-soft leading-relaxed mb-6 font-light">
                      No projects matched your query &ldquo;{searchQuery}&rdquo; within the &ldquo;{selectedCategory}&rdquo; category.
                    </p>
                    <Button
                      onClick={handleResetFilters}
                      className="bg-champagne hover:bg-white text-[#090c13] font-semibold rounded-xl px-6 h-11 transition-all"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Database has 0 projects empty state */
            <div className="w-full relative overflow-hidden rounded-3xl border border-border bg-surface-low p-12 lg:p-16 text-center shadow-xl my-8">
              <div className="absolute inset-0 bg-gradient-to-b from-champagne/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center justify-center max-w-lg mx-auto">
                <div className="w-24 h-24 mb-6 rounded-full bg-champagne/10 border border-champagne/20 flex items-center justify-center ring-8 ring-champagne/5">
                  <FolderSearch className="w-10 h-10 text-champagne" aria-hidden="true" />
                </div>
                <h3 className="font-display text-3xl font-bold text-white tracking-tight mb-3">
                  Projects in Production
                </h3>
                <p className="text-base text-ink-soft max-w-md mx-auto mb-8 font-light leading-relaxed">
                  High-impact analytics and engineering case studies are being actively staged. Explore technical articles and architecture breakdowns in the meantime.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    asChild
                    className="bg-champagne hover:bg-white text-[#090c13] font-semibold transition-all duration-300 rounded-xl px-8 h-12 shadow-soft"
                  >
                    <Link href="/articles">Read Latest Articles</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="bg-surface-high border border-border text-platinum hover:bg-surface-highest hover:text-white rounded-xl px-8 h-12 transition-all duration-300"
                  >
                    <Link href="/">Back to Home</Link>
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

export default ProjectsPage;
