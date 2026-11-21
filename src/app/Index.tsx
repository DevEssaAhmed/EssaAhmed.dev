"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink, Mail, Check, Copy, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import HeroSystemDiagram from "@/components/home/HeroSystemDiagram";
import FeaturedWork from "@/components/home/FeaturedWork";
import CapabilitiesSection from "@/components/home/CapabilitiesSection";
import { useProfile } from "@/contexts/ProfileContext";
import { extractArticleExternalMeta } from "@/data/externalArticlesStore";
import { formatDateUTC } from "@/lib/date";

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

  const displayName = profile?.name || "Essa Ahmed";
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
    <div className="bg-surface text-on-surface antialiased relative min-h-screen selection:bg-primary/20 selection:text-primary overflow-x-clip flex flex-col justify-between transition-colors duration-200">
      {/* Hero-Scoped Architectural Grid & Subtle Atmospheric Backdrop */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute inset-x-0 top-0 h-[560px] bg-grid-pattern hero-grid-mask" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[440px] bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.06),_rgba(180,83,9,0.04)_45%,_transparent_75%)] dark:hidden" />
        <div className="hidden dark:block absolute top-[-120px] left-[-100px] w-[550px] h-[550px] rounded-full bg-primary/10 blur-[130px]" />
      </div>

      {/* 1. TOP NAVIGATION BAR */}
      <Navigation />

      <main id="main-content" tabIndex={-1} className="w-full flex-1 relative z-10">
        {/* 2. ASYMMETRIC HERO SECTION */}
        <section
          className="max-w-[1080px] mx-auto pt-12 md:pt-16 pb-16 md:pb-20 px-6"
          id="home"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 flex flex-col items-start gap-5 text-left">
              {/* Live Availability Pill (single pulsing beacon on the page) */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/55 dark:border-outline-variant/30 text-secondary text-label-sm font-label-sm tracking-wide shadow-sm animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                <span>Available for new projects &amp; consulting</span>
              </div>

              {/* Quiet Identity Eyebrow */}
              <p className="text-sm sm:text-base font-medium text-on-surface-variant">
                {displayName} · Industrial &amp; Systems Engineer
              </p>

              {/* Tightened Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[48px] leading-[1.08] tracking-[-0.03em] font-display font-extrabold text-on-surface">
                I engineer workflow automation, supply chain models &amp;{" "}
                <span className="text-primary">decision analytics.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-on-surface-variant font-body-lg text-body-lg max-w-xl leading-relaxed">
                Bridging supply chain operations, end-to-end process automation, and decision analytics—turning complex operational data into self-running workflows and clear forecasts.
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1 animate-fade-in animate-stagger-1">
                {initialProjects.length > 0 && (
                  <a
                    className="group text-surface bg-on-surface font-label-md text-label-md font-semibold px-6 py-3 rounded-full hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    href="#projects"
                  >
                    <span>Explore Work</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
                <Link
                  className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/65 dark:border-outline-variant/40 text-on-surface font-label-md text-label-md px-5 py-3 rounded-full hover:bg-surface-container-high hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  href="/about"
                >
                  About &amp; Experience
                </Link>
                <span
                  aria-hidden="true"
                  className="hidden sm:block h-5 w-px bg-outline-variant/45 mx-0.5"
                />
                <div className="flex items-center gap-2.5">
                  <a
                    aria-label="GitHub"
                    className="w-11 h-11 rounded-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/55 dark:border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    href={githubUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Github className="w-4 h-4 text-on-surface-variant" />
                  </a>
                  <a
                    aria-label="LinkedIn"
                    className="w-11 h-11 rounded-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/55 dark:border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    href={linkedinUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Linkedin className="w-4 h-4 text-on-surface-variant" />
                  </a>
                  <a
                    aria-label="Email"
                    className="w-11 h-11 rounded-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/55 dark:border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    href={`mailto:${email}`}
                  >
                    <Mail className="w-4 h-4 text-on-surface-variant" />
                  </a>
                </div>
              </div>

              {/* Quiet Editorial Ledger Strip */}
              <div className="w-full pt-6 mt-2 border-t border-outline-variant/35 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="font-code text-[10px] uppercase tracking-[0.14em] text-outline">
                    FOCUS
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-on-surface mt-1">
                    Automation &amp; S&amp;OP
                  </div>
                </div>
                <div>
                  <div className="font-code text-[10px] uppercase tracking-[0.14em] text-outline">
                    CORE STACK
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-on-surface mt-1">
                    Python · SQL · Power BI
                  </div>
                </div>
                <div>
                  <div className="font-code text-[10px] uppercase tracking-[0.14em] text-outline">
                    AVAILABILITY
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-on-surface mt-1">
                    Async Ready · UTC+5
                  </div>
                </div>
              </div>
            </div>

            {/* Right Architectural Visual Anchor */}
            <div className="lg:col-span-5 animate-fade-in animate-stagger-1">
              <HeroSystemDiagram
                avatarUrl={profile?.avatar_url}
                name={displayName}
              />
            </div>
          </div>
        </section>

        {/* 3. SELECTED PROJECTS (Equal 2x2 Grid, automatically hidden if 0 projects in Supabase) */}
        <FeaturedWork
          initialProjects={initialProjects}
          initialCategories={initialProjectCategories}
        />

        {/* 4. CORE CAPABILITIES & PRODUCTION STACK (Ruled Architectural Band) */}
        <CapabilitiesSection />

        {/* 5. LATEST WRITING (Dynamically hidden when 0 published articles in Supabase) */}
        {publishedArticles.length > 0 && (
          <section className="max-w-[1080px] mx-auto py-16 md:py-20 px-6" id="articles">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-outline-variant/30 mb-10 gap-4">
              <div>
                <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
                  03 / WRITING
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-on-surface tracking-tight">
                  Latest Writing
                </h2>
                <p className="text-on-surface-variant font-body-md text-body-md mt-1.5">
                  Notes on supply chain forecasting, pipeline automation, and executive dashboards.
                </p>
              </div>
              <Link
                className="text-primary text-label-md font-label-md flex items-center gap-1.5 hover:underline shrink-0 font-semibold rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                href="/articles"
              >
                <span>Read all articles</span>
                <ArrowRight className="w-4 h-4" />
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
                const formattedDate = formatDateUTC(
                  article.created_at,
                  {
                    month: "long",
                    year: "numeric",
                  },
                  "Recent"
                );

                const badgeClass =
                  platform === "Medium"
                    ? "bg-secondary/10 border-secondary/30 text-secondary"
                    : platform === "dev.to"
                    ? "bg-tertiary-container/25 border-tertiary/35 text-tertiary"
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
                      <h3 className="text-headline-sm font-display font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-on-surface-variant font-body-md text-body-md mt-3 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-6 mt-4 border-t border-outline-variant/25 text-on-surface-variant text-label-sm font-code">
                      <span>{formattedDate}</span>
                      {isExternal ? (
                        <ExternalLink className="w-4 h-4 text-on-surface group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                    className="rounded-2xl card-elevated card-interactive border p-6 flex flex-col justify-between group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    {cardInner}
                  </a>
                ) : (
                  <Link
                    key={article.id}
                    href={href}
                    className="rounded-2xl card-elevated card-interactive border p-6 flex flex-col justify-between group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    {cardInner}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. INVERTED HIGH-CONTRAST CTA BANNER */}
        <section className="max-w-[1080px] mx-auto py-16 md:py-20 px-6" id="contact">
          <div className="rounded-2xl bg-inverse-surface text-inverse-on-surface dark:bg-surface-container-low dark:text-on-surface border border-on-surface/10 dark:border-outline-variant/40 p-8 sm:p-12 md:p-14 text-center relative overflow-hidden shadow-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-60 [background-size:32px_32px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/20 blur-[100px]"
            />

            <div className="relative z-10">
              <span className="inline-block font-code text-[11px] uppercase tracking-[0.16em] text-inverse-on-surface/70 dark:text-outline mb-5">
                GET IN TOUCH
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight max-w-2xl mx-auto">
                Let&apos;s build something resilient together.
              </h2>
              <p className="text-inverse-on-surface/75 dark:text-on-surface-variant font-body-lg text-body-lg max-w-xl mx-auto mt-4 leading-relaxed">
                Available for supply chain analytics advisory, custom Python workflow automation, and high-impact executive BI engineering.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <a
                  className="group bg-surface text-on-surface dark:bg-on-surface dark:text-surface font-label-md text-label-md font-semibold px-6 py-3 rounded-full hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-inverse-surface dark:focus-visible:ring-offset-surface"
                  href={`mailto:${email}`}
                >
                  <span>Get in touch</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <button
                  type="button"
                  className="bg-white/10 hover:bg-white/15 border border-white/15 text-inverse-on-surface dark:bg-surface-container dark:hover:bg-surface-container-high dark:border-outline-variant/40 dark:text-on-surface font-code text-label-md px-5 py-3 rounded-full hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-inverse-surface dark:focus-visible:ring-offset-surface"
                  onClick={handleCopyEmail}
                >
                  <span>{copiedEmail ? "Copied to clipboard!" : email}</span>
                  {copiedEmail ? (
                    <Check className="w-4 h-4 text-emerald-400 dark:text-secondary" />
                  ) : (
                    <Copy className="w-4 h-4 text-inverse-on-surface/70 dark:text-outline" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <div className="relative z-10">
        <OptimizedFooter />
      </div>
    </div>
  );
};

export default Index;
