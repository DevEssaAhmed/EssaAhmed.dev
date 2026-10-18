"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import FeaturedWork from "@/components/home/FeaturedWork";
import CapabilitiesSection from "@/components/home/CapabilitiesSection";
import { useProfile } from "@/contexts/ProfileContext";
import { extractArticleExternalMeta } from "@/data/externalArticlesStore";

interface IndexProps {
  initialProjects?: any[];
  initialProjectCategories?: string[];
  initialArticles?: any[];
}

const Index = ({
  initialProjects = [],
  initialProjectCategories = [],
  initialArticles = [],
}: IndexProps) => {
  const { profile } = useProfile();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const email = profile?.email || "essaahmedsiddiqui@gmail.com";
  const githubUrl = profile?.github_url || "https://github.com/DevEssaAhmed";
  const linkedinUrl = profile?.linkedin_url || "https://www.linkedin.com/in/essa-ahmed";

  // Strictly use real published articles from Supabase (hide section if 0 published articles)
  const publishedArticles = (initialArticles || []).slice(0, 3);

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased relative min-h-screen selection:bg-amber-100 selection:text-amber-900 dark:selection:bg-primary dark:selection:text-on-primary overflow-x-hidden transition-colors duration-200">
      {/* Background Ambient Spotlight Glow (Warm Amber & Cobalt in Light Mode, Luminous Cones in Dark Mode) */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.08),_rgba(37,99,235,0.04)_40%,_transparent_75%)] dark:hidden -z-10" />
      <div className="hidden dark:block fixed top-[-100px] left-[-100px] w-[550px] h-[550px] rounded-full bg-primary/10 blur-[130px] pointer-events-none -z-10" />
      <div className="hidden dark:block fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[140px] pointer-events-none -z-10" />

      {/* 1. TOP NAVIGATION BAR */}
      <Navigation />

      <main id="main-content" tabIndex={-1} className="w-full">
        {/* 2. HERO SECTION */}
        <section
          className="max-w-[1080px] mx-auto pt-16 pb-14 px-6 text-left flex flex-col items-start gap-6"
          id="home"
        >
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 text-secondary text-label-sm font-label-sm tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span>Available for new projects &amp; consulting</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-on-surface font-headline-lg text-4xl sm:text-5xl lg:text-[52px] leading-[1.15] tracking-tight font-extrabold max-w-4xl">
            Hey, I&apos;m {profile?.name || "Essa Ahmed"}. I build automation workflows, supply chain demand models &amp; analytics systems.
          </h1>

          {/* 2-Line Subtitle */}
          <p className="text-on-surface-variant font-body-lg text-body-lg max-w-3xl leading-relaxed">
            Bridging supply chain operations, end-to-end process automation, and decision analytics—turning complex operational data into self-running workflows and clear forecasts.
          </p>

          {/* Domain Focus Pills (3 Equal Pillars) */}
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-md">
              <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
              <span>⚡ Process &amp; Workflow Automation</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-md">
              <span className="material-symbols-outlined text-secondary text-[18px]">inventory_2</span>
              <span>📦 Supply Chain &amp; Demand Planning</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-md">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">query_stats</span>
              <span>📊 Executive Analytics &amp; BI</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            {initialProjects.length > 0 && (
              <a
                className="text-surface bg-on-surface font-label-md text-label-md font-semibold px-6 py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
                href="#projects"
              >
                <span>Explore Work</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            )}
            <a
              className="bg-surface-container border border-outline-variant/40 text-on-surface font-label-md text-label-md px-6 py-3 rounded-full hover:bg-surface-container-high active:scale-[0.98] transition-all"
              href="#contact"
            >
              Contact Me
            </a>
            <div className="flex items-center gap-2.5 ml-1">
              <a
                aria-label="GitHub"
                className="w-11 h-11 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline transition-all"
                href={githubUrl}
                rel="noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
              </a>
              <a
                aria-label="LinkedIn"
                className="w-11 h-11 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline transition-all"
                href={linkedinUrl}
                rel="noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[18px]">work</span>
              </a>
              <a
                aria-label="Email"
                className="w-11 h-11 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline transition-all"
                href={`mailto:${email}`}
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3. SELECTED PROJECTS (Automatically hidden if 0 projects in Supabase) */}
        <FeaturedWork
          initialProjects={initialProjects}
          initialCategories={initialProjectCategories}
        />

        {/* 4. CORE CAPABILITIES & TECH STACK (3 Equal Pillars - NO FAKE METRICS) */}
        <CapabilitiesSection />

        {/* 5. LATEST WRITING (Dynamically hidden when 0 published articles in Supabase) */}
        {publishedArticles.length > 0 && (
          <section className="max-w-[1080px] mx-auto py-12 px-6" id="articles">
            <div className="flex items-center justify-between pb-8 border-b border-outline-variant/20 mb-8">
              <div>
                <h2 className="text-2xl font-headline-md font-bold text-on-surface tracking-tight">
                  Latest Writing
                </h2>
                <p className="text-on-surface-variant font-body-md text-body-md mt-1">
                  Notes on supply chain forecasting, pipeline automation, and executive dashboards.
                </p>
              </div>
              <Link
                className="text-primary text-label-md font-label-md flex items-center gap-1 hover:underline"
                href="/articles"
              >
                <span>Read all articles</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publishedArticles.map((article) => {
                const extMeta = extractArticleExternalMeta(article);
                const isExternal = extMeta.isExternal && Boolean(extMeta.externalUrl);
                const platform = extMeta.platform || "On Site";
                const href = isExternal
                  ? extMeta.externalUrl!
                  : `/articles/${encodeURIComponent(article.slug || article.id)}`;
                const formattedDate = article.created_at
                  ? new Date(article.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Recent";

                const badgeClass =
                  platform === "Medium"
                    ? "bg-secondary/10 border-secondary/30 text-secondary"
                    : platform === "dev.to"
                    ? "bg-tertiary-container/20 border-tertiary-container/40 text-tertiary"
                    : "bg-primary/10 border-primary/30 text-primary";

                const cardInner = (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-2.5 py-1 rounded-full border text-label-sm font-label-sm font-semibold ${badgeClass}`}
                        >
                          {isExternal ? `${platform} ↗` : "On Site"}
                        </span>
                        {article.reading_time ? (
                          <span className="text-on-surface-variant text-label-sm font-code">
                            {article.reading_time} min read
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-on-surface-variant font-body-md text-body-md mt-3 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-6 mt-4 border-t border-outline-variant/20 text-on-surface-variant text-label-sm font-code">
                      <span>{formattedDate}</span>
                      {isExternal ? (
                        <span className="material-symbols-outlined text-on-surface text-[16px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                          north_east
                        </span>
                      ) : (
                        <span className="text-primary font-label-sm font-medium flex items-center gap-1 group-hover:underline">
                          Read Article →
                        </span>
                      )}
                    </div>
                  </>
                );

                return isExternal ? (
                  <a
                    key={article.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-outline-variant/70 transition-all group block"
                  >
                    {cardInner}
                  </a>
                ) : (
                  <Link
                    key={article.id}
                    href={href}
                    className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-outline-variant/70 transition-all group block"
                  >
                    {cardInner}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. CTA BANNER */}
        <section className="max-w-[1080px] mx-auto py-12 px-6" id="contact">
          <div className="rounded-3xl bg-gradient-to-b from-surface-container-low to-surface-container-lowest border border-outline-variant/30 p-10 md:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/20 blur-[90px] pointer-events-none" />
            <span className="inline-block px-3.5 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-outline text-label-sm font-label-sm uppercase tracking-wider mb-6">
              • INITIATE ENGAGEMENT
            </span>
            <h2 className="text-3xl md:text-4xl font-headline-lg font-bold text-on-surface tracking-tight max-w-2xl mx-auto">
              Let&apos;s build something resilient together.
            </h2>
            <p className="text-on-surface-variant font-body-lg text-body-lg max-w-xl mx-auto mt-4 leading-relaxed">
              Available for supply chain analytics advisory, custom Python workflow automation, and high-impact executive BI engineering.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <a
                className="bg-on-surface text-surface font-label-md text-label-md font-semibold px-6 py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg"
                href={`mailto:${email}`}
              >
                <span>Get in touch</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
              <button
                type="button"
                className="bg-surface-container border border-outline-variant/40 text-on-surface font-code text-label-md px-5 py-3 rounded-full hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center gap-2"
                onClick={handleCopyEmail}
              >
                <span>{copiedEmail ? "Copied to clipboard!" : email}</span>
                <span className="material-symbols-outlined text-[16px] text-outline">
                  {copiedEmail ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <OptimizedFooter />
    </div>
  );
};

export default Index;
