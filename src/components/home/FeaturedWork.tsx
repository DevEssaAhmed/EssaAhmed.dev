"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cleanMarkdownExcerpt, formatDisplayTag } from "@/lib/clean-markdown";
import { OptimizedImage } from "@/components/OptimizedImage";

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  tags: string[];
  featured: boolean;
  demo_url?: string;
  github_url?: string;
  category?: string;
  categories?: {
    name: string;
  };
}

interface FeaturedWorkProps {
  initialProjects?: Project[];
  initialCategories?: string[];
}

function getCategoryName(project: Project): string | undefined {
  return (
    (project.category && project.category !== "Uncategorized"
      ? project.category
      : undefined) || project.categories?.name
  );
}

function ProjectCardPreview({
  project,
  categoryName,
}: {
  project: Project;
  categoryName?: string;
}) {
  if (project.image_url && !project.image_url.includes("placeholder")) {
    return (
      <div className="aspect-[16/10] w-full rounded-xl bg-surface-container-low dark:bg-surface-container border border-outline-variant/45 dark:border-outline-variant/30 pt-3 px-3 pb-0 mb-5 overflow-hidden relative flex flex-col">
        <div className="w-full h-full rounded-t-lg overflow-hidden border border-b-0 border-outline-variant/45 dark:border-outline-variant/30 bg-surface-container-lowest shadow-sm">
          <OptimizedImage
            src={project.image_url}
            alt={project.title}
            sizes="(max-width: 768px) 100vw, 540px"
            className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[16/10] w-full rounded-xl bg-surface-container-low dark:bg-surface-container border border-outline-variant/45 dark:border-outline-variant/30 p-5 mb-5 relative overflow-hidden flex flex-col justify-between bg-grid-pattern">
      <div className="flex items-center justify-between text-[11px] font-code text-outline">
        <span>{categoryName || "Engineering"}</span>
        <span>Case Study</span>
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

export default function FeaturedWork({ initialProjects = [] }: FeaturedWorkProps) {
  const displayedProjects = useMemo(() => {
    if (!initialProjects || initialProjects.length === 0) return [];
    const featured = initialProjects.filter((p) => p.featured);
    const nonFeatured = initialProjects.filter((p) => !p.featured);
    return [...featured, ...nonFeatured].slice(0, 4);
  }, [initialProjects]);

  if (displayedProjects.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1080px] mx-auto py-16 md:py-20 px-6" id="projects">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-outline-variant/30 mb-10 gap-4">
        <div>
          <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
            01 / SELECTED WORK
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-on-surface tracking-tight">
            Selected Projects
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md mt-1.5">
            Case studies across workflow automation, supply chain demand planning, and analytics.
          </p>
        </div>
        <Link
          className="text-primary text-label-md font-label-md flex items-center gap-1.5 hover:underline shrink-0 font-semibold rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          href="/projects"
        >
          <span>View all projects</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Equal 2x2 Grid of Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {displayedProjects.map((project, index) => {
          const categoryName = getCategoryName(project);
          const indexLabel = String(index + 1).padStart(2, "0");
          const cleanSummary = cleanMarkdownExcerpt(
            project.description,
            175,
            project.title
          );
          const rawTags = Array.isArray(project.tags) ? project.tags : [];
          const formattedTags = rawTags
            .map((tag) => formatDisplayTag(tag))
            .filter(Boolean);
          const visibleTags = formattedTags.slice(0, 3);
          const overflowCount = Math.max(0, formattedTags.length - 3);

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-2xl card-elevated card-interactive border p-6 flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <div>
                <ProjectCardPreview project={project} categoryName={categoryName} />
                <div className="flex items-center gap-2 mb-2 text-[11px] font-code">
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
                </div>
                <h3 className="text-headline-sm font-display font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-on-surface-variant font-body-md text-body-md mt-2 line-clamp-3 leading-relaxed">
                  {cleanSummary}
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
                <span className="text-xs font-semibold text-on-surface group-hover:text-primary shrink-0 inline-flex items-center gap-1 ml-auto transition-colors">
                  <span>Case study</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
