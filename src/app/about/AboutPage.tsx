"use client";

import { useState } from "react";
import { ArrowRight, Mail, Send } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { useProfile } from "@/contexts/ProfileContext";
import type { Profile } from "@/lib/profile-utils";
import { useContentAvailability } from "@/contexts/ContentAvailabilityContext";

export default function AboutPage({ initialProfile }: { initialProfile?: Profile | null } = {}) {
  const { profile: contextProfile } = useProfile();
  const profile = contextProfile ?? initialProfile;
  const { hasProjects } = useContentAvailability();
  const [copied, setCopied] = useState(false);

  const displayName = profile?.name || "Essa Ahmed";
  const email = profile?.email || "essa@essaahmed.dev";
  const githubUrl = profile?.github_url || "https://github.com/DevEssaAhmed";
  const linkedinUrl = profile?.linkedin_url || "https://linkedin.com/in/essaahmed";
  const location = profile?.location || "Karachi / Lahore, Pakistan (UTC+5, Async Ready)";

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-6 py-12 space-y-16">
        {/* SECTION 1: HERO & IDENTITY */}
        <section id="overview" className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Systems Architect · Operations &amp; Analytics</span>
            </div>

            <h1 className="font-headline-lg text-4xl sm:text-5xl text-on-surface font-extrabold tracking-tight leading-[1.12]">
              Engineering self-running workflows, S&amp;OP demand models &amp; decision systems.
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              I operate at the intersection of supply chain operations, workflow automation, and executive business intelligence. Instead of building static reports that sit on a shelf, I design automated data pipelines, rolling multi-echelon S&amp;OP demand planning models, and sub-second dimensional warehouses that drive daily operational execution.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`mailto:${email}`}
                className="px-6 py-3 rounded-full bg-on-surface text-surface font-label-md text-label-md font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <span>Initiate Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              {hasProjects && (
                <Link
                  href="/projects"
                  className="px-5 py-3 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-on-surface font-label-md text-label-md transition-all"
                >
                  Explore Projects
                </Link>
              )}
              <a
                className="w-11 h-11 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline-variant/70 transition-all"
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <span className="font-code text-code font-bold text-xs">GH</span>
              </a>
              <a
                className="w-11 h-11 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline-variant/70 transition-all"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <span className="font-code text-code font-bold text-xs">IN</span>
              </a>
              <a
                className="w-11 h-11 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline-variant/70 transition-all"
                href={`mailto:${email}`}
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Telemetry & Spatial Identity Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute -right-16 -top-16 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              {/* Profile Badge Header */}
              <div className="flex items-center gap-4 pb-5 border-b border-outline-variant/20">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-headline-md text-headline-md font-bold shadow-inner">
                  EA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {displayName}
                    </h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      location_on
                    </span>
                    <span>{location}</span>
                  </p>
                </div>
              </div>

              {/* Position Pillars Sub-card */}
              <div className="py-5 space-y-3">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block">
                  Core Specializations
                </span>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-base">
                    ⚡
                  </span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-semibold block">
                      Workflow &amp; Process Automation
                    </span>
                    <span className="font-code text-[11px] text-on-surface-variant">
                      Python, SQL &amp; Automated Pipelines
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all">
                  <span className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center text-base">
                    📦
                  </span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-semibold block">
                      Supply Chain &amp; Demand Planning
                    </span>
                    <span className="font-code text-[11px] text-on-surface-variant">
                      S&amp;OP Forecasting &amp; Safety Stock
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-base">
                    📊
                  </span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-semibold block">
                      Analytics &amp; Decision Systems
                    </span>
                    <span className="font-code text-[11px] text-on-surface-variant">
                      Sub-second Star Schemas &amp; Power BI
                    </span>
                  </div>
                </div>
              </div>

              {/* Identity Footer */}
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between font-code text-code text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  NED University Alumni
                </span>
                <span>Production Focus</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 3-PILLAR ARCHITECTURE DEEP-DIVE */}
        <section id="pillars" className="scroll-mt-28 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/20 pb-5">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-1">
                Architecture &amp; Domains
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Core Engineering Pillars &amp; Specializations
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              Engineered with production discipline, reliable data contracts, and measurable operational outcomes.
            </p>
          </div>

          {/* 3 Equal Pillar Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-200 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-amber-500 text-xl group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Workflow &amp; Process Automation
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Ingestion microservices, event-driven webhook triggers, scheduled ETL reconciliation, and zero-touch exception handling across fractured enterprise toolchains.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Asynchronous webhook handlers &amp; idempotent pipelines</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Automated reconciliation between legacy ERP &amp; cloud stores</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Zero-touch schema validation with strict data contracts</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-outline-variant/20">
                <span className="font-label-sm text-label-sm text-outline block mb-2 uppercase tracking-wider">
                  Engineered With
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Python", "Apache Airflow", "n8n", "FastAPI", "Webhooks"].map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant font-code text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-secondary/40 transition-all duration-200 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-secondary text-xl group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Supply Chain &amp; Demand Planning
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Multi-echelon demand forecasting, safety stock optimization, vendor OTIF lead-time scoring, and automated S&amp;OP scenario engines.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Rolling 52-week S&amp;OP demand &amp; inventory models</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Dynamic safety stock &amp; reorder point optimization</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Tier-1 supplier OTIF &amp; lead-time drift detection</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-outline-variant/20">
                <span className="font-label-sm text-label-sm text-outline block mb-2 uppercase tracking-wider">
                  Engineered With
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["S&OP Modeling", "Python", "SQL", "Snowflake", "Forecasting"].map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant font-code text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-tertiary/40 transition-all duration-200 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary text-xl group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">query_stats</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Analytics &amp; Decision Systems
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  High-speed Kimball star schemas, dbt transformation layers, and executive Power BI cockpits built for immediate root-cause slicing.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Dimensional star schemas &amp; automated dbt lineage</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Sub-second DAX measures &amp; executive KPI hierarchies</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Real-time factory floor &amp; commercial telemetry</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-outline-variant/20">
                <span className="font-label-sm text-label-sm text-outline block mb-2 uppercase tracking-wider">
                  Engineered With
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Power BI", "DAX", "dbt", "PostgreSQL", "Next.js"].map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant font-code text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: EXPERIENCE & CREDENTIALS */}
        <section id="experience" className="scroll-mt-28 space-y-8">
          <div className="border-b border-outline-variant/20 pb-5">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-1">
              Operational Track Record
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Experience &amp; Systems Leadership
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/70 transition-all space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Analytics, Automation &amp; Supply Chain Systems Engineer
                  </h3>
                  <p className="font-body-md text-body-md text-primary mt-0.5">
                    Manufacturing, Supply Chain &amp; Enterprise Operations
                  </p>
                </div>
                <span className="font-code text-code text-secondary px-3 py-1 rounded-full bg-secondary/10 border border-secondary/25 w-fit">
                  Present
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Leading the architecture of automated Python/SQL workflows, rolling S&amp;OP demand planning models, and real-time Power BI decision cockpits across manufacturing, quality assurance, and procurement operations.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Workflow Automation",
                  "S&OP Demand Planning",
                  "Power BI & DAX",
                  "Python & SQL Pipelines",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant border border-outline-variant/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/70 transition-all space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Supply Chain &amp; Operations Data Analyst
                  </h3>
                  <p className="font-body-md text-body-md text-secondary mt-0.5">
                    Industrial &amp; Automotive Operations
                  </p>
                </div>
                <span className="font-code text-code text-on-surface-variant px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 w-fit">
                  Core Experience
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Architected automated ERP reporting feeds, deployed S&amp;OP demand reconciliation pipelines across distributed warehouses, and established programmatic vendor SLA and OTIF enforcement models.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["S&OP Cycles", "Vendor OTIF", "Power BI DAX", "ERP Integrations"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant border border-outline-variant/20"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CONTACT & INITIATE ENGAGEMENT BANNER */}
        <section
          className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-8 md:p-12 relative overflow-hidden backdrop-blur-xl"
          id="contact"
        >
          <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-6">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block">
              Initiate Engagement
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Let&apos;s engineer resilient systems together.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Whether you need end-to-end automation pipelines, S&amp;OP demand models, or high-performance dimensional reporting engines—I architect solutions designed to scale reliably.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 font-code text-code text-on-surface">
                <span>{email}</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="ml-4 min-h-11 min-w-11 px-2.5 py-1 rounded-lg bg-surface-container text-xs text-primary hover:underline transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <a
                className="font-label-md text-label-md font-semibold px-6 py-3 rounded-full bg-on-surface text-surface hover:opacity-90 transition-all text-center flex items-center justify-center gap-2 active:scale-95 shadow-md"
                href={`mailto:${email}`}
              >
                <span>Send Direct Message</span>
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <OptimizedFooter />
    </div>
  );
}
