"use client";

import { useState } from "react";
import {
  ArrowRight,
  Mail,
  Github,
  Linkedin,
  MapPin,
  Zap,
  Package,
  LineChart,
  CheckCircle2,
  Check,
  Copy,
} from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { InteractiveAvatar3D } from "@/components/InteractiveAvatar3D";
import { useProfile } from "@/contexts/ProfileContext";
import { useContentAvailability } from "@/contexts/ContentAvailabilityContext";

export default function AboutPage({ initialProfile }: { initialProfile?: any } = {}) {
  const { profile: contextProfile } = useProfile();
  const profile = initialProfile || contextProfile;
  const { hasProjects } = useContentAvailability();
  const [copied, setCopied] = useState(false);

  const displayName = profile?.name || "Essa Ahmed";
  const email = profile?.email || "essaahmedsiddiqui@gmail.com";
  const githubUrl = profile?.github_url || "https://github.com/DevEssaAhmed";
  const linkedinUrl = profile?.linkedin_url || "https://www.linkedin.com/in/essa-ahmed";
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

      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* SECTION 1: HERO & IDENTITY */}
        <section id="overview" className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-12 border-b border-outline-variant/30">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
                01 / ABOUT
              </span>
              <p className="text-sm font-medium text-secondary">
                Systems Architect · Operations &amp; Analytics
              </p>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl text-on-surface font-extrabold tracking-tight leading-[1.1]">
              Engineering self-running workflows, S&amp;OP demand models &amp; decision systems.
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              I operate at the intersection of supply chain operations, workflow automation, and executive business intelligence. Instead of building static reports that sit on a shelf, I design automated data pipelines, rolling multi-echelon S&amp;OP demand planning models, and sub-second dimensional warehouses that drive daily operational execution.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 animate-fade-in animate-stagger-1">
              <a
                href={`mailto:${email}`}
                className="group px-6 py-3 rounded-full bg-on-surface text-surface font-label-md text-label-md font-semibold hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <span>Initiate Consultation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              {hasProjects && (
                <Link
                  href="/projects"
                  className="px-5 py-3 rounded-full bg-surface-container-lowest dark:bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/55 dark:border-outline-variant/40 text-on-surface font-label-md text-label-md hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
                >
                  Explore Projects
                </Link>
              )}
              <a
                className="w-11 h-11 rounded-full border border-outline-variant/55 dark:border-outline-variant/30 bg-surface-container-lowest dark:bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline hover:-translate-y-0.5 transition-all"
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                className="w-11 h-11 rounded-full border border-outline-variant/55 dark:border-outline-variant/30 bg-surface-container-lowest dark:bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline hover:-translate-y-0.5 transition-all"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                className="w-11 h-11 rounded-full border border-outline-variant/55 dark:border-outline-variant/30 bg-surface-container-lowest dark:bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline hover:-translate-y-0.5 transition-all"
                href={`mailto:${email}`}
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive 3D Persona & Spatial Identity Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl card-elevated border p-5 sm:p-6 space-y-5 relative overflow-hidden backdrop-blur-md">
              <InteractiveAvatar3D variant="showcase" name={displayName} />

              {/* Profile Header */}
              <div className="pb-4 border-b border-outline-variant/20">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {displayName}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-secondary shrink-0" />
                  <span>{location}</span>
                </p>
              </div>

              {/* Position Pillars Sub-card */}
              <div className="space-y-3">
                <span className="font-code text-[11px] text-outline uppercase tracking-[0.14em] block">
                  Core Specializations
                </span>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" aria-hidden="true" />
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
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                  <span className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" aria-hidden="true" />
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
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                  <span className="w-9 h-9 rounded-xl bg-tertiary/10 text-tertiary border border-tertiary/20 flex items-center justify-center shrink-0">
                    <LineChart className="w-4 h-4" aria-hidden="true" />
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
            <div>
              <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
                02 / CAPABILITIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-on-surface tracking-tight">
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
            <div className="rounded-2xl card-elevated border p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Zap className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Workflow &amp; Process Automation
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Ingestion microservices, event-driven webhook triggers, scheduled ETL reconciliation, and zero-touch exception handling across fractured enterprise toolchains.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Asynchronous webhook handlers &amp; idempotent pipelines</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Automated reconciliation between legacy ERP &amp; cloud stores</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
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
                      className="px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/40 dark:border-outline-variant/25 text-on-surface-variant font-code text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl card-elevated border p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                  <Package className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Supply Chain &amp; Demand Planning
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Multi-echelon demand forecasting, safety stock optimization, vendor OTIF lead-time scoring, and automated S&amp;OP scenario engines.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>Rolling 52-week S&amp;OP demand &amp; inventory models</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>Dynamic safety stock &amp; reorder point optimization</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
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
                      className="px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/40 dark:border-outline-variant/25 text-on-surface-variant font-code text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl card-elevated border p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
                  <LineChart className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Analytics &amp; Decision Systems
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  High-speed Kimball star schemas, dbt transformation layers, and executive Power BI cockpits built for immediate root-cause slicing.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                    <span>Dimensional star schemas &amp; automated dbt lineage</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                    <span>Sub-second DAX measures &amp; executive KPI hierarchies</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface text-xs font-body-md">
                    <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
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
                      className="px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/40 dark:border-outline-variant/25 text-on-surface-variant font-code text-[11px]"
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
          <div className="border-b border-outline-variant/30 pb-6">
            <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
              03 / EXPERIENCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-on-surface tracking-tight">
              Experience &amp; Systems Leadership
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl card-elevated border space-y-4">
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
                    className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container text-on-surface-variant border border-outline-variant/40 dark:border-outline-variant/25"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl card-elevated border space-y-4">
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
                      className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container text-on-surface-variant border border-outline-variant/40 dark:border-outline-variant/25"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: INVERTED HIGH-CONTRAST CTA BANNER */}
        <section id="contact" className="scroll-mt-28">
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
                Let&apos;s engineer resilient systems together.
              </h2>
              <p className="text-inverse-on-surface/75 dark:text-on-surface-variant font-body-lg text-body-lg max-w-xl mx-auto mt-4 leading-relaxed">
                Whether you need end-to-end automation pipelines, S&amp;OP demand models, or high-performance dimensional reporting engines—I architect solutions designed to scale reliably.
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
                  <span>{copied ? "Copied to clipboard!" : email}</span>
                  {copied ? (
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

      <OptimizedFooter />
    </div>
  );
}
