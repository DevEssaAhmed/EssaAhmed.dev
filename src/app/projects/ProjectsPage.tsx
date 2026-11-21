"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { cleanMarkdownExcerpt, formatDisplayTag } from "@/lib/clean-markdown";
import { OptimizedImage } from "@/components/OptimizedImage";
import { m, AnimatePresence } from "framer-motion";
import { Search, PlayCircle, ArrowRight, ExternalLink, Code2 } from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image: string;
  image_url?: string | null;
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

function ProjectPreviewBezel({
  project,
  priority = false,
  sizes,
}: {
  project: ProjectItem;
  priority?: boolean;
  sizes: string;
}) {
  const imageSrc = project.image || project.image_url;
  const hasImage = Boolean(imageSrc && !imageSrc.includes("placeholder"));

  if (hasImage && imageSrc) {
    return (
      <div className="aspect-[16/10] w-full rounded-xl bg-surface-container-low dark:bg-surface-container border border-outline-variant/45 dark:border-outline-variant/30 pt-3 px-3 pb-0 overflow-hidden relative flex flex-col">
        <div className="w-full h-full rounded-t-lg overflow-hidden border border-b-0 border-outline-variant/45 dark:border-outline-variant/30 bg-surface-container-lowest shadow-sm">
          <OptimizedImage
            src={imageSrc}
            alt={project.title}
            className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[16/10] w-full rounded-xl bg-surface-container-low dark:bg-surface-container border border-outline-variant/45 dark:border-outline-variant/30 p-5 relative overflow-hidden flex flex-col justify-between bg-grid-pattern">
      <div className="flex items-center justify-between text-[11px] font-code text-outline">
        <span>{project.category || "Engineering"}</span>
        <span>{project.featured ? "Featured Case Study" : "Case Study"}</span>
      </div>
      <div className="text-on-surface font-display text-base font-semibold line-clamp-2">
        {project.title}
      </div>
      <div className="pt-2 border-t border-outline-variant/30 text-[11px] font-code text-on-surface-variant">
        Architecture &amp; Outcome Record
      </div>
    </div>
  );
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
      const safeTags = Array.isArray(project.tags) ? project.tags : [];
      const matchesSearch =
        !q ||
        project.title?.toLowerCase().includes(q) ||
        project.description?.toLowerCase().includes(q) ||
        safeTags.some((t) => t.toLowerCase().includes(q));
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

  const flagshipFormattedTags = useMemo(() => {
    const rawTags = Array.isArray(flagshipProject?.tags)
      ? flagshipProject.tags
      : flagshipProject?.tags || [];
    return rawTags.map((tag) => formatDisplayTag(tag)).filter(Boolean);
  }, [flagshipProject]);

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-6 py-12 md:py-16">
        {/* SECTION 1: PAGE HERO & FILTER BAR */}
        <section className="pb-8 border-b border-outline-variant/30 mb-10">
          <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
            01 / PROJECTS
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-display">
            Projects &amp; Case Studies
          </h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl leading-relaxed mb-8">
            Analytics dashboards, workflow automation pipelines, and supply chain demand planning models.
          </p>

          {/* Filter & Search Bar Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full pt-2">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-4 h-4 pointer-events-none" />
              <input
                type="text"
                aria-label="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects by title, stack, or domain..."
                className="min-h-11 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/55 dark:border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline w-full transition-all duration-150 outline-none shadow-sm"
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
                      <m.span
                        layoutId="activeProjectCategoryPill"
                        className="absolute inset-0 bg-on-surface rounded-full -z-10 shadow-sm"
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
          <m.div
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
              <section className="mb-10">
                <div className="rounded-2xl card-elevated card-interactive border p-6 md:p-8 relative overflow-hidden group">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left 6 Columns: Unified Matte Presentation Bezel */}
                    <Link
                      href={`/projects/${flagshipProject.id}`}
                      className="lg:col-span-6 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-xl"
                    >
                      <ProjectPreviewBezel
                        project={flagshipProject}
                        priority
                        sizes="(max-width: 1024px) 100vw, 540px"
                      />
                    </Link>

                    {/* Right 6 Columns: Case Study Details */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-code">
                        {flagshipProject.featured && (
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary font-semibold uppercase tracking-wider">
                            Featured Case Study
                          </span>
                        )}
                        {flagshipProject.category && flagshipProject.category !== "Uncategorized" && (
                          <span className="uppercase tracking-wider text-primary font-medium">
                            {flagshipProject.category}
                          </span>
                        )}
                        {flagshipProject.demoVideoUrl && (
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary inline-flex items-center gap-1.5 font-medium">
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Video Walkthrough</span>
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
                        {cleanMarkdownExcerpt(
                          flagshipProject.description,
                          220,
                          flagshipProject.title
                        )}
                      </p>
                      {flagshipFormattedTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {flagshipFormattedTags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/40 dark:border-outline-variant/25 text-on-surface-variant text-label-sm font-code"
                            >
                              {tag}
                            </span>
                          ))}
                          {flagshipFormattedTags.length > 4 && (
                            <span className="px-2 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/35 text-outline text-label-sm font-code">
                              +{flagshipFormattedTags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                          href={`/projects/${flagshipProject.id}`}
                          className="px-5 py-2.5 rounded-full bg-on-surface text-surface text-xs font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
                        >
                          <span>Read Case Study</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        {flagshipProject.demoUrl && (
                          <a
                            href={flagshipProject.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-medium hover:bg-surface-container-high transition-all inline-flex items-center gap-1.5"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3.5 h-3.5" />
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
                            <Code2 className="w-3.5 h-3.5" />
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
              <section className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {gridProjects.map((project, index) => {
                  const summary = cleanMarkdownExcerpt(
                    project.description,
                    190,
                    project.title
                  );
                  const indexLabel = String(index + 2).padStart(2, "0");
                  const rawTags = Array.isArray(project.tags) ? project.tags : [];
                  const formattedTags = rawTags
                    .map((tag) => formatDisplayTag(tag))
                    .filter(Boolean);
                  const visibleTags = formattedTags.slice(0, 3);
                  const overflowCount = Math.max(0, formattedTags.length - 3);
                  const categoryName =
                    project.category && project.category !== "Uncategorized"
                      ? project.category
                      : undefined;

                  return (
                    <div
                      key={project.id}
                      className="rounded-2xl card-elevated card-interactive border p-6 flex flex-col justify-between group"
                    >
                      <div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="block mb-5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        >
                          <ProjectPreviewBezel
                            project={project}
                            sizes="(max-width: 768px) 100vw, 540px"
                          />
                        </Link>

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-[11px] font-code">
                            <span className="text-outline font-medium">{indexLabel}</span>
                            {categoryName && (
                              <>
                                <span className="text-outline-variant" aria-hidden="true">
                                  ·
                                </span>
                                <span className="uppercase tracking-wider text-primary font-medium">
                                  {categoryName}
                                </span>
                              </>
                            )}
                            {project.demoVideoUrl && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-code inline-flex items-center gap-1 font-medium">
                                <PlayCircle className="w-3 h-3" />
                                <span>Video</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Live Demo"
                                title="Live Demo"
                                className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline transition-all"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub Repository"
                                title="GitHub Repository"
                                className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline transition-all"
                              >
                                <Code2 className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        <h3 className="text-headline-sm font-display font-semibold text-on-surface group-hover:text-primary transition-colors">
                          <Link href={`/projects/${project.id}`}>
                            {project.title}
                          </Link>
                        </h3>
                        <p className="text-on-surface-variant font-body-md text-body-md mt-2 line-clamp-3 leading-relaxed">
                          {summary}
                        </p>
                      </div>

                      <div className="pt-5 mt-5 border-t border-outline-variant/30 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          {visibleTags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/40 dark:border-outline-variant/25 text-on-surface-variant text-label-sm font-code"
                            >
                              {tag}
                            </span>
                          ))}
                          {overflowCount > 0 && (
                            <span className="px-2 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/35 text-outline text-label-sm font-code">
                              +{overflowCount}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-xs font-semibold text-on-surface group-hover:text-primary shrink-0 inline-flex items-center gap-1 ml-auto transition-colors"
                        >
                          <span>Case study</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </>
        )}
          </m.div>
        </AnimatePresence>
      </main>

      <OptimizedFooter />
    </div>
  );
}
