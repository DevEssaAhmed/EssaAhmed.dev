"use client";

import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import Link from "next/link";
import { Suspense, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  AtSign,
  Globe,
  Layers,
  Link as LinkIcon,
  Mail,
  Terminal,
  Users,
} from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import Reveal from "@/components/ui/reveal";
import FeaturedWork from "@/components/home/FeaturedWork";
import CapabilitiesSection from "@/components/home/CapabilitiesSection";

import dynamic from "next/dynamic";

const OptimizedContactForm = dynamic(() => import("@/components/OptimizedContactForm"), {
  loading: () => (
    <div className="rounded-2xl border border-border p-8 bg-surface-low">
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="h-10 w-full mb-3" />
      <Skeleton className="h-10 w-full" />
    </div>
  ),
});

interface IndexProps {
  initialProjects?: PortfolioProject[];
  projectsLoadError?: boolean;
}

type PortfolioProject = {
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
}

const Index = ({
  initialProjects = [],
  projectsLoadError = false,
}: IndexProps) => {
  const { profile } = useProfile();

  // Use live portfolio records instead of invented social-proof numbers.
  const kpis = useMemo(() => {
    const categories = new Set(
      initialProjects
        .map((project) => project.category?.trim())
        .filter((category) => Boolean(category) && category !== "Uncategorized")
    );
    const technologies = new Set(
      initialProjects.flatMap((project) =>
        Array.isArray(project.tags) ? project.tags : []
      )
    );

    return [
      {
        eyebrow: "Portfolio",
        icon: Layers,
        iconClass: "text-champagne-dim",
        value: String(initialProjects.length),
        title: "Recent projects",
        caption: "Records currently listed",
      },
      {
        eyebrow: "Domains",
        icon: Users,
        iconClass: "text-tertiary",
        value: String(categories.size),
        title: "Practice areas",
        caption: "Categories across this list",
      },
      {
        eyebrow: "Tools",
        icon: Terminal,
        iconClass: "text-blue-200",
        value: String(technologies.size),
        title: "Project technologies",
        caption: "Distinct project tags",
      },
    ];
  }, [initialProjects]);

  const email = profile?.email || "essaahmedsiddiqui@gmail.com";
  const location = profile?.location || "Karachi, Pakistan · Open to Worldwide Remote";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main id="main-content" role="main" aria-label="Main content" className="w-full pt-20 bg-background">
        <div className="flex flex-col w-full relative">
          {/* Editorial atmospheric gradient mesh */}
          <div className="absolute top-0 inset-x-0 h-[720px] pointer-events-none overflow-hidden -z-0" aria-hidden="true">
            <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-indigo-950/10 to-transparent blur-[140px]" />
            <div className="absolute top-[5%] right-[10%] w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#b89f72]/10 to-transparent blur-[160px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          {/* ══════════ HERO: EXECUTIVE EDITORIAL ══════════ */}
          <section
            className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-20 relative"
            aria-label="Hero section"
          >
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-high border border-border mb-10">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  <span className="font-mono text-[12px] tracking-wider uppercase text-ink-soft">
                    Available for analytics roles &amp; projects
                  </span>
                </div>
              </Reveal>

              <Reveal delay={60}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-champagne-dim">
                    Hi, I&apos;m {profile?.name || "Essa Ahmed"}
                  </span>
                  <span className="w-4 h-px bg-border" />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Analytics Engineer</span>
                </div>
              </Reveal>

              <Reveal delay={90}>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[62px] font-bold tracking-[-0.03em] leading-[1.12] text-foreground mb-8 max-w-4xl">
                  I engineer{" "}
                  <span className="text-white font-extrabold underline decoration-champagne/40 decoration-2 underline-offset-8">
                    decision systems
                  </span>
                  , focusing on data reliability and{" "}
                  <span className="bg-gradient-to-r from-champagne via-white to-blue-200 bg-clip-text text-transparent">
                    creating impact.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={120}>
                <p className="text-base sm:text-lg text-ink-soft max-w-2xl font-light leading-relaxed mb-12">
                  From raw data to dashboards and decision systems—built with accuracy, automation, and scale in mind.
                </p>
              </Reveal>

              <Reveal delay={160}>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/projects"
                    className="px-7 py-3.5 rounded-lg bg-champagne text-[#090c13] font-display text-sm font-semibold tracking-wide hover:bg-white transition-all shadow-[0_1px_20px_rgba(243,232,210,0.15)] flex items-center gap-2 group"
                  >
                    <span>View Case Studies</span>
                    <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#contact"
                    className="px-7 py-3.5 rounded-lg bg-surface-container border border-border text-foreground hover:border-champagne/40 text-sm font-medium tracking-wide transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-[18px] h-[18px] text-champagne-dim" />
                    <span>Contact</span>
                  </a>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ══════════ EXECUTIVE KPI STRIP ══════════ */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-28 relative" aria-label="Key metrics">
            <Reveal>
              <div className="rounded-2xl bg-surface-low border border-border grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border shadow-2xl backdrop-blur-sm">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.title} className="p-6 sm:p-8 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                          {kpi.eyebrow}
                        </span>
                        <Icon className={`w-[19px] h-[19px] ${kpi.iconClass}`} />
                      </div>
                      <div>
                        <div className="font-display text-4xl lg:text-[44px] font-bold text-white tracking-tight mb-2">
                          {kpi.value}
                        </div>
                        <div className="text-[14px] font-medium text-foreground">{kpi.title}</div>
                        {kpi.caption && (
                          <div className="text-[12px] text-ink-muted mt-1">{kpi.caption}</div>
                        )}
                        {kpi.badge && (
                          <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-0.5 rounded bg-surface-high border border-border font-mono text-[11px] text-champagne">
                            <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                            <span>{kpi.badge}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </section>

          {/* ══════════ FEATURED WORK ══════════ */}
          <FeaturedWork projects={initialProjects} loadError={projectsLoadError} />

          {/* ══════════ DECISION SYSTEMS ARCHITECTURE ══════════ */}
          <CapabilitiesSection />

          {/* ══════════ CONTACT ══════════ */}
          <section
            id="contact"
            className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-28 scroll-mt-24"
            aria-labelledby="contact-heading"
          >
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="eyebrow mb-3 justify-center">Engagement &amp; Inquiry</div>
                <h2
                  id="contact-heading"
                  className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white"
                >
                  Get In Touch
                </h2>
                <p className="text-sm sm:text-base text-ink-soft mt-2 font-light">
                  Have a project in mind or want to collaborate? I&apos;d love to hear from you!
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Consultation brief */}
              <div className="lg:col-span-5">
                <Reveal delay={60} className="h-full">
                  <div className="h-full p-8 lg:p-10 rounded-2xl bg-surface-low border border-border flex flex-col justify-between shadow-xl">
                    <div>
                      <h3 className="font-display text-xl lg:text-2xl font-bold text-white tracking-tight mb-4">
                        Let&apos;s Build Something Together
                      </h3>
                      <p className="text-[14px] text-ink-soft font-light leading-relaxed mb-8">
                        Whether it&apos;s a data pipeline, an analytics dashboard, or a full decision system — I&apos;m here
                        to help turn your data into impact.
                      </p>

                      <div className="flex flex-col gap-4">
                        <a
                          href={`mailto:${email}`}
                          className="flex items-center gap-4 p-4 rounded-xl bg-surface-container border border-border hover:border-champagne/30 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-surface-high flex items-center justify-center text-champagne group-hover:bg-champagne group-hover:text-[#090c13] transition-colors">
                            <AtSign className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider">Direct Email</span>
                            <span className="font-display text-sm text-white truncate mt-0.5">{email}</span>
                          </div>
                        </a>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container border border-border">
                          <div className="w-10 h-10 rounded-lg bg-surface-high flex items-center justify-center text-tertiary">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider">Location</span>
                            <span className="font-display text-sm text-white mt-0.5">{location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {profile?.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-surface-container border border-border text-ink-soft hover:text-white transition-colors flex items-center gap-1.5 font-mono text-xs"
                          >
                            <LinkIcon className="w-[15px] h-[15px]" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {profile?.github_url && (
                          <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-surface-container border border-border text-ink-soft hover:text-white transition-colors flex items-center gap-1.5 font-mono text-xs"
                          >
                            <Terminal className="w-[15px] h-[15px]" />
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>
                      <span className="font-mono text-[12px] text-tertiary flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                        <span>Online</span>
                      </span>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Project brief form */}
              <div className="lg:col-span-7">
                <Reveal delay={120} className="h-full">
                  <Suspense
                    fallback={
                      <div className="rounded-2xl border border-border p-8 bg-surface-low">
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <Skeleton className="h-10 w-full mb-3" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    }
                  >
                    <OptimizedContactForm />
                  </Suspense>
                </Reveal>
              </div>
            </div>
          </section>
        </div>
      </main>

      <OptimizedFooter />
    </div>
  );
};

export default Index;
