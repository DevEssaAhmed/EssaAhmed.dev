"use client";
import { ArrowRight } from "lucide-react";

import { useMemo } from "react";
import Link from "next/link";
import { cleanMarkdownExcerpt } from "@/lib/clean-markdown";
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
  category?: string | null;
}

interface FeaturedWorkProps {
  initialProjects?: Project[];
  initialCategories?: string[];
}

function ProjectCardPreview({ project }: { project: Project }) {
  if (project.image_url && !project.image_url.includes("placeholder")) {
    return (
      <div className="w-full h-48 rounded-xl bg-surface-container-lowest border border-outline-variant/20 mb-6 relative overflow-hidden group/img">
        <OptimizedImage
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-code">
          {project.category && (
            <span className="px-2.5 py-0.5 rounded bg-surface-container-low/90 backdrop-blur-md border border-outline-variant/30 text-on-surface font-medium">
              {project.category}
            </span>
          )}
          <span className="text-secondary font-medium bg-surface-container-low/90 px-2 py-0.5 rounded border border-outline-variant/20 ml-auto">
            Case Study
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-48 rounded-xl bg-surface-container-low border border-outline-variant/30 p-5 mb-6 font-code text-xs relative overflow-hidden flex flex-col justify-between">
      <div className="flex justify-between items-center text-on-surface-variant">
        {project.category && (
          <span className="flex items-center gap-1.5 text-on-surface font-medium">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {project.category}
          </span>
        )}
        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30 text-[10px] ml-auto font-medium">
          Case Study
        </span>
      </div>
      <div className="text-on-surface font-display text-base font-semibold line-clamp-2">
        {project.title}
      </div>
      <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/20">
        <span>Engineering Analysis</span>
        <span className="text-primary font-medium">View Case Study →</span>
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
    <section className="max-w-[1080px] mx-auto py-12 px-6" id="projects">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-outline-variant/20 mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-headline-md font-bold text-on-surface tracking-tight">
            Selected Projects
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md mt-1">
            Case studies across workflow automation, supply chain demand planning, and analytics.
          </p>
        </div>
        <Link
          className="text-primary text-label-md font-label-md flex items-center gap-1 hover:underline shrink-0 font-semibold"
          href="/projects"
        >
          <span>View all projects</span>
          <ArrowRight aria-hidden="true" className="text-[16px] h-4 w-4" />
        </Link>
      </div>

      {/* 2x2 Grid of Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedProjects.map((project) => {
          const cleanSummary = cleanMarkdownExcerpt(project.description, 190);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-2xl bg-surface-container-lowest border border-outline-variant/40 p-6 flex flex-col justify-between hover:border-outline-variant/80 shadow-[0_4px_24px_-4px_rgba(28,25,23,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(28,25,23,0.1)] transition-all group block"
            >
              <div>
                <ProjectCardPreview project={project} />
                <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-on-surface-variant font-body-md text-body-md mt-2 line-clamp-3 leading-relaxed">
                  {cleanSummary}
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-outline-variant/20 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {project.tags &&
                    project.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/25 text-on-surface-variant text-label-sm font-code"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
                <span className="text-xs font-semibold text-primary group-hover:underline shrink-0 flex items-center gap-1 ml-auto">
                  <span>View Case Study</span>
                  <ArrowRight aria-hidden="true" className="text-[15px] h-[15px] w-[15px]" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
