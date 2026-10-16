"use client";

import Link from "next/link";
import { ArrowRight, FolderSearch } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";

type FeaturedProject = {
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
  featured?: boolean;
};

type FeaturedWorkProps = {
  projects?: FeaturedProject[];
  loadError?: boolean;
};

const FeaturedWork = ({ projects = [], loadError = false }: FeaturedWorkProps) => {
  // Prefer records marked featured, but never hide every project when the
  // editor hasn't marked one yet.
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects = (featuredProjects.length ? featuredProjects : projects).slice(0, 4);

  return (
    <section
      id="featured-work"
      className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-28 scroll-mt-24"
      aria-labelledby="featured-work-heading"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <div className="eyebrow mb-3">Selected work</div>
          <h2
            id="featured-work-heading"
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white"
          >
            Projects built around real operational problems.
          </h2>
          <p className="text-sm sm:text-base text-ink-soft mt-3 leading-relaxed">
            Manufacturing quality, business intelligence, and workflow automation work—loaded from the live portfolio records.
          </p>
        </div>

        <Link
          href="/projects"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border bg-surface-high text-foreground hover:text-champagne hover:border-champagne/40 transition-colors text-sm font-medium"
        >
          View all projects
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {visibleProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface-low px-6 py-12 sm:px-10 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-surface-high border border-border flex items-center justify-center">
            <FolderSearch className="w-5 h-5 text-champagne" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl font-semibold text-white">
            {loadError ? "Projects are temporarily unavailable" : "No projects published yet"}
          </h3>
          <p className="max-w-xl mx-auto mt-2 text-sm text-ink-soft leading-relaxed">
            {loadError
              ? "The project list could not be retrieved from the content database. Please try again shortly."
              : "Published projects will appear here when they are added to the portfolio."}
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-champagne hover:text-white transition-colors"
          >
            Open projects page
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
};

export default FeaturedWork;
