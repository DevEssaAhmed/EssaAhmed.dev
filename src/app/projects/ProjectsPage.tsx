"use client";
import { Search, Video, ArrowRight, ArrowUpRight, Code2, ExternalLink } from "lucide-react";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { cleanMarkdownExcerpt } from "@/lib/clean-markdown";
import { OptimizedImage } from "@/components/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  featured?: boolean;
  demoUrl?: string | null;
  githubUrl?: string | null;
  demoVideoUrl?: string | null;
}

interface ProjectsPageProps {
  initialProjects?: ProjectItem[];
}

export default function ProjectsPage({ initialProjects = [] }: ProjectsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = useMemo(() => {
    const dynamic = Array.from(
      new Set(initialProjects.map((p) => p.category).filter(Boolean))
    );
    return ["All", ...dynamic];
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      const matchesCategory =
        selectedCategory === "All" ||
        project.category?.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        project.title?.toLowerCase().includes(q) ||
        project.description?.toLowerCase().includes(q) ||
        project.tags?.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [initialProjects, selectedCategory, searchTerm]);

  const flagshipProject = useMemo(
    () => filteredProjects.find((p) => p.featured) || filteredProjects[0],
    [filteredProjects]
  );

  const gridProjects = useMemo(
    () =>
      flagshipProject
        ? filteredProjects.filter((p) => p.id !== flagshipProject.id)
        : [],
    [filteredProjects, flagshipProject]
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-4 md:px-6 pt-12 pb-20">
        {/* SECTION 1: PAGE HERO & FILTER BAR */}
        <section className="pb-10">
          <div className="inline-flex items-center gap-2 border border-secondary/25 bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="tracking-wider uppercase text-[11px]">
              SELECTED WORK &amp; CASE STUDIES
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-display">
            Projects &amp; Case Studies
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg max-w-2xl leading-relaxed mb-8 font-body-lg">
            Analytics dashboards, workflow automation pipelines, and supply chain demand planning models.
          </p>

          {/* Filter & Search Bar Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full pt-2 pb-6 border-b border-outline-variant/20">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px] h-[18px] w-[18px]" />
              <input
                type="text"
                aria-label="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects by title, stack, or domain..."
                className="min-h-11 bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline w-full transition-all duration-150 outline-none"
              />
            </div>

            {/* Filter Pill Cluster */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedCategory(cat)}
                    className="relative min-h-11 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center justify-center"
                  >
                    {active && (
                      <motion.span
                        layoutId="activeProjectCategoryPill"
                        className="absolute inset-0 bg-on-surface rounded-full -z-10 shadow-xs"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span
                      className={
                        active
                          ? "text-surface font-semibold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }
                    >
                      {cat}
                    </span>
                    {!active && (
                      <span className="absolute inset-0 border border-outline-variant/30 rounded-full bg-surface-container-low hover:bg-surface-container-high -z-20 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + (searchTerm ? `_${searchTerm}` : "")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-12 text-center my-8">
            <p className="text-on-surface font-headline-sm mb-2">
              No matching projects found
            </p>
            <p className="text-on-surface-variant text-sm mb-6">
              Try clearing your search or selecting another category filter.
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="px-4 py-2 rounded-full bg-on-surface text-surface text-xs font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* SECTION 2: FEATURED FLAGSHIP CASE STUDY (Full-Width Bento Banner) */}
            {flagshipProject && (
              <section className="mb-12">
                <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-outline-variant/60 transition-all duration-300">
                  <div className="absolute -top-32 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left 6 Columns: Preview Image or Clean Summary Card */}
                    <Link
                      href={`/projects/${flagshipProject.id}`}
                      className="lg:col-span-6 block bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-inner relative"
                    >
                      {flagshipProject.image &&
                      !flagshipProject.image.includes("placeholder") ? (
                        <div className="aspect-[16/10] w-full relative overflow-hidden">
                          <OptimizedImage
                            src={flagshipProject.image}
                            alt={flagshipProject.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-code">
                            {flagshipProject.category && (
                              <span className="px-2.5 py-1 rounded bg-surface-container-low/90 border border-outline-variant/30 text-on-surface">
                                {flagshipProject.category}
                              </span>
                            )}
                            {flagshipProject.featured && (
                              <span className="px-2.5 py-1 rounded bg-secondary/15 border border-secondary/30 text-secondary">
                                ★ Featured
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 aspect-[16/10] flex flex-col justify-between">
                          <div className="flex items-center justify-between text-xs font-code">
                            <span className="text-primary font-medium">
                              {flagshipProject.category}
                            </span>
                            {flagshipProject.featured && (
                              <span className="text-secondary font-medium">
                                ★ Featured
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-display font-bold text-on-surface">
                            {flagshipProject.title}
                          </div>
                          <div className="text-xs font-code text-outline">
                            Case Study
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Right 6 Columns: Case Study Details */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        {flagshipProject.featured && (
                          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
                            Featured Case Study
                          </span>
                        )}
                        {flagshipProject.demoVideoUrl && (
                          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-code inline-flex items-center gap-1.5 font-medium">
                            <Video aria-hidden="true" className="text-[14px] h-3.5 w-3.5" />
                            <span>Video Walkthrough</span>
                          </span>
                        )}
                        {flagshipProject.category && (
                          <span className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant text-xs font-code">
                            {flagshipProject.category}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-on-surface tracking-tight">
                        <Link
                          href={`/projects/${flagshipProject.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {flagshipProject.title}
                        </Link>
                      </h2>
                      <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed line-clamp-3">
                        {cleanMarkdownExcerpt(flagshipProject.description, 220)}
                      </p>
                      {flagshipProject.tags && flagshipProject.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {flagshipProject.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/25 text-on-surface-variant text-label-sm font-code"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                          href={`/projects/${flagshipProject.id}`}
                          className="px-5 py-2.5 rounded-full bg-on-surface text-surface text-xs font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
                        >
                          <span>Read Case Study</span>
                          <ArrowRight aria-hidden="true" className="text-[16px] h-4 w-4" />
                        </Link>
                        {flagshipProject.demoUrl && (
                          <a
                            href={flagshipProject.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-medium hover:bg-surface-container-high transition-all inline-flex items-center gap-1.5"
                          >
                            <span>Live Demo</span>
                            <ArrowUpRight aria-hidden="true" className="text-[15px] h-[15px] w-[15px]" />
                          </a>
                        )}
                        {flagshipProject.githubUrl && (
                          <a
                            href={flagshipProject.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-medium hover:bg-surface-container-high transition-all inline-flex items-center gap-1.5"
                          >
                            <span>Source Code</span>
                            <Code2 aria-hidden="true" className="text-[15px] h-[15px] w-[15px]" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 3: 2-COLUMN PROJECT ARCHIVE BENTO GRID */}
            {gridProjects.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gridProjects.map((project) => {
                  const summary = cleanMarkdownExcerpt(project.description, 190);
                  return (
                    <div
                      key={project.id}
                      className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-outline-variant/70 transition-all group"
                    >
                      <div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="block w-full h-48 rounded-xl bg-surface-container-lowest border border-outline-variant/25 mb-6 overflow-hidden relative"
                        >
                          {project.image && !project.image.includes("placeholder") ? (
                            <OptimizedImage
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full p-5 flex flex-col justify-between font-code text-xs">
                              <div className="flex items-center justify-between text-on-surface-variant">
                                <span className="flex items-center gap-1.5 text-on-surface font-medium">
                                  <span className="w-2 h-2 rounded-full bg-primary" />
                                  {project.category}
                                </span>
                              </div>
                              <div className="text-on-surface-variant text-[11px] line-clamp-2">
                                {summary}
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-outline-variant/20">
                                <span>Case Study</span>
                              </div>
                            </div>
                          )}
                        </Link>

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-label-sm font-code text-primary">
                              {project.category}
                            </span>
                            {project.demoVideoUrl && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-code inline-flex items-center gap-1 font-medium">
                                <Video aria-hidden="true" className="text-[12px] h-3 w-3" />
                                <span>Video Demo</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-on-surface-variant hover:text-on-surface"
                                title="Live Demo"
                              >
                                <ExternalLink aria-hidden="true" className="text-[16px] h-4 w-4" />
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-on-surface-variant hover:text-on-surface"
                                title="GitHub Repository"
                              >
                                <Code2 aria-hidden="true" className="text-[16px] h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors">
                          <Link href={`/projects/${project.id}`}>
                            {project.title}
                          </Link>
                        </h3>
                        <p className="text-on-surface-variant font-body-md text-body-md mt-2 line-clamp-3 leading-relaxed">
                          {summary}
                        </p>
                      </div>

                      <div className="pt-6 mt-4 border-t border-outline-variant/20 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags &&
                            project.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/25 text-on-surface-variant text-label-sm font-code"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-xs font-semibold text-primary hover:underline shrink-0 flex items-center gap-1"
                        >
                          <span>View Case Study</span>
                          <ArrowRight aria-hidden="true" className="text-[15px] h-[15px] w-[15px]" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      <OptimizedFooter />
    </div>
  );
}
