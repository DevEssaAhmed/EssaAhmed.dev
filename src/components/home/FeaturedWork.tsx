"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Heart, MoveRight } from "lucide-react";

type Filter = "all" | "bi" | "pipelines" | "automation";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bi", label: "Business Intelligence" },
  { id: "pipelines", label: "Data Pipelines" },
  { id: "automation", label: "Automation" },
];

interface CaseStudy {
  id: string;
  categories: Filter[];
  eyebrow: string;
  eyebrowClass: string;
  chips: { label: string; featured?: boolean }[];
  title: string;
  description: string;
  highlights: { label: string; value: string; accent?: boolean }[];
  views: number;
  likes: number;
  cta: string;
  href: string;
  visual: "bars" | "pareto" | "run" | "telemetry";
}

/* Hard-coded editorial case studies (from the Stitch "Executive Editorial" design). */
const CASE_STUDIES: CaseStudy[] = [
  {
    id: "vendor-defect",
    categories: ["bi"],
    eyebrow: "Executive Telemetry",
    eyebrowClass: "text-champagne",
    chips: [{ label: "Featured", featured: true }, { label: "BI" }],
    title: "4-Wheel Vendor Defect Analysis – Executive Quality Review",
    description:
      "This presentation and interactive cockpit were prepared for senior automotive management to analyze vendor-related defects across production batches, identify non-conformance patterns, and tighten supplier accountability contracts.",
    highlights: [
      { label: "Primary Impact", value: "Contract Accountability" },
      { label: "Resolution Speed", value: "Root Cause Slicing < 3s", accent: true },
    ],
    views: 2,
    likes: 0,
    cta: "Explore Analysis",
    href: "/projects/4e489887-2834-4774-ae54-a0b8a5b0c2a3",
    visual: "bars",
  },
  {
    id: "suzuki-qa",
    categories: ["bi"],
    eyebrow: "High-Volume Manufacturing",
    eyebrowClass: "text-metric",
    chips: [{ label: "Featured", featured: true }, { label: "Quality Eng" }],
    title: "Case Study: Suzuki Manufacturing Quality Assurance Dashboard",
    description:
      "In a high-volume manufacturing environment, identifying the root cause of defects is vital. Designed an interactive operational control room dashboard isolating assembly line faults, part defects, and component failure rates.",
    highlights: [
      { label: "Operational Scope", value: "Full Assembly Plant" },
      { label: "Monitoring", value: "Component Part Isolation", accent: true },
    ],
    views: 67,
    likes: 0,
    cta: "Read Case Study",
    href: "/projects/e51f2539-7631-435e-8f77-d560c5d7fc66",
    visual: "pareto",
  },
  {
    id: "stitching-productivity",
    categories: ["bi", "automation"],
    eyebrow: "Operational Analytics",
    eyebrowClass: "text-tertiary",
    chips: [{ label: "Power BI" }, { label: "Operations" }],
    title: "Stitching Offline Productivity Dashboard",
    description:
      "AGI – Offline Productivity Dashboard. This interactive dashboard was developed in Power BI to monitor real-time industrial sewing throughput, benchmark operator performance against target quotas, and minimize bottleneck downtime.",
    highlights: [
      { label: "Throughput Target", value: "95.3% SLA Target", accent: true },
      { label: "Coverage", value: "Lines 01 - 12 Continuous" },
    ],
    views: 141,
    likes: 0,
    cta: "View Solution",
    href: "/projects/0c806cae-9ceb-4249-90b6-332353ef771c",
    visual: "run",
  },
  {
    id: "rejection-automation",
    categories: ["pipelines", "automation"],
    eyebrow: "Pipeline & ETL Automation",
    eyebrowClass: "text-lavender",
    chips: [{ label: "Featured", featured: true }, { label: "#bi" }],
    title: "Rejection Dashboard Automation",
    description:
      "Project: Defect Tracking and Analysis Automation Overview. This project involved transforming a previously manual, spreadsheet-bound defect logging workflow into an automated data pipeline and real-time executive dashboard.",
    highlights: [
      { label: "Transformation", value: "Spreadsheet → Automated" },
      { label: "Human Latency", value: "Zero Manual Entry", accent: true },
    ],
    views: 140,
    likes: 0,
    cta: "View Architecture",
    href: "/projects/d17bf217-6beb-4b4b-8f52-7444d58c453a",
    visual: "telemetry",
  },
];

/* ───────────── Visual mockup panels ───────────── */

const BarsVisual = () => (
  <>
    <div className="flex justify-between items-center relative z-10 mb-8">
      <span className="font-mono text-[11px] tracking-wider uppercase text-ink-muted">
        Top 5 Worst Performing Vendors
      </span>
      <span className="font-mono text-[11px] text-tertiary">FY 2024-25 vs FY 2025-26</span>
    </div>
    <div className="relative z-10 w-full flex flex-col gap-3">
      <div className="flex justify-between items-end h-40 px-6 gap-4 border-b border-border pb-2">
        {[
          { l: "V1", h: "h-[42%] group-hover:h-[46%]", cls: "bg-surface-highest" },
          { l: "V2", h: "h-[65%] group-hover:h-[68%]", cls: "bg-surface-highest" },
          { l: "V3", h: "h-[90%] group-hover:h-[94%]", cls: "bg-gradient-to-t from-blue-700 to-blue-200 shadow-[0_0_20px_rgba(191,219,254,0.2)]", hot: true },
          { l: "V4", h: "h-[55%]", cls: "bg-surface-highest" },
          { l: "V5", h: "h-[30%]", cls: "bg-surface-high" },
        ].map((b) => (
          <div
            key={b.l}
            className={`flex-1 rounded-t flex flex-col justify-end items-center transition-all ${b.h} ${b.cls}`}
          >
            <span className={`font-mono text-[10px] mb-1.5 ${b.hot ? "text-[#031733] font-bold" : "text-ink-muted"}`}>
              {b.l}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between font-mono text-[11px] text-ink-muted pt-2">
        <span>Production Line Telemetry</span>
        <span className="text-champagne">Defect Index High: V3</span>
      </div>
    </div>
  </>
);

const ParetoVisual = () => (
  <>
    <div className="flex justify-between items-center relative z-10 mb-8">
      <span className="font-mono text-[11px] tracking-wider uppercase text-ink-muted">Pareto Failure Distribution</span>
      <span className="font-mono text-[11px] text-tertiary">Real-time Slicing</span>
    </div>
    <div className="relative z-10 flex flex-col gap-4">
      <div className="space-y-3">
        {[
          { name: "BOLT WITH WASHER [CHASSIS]", pct: 41.2, text: "text-destructive", bar: "bg-destructive" },
          { name: "NOZZLE WASHER & HOSE OUTL", pct: 27.6, text: "text-champagne", bar: "bg-champagne" },
          { name: "COVER, AIR LOWER HARNESS", pct: 16.4, text: "text-metric", bar: "bg-metric" },
        ].map((row) => (
          <div key={row.name}>
            <div className="flex justify-between font-mono text-[12px] mb-1.5">
              <span className="text-foreground">{row.name}</span>
              <span className={`${row.text} font-semibold`}>{row.pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-highest overflow-hidden">
              <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between font-mono text-[11px] text-ink-muted pt-2 border-t border-border">
        <span>Root Cause Drilldown</span>
        <span className="text-champagne">Tier-1 Assembly Plant</span>
      </div>
    </div>
  </>
);

const RunVisual = () => (
  <>
    <div className="flex justify-between items-center relative z-10 mb-6">
      <span className="font-mono text-[11px] tracking-wider uppercase text-ink-muted">AGI Offline Productivity</span>
      <span className="px-2.5 py-0.5 rounded bg-tertiary-container/30 border border-tertiary/30 text-tertiary font-mono text-[11px] font-semibold">
        Target: 95.3%
      </span>
    </div>
    <div className="relative z-10 w-full flex flex-col gap-3">
      <div className="relative h-36 flex items-center justify-center">
        <svg className="w-full h-full text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 300 80" aria-hidden="true">
          <path className="drop-shadow-lg" d="M 0,60 Q 50,20 100,45 T 200,15 T 300,28" strokeWidth="2.5" />
          <path d="M 0,60 Q 50,20 100,45 T 200,15 T 300,28 L 300,80 L 0,80 Z" fill="currentColor" fillOpacity="0.08" stroke="none" />
          <line stroke="#4a5369" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="300" y1="40" y2="40" />
        </svg>
      </div>
      <div className="flex justify-between font-mono text-[11px] text-ink-muted pt-2 border-t border-border">
        <span>Shift Telemetry Stream</span>
        <span className="text-tertiary">Line 01 - 12 Throughput</span>
      </div>
    </div>
  </>
);

const TelemetryVisual = () => (
  <>
    <div className="flex justify-between items-center relative z-10 mb-8">
      <span className="font-mono text-[11px] tracking-wider uppercase text-ink-muted">Automated Ingestion Pipeline</span>
      <span className="font-mono text-[11px] text-tertiary">Zero Manual Entry</span>
    </div>
    <div className="relative z-10 flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "FABRIC", v: "18.4K", cls: "bg-surface-high border border-border", vCls: "text-white" },
          { l: "STITCH", v: "7.2K", cls: "bg-surface-high border border-border", vCls: "text-white" },
          { l: "WASH", v: "3.1K", cls: "bg-surface-high border border-border", vCls: "text-champagne" },
          { l: "FINISH", v: "1.0K", cls: "bg-champagne text-[#090c13] shadow-lg", vCls: "" },
        ].map((c) => (
          <div key={c.l} className={`p-3 rounded-lg text-center ${c.cls}`}>
            <span className={`block font-mono text-[10px] uppercase ${c.l === "FINISH" ? "font-bold" : "text-ink-muted"}`}>
              {c.l}
            </span>
            <span className={`block font-display text-base font-bold mt-1 ${c.vCls}`}>{c.v}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between font-mono text-[11px] text-ink-muted pt-2 border-t border-border">
        <span>Defect Categorization Node</span>
        <span className="text-champagne">Real-time DAG Sink</span>
      </div>
    </div>
  </>
);

const VISUALS = {
  bars: { Cmp: BarsVisual, glow: "from-champagne/5" },
  pareto: { Cmp: ParetoVisual, glow: "from-metric/5" },
  run: { Cmp: RunVisual, glow: "from-tertiary/5" },
  telemetry: { Cmp: TelemetryVisual, glow: "from-lavender/5" },
} as const;

/* ───────────── Section ───────────── */

const FeaturedWork = () => {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(
    () => CASE_STUDIES.filter((c) => filter === "all" || c.categories.includes(filter)),
    [filter]
  );

  return (
    <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-32 scroll-mt-24" id="featured-work">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-8 border-b border-border">
        <div>
          <div className="eyebrow mb-3">Portfolio Showcase</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">Featured Work</h2>
          <p className="text-sm sm:text-base text-ink-soft mt-2 font-light">
            Selected projects, articles, and a bit about me.
          </p>
        </div>

        <div
          className="flex flex-wrap items-center gap-1.5 bg-surface-high p-1.5 rounded-lg border border-border"
          role="tablist"
          aria-label="Filter featured work"
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${active
                    ? "bg-surface-container text-white border border-border shadow-sm"
                    : "text-ink-soft hover:text-white border border-transparent"
                  }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {items.map((study, index) => {
          const flipped = index % 2 === 1;
          const { Cmp, glow } = VISUALS[study.visual];
          return (
            <article
              key={study.id}
              className="group animate-fade-up rounded-2xl bg-surface-low border border-border hover:border-metric/40 transition-all duration-500 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Editorial summary */}
              <div
                className={`lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between order-2 ${flipped ? "lg:order-2" : "lg:order-1"
                  }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-6">
                    <span
                      className={`px-3 py-1 rounded-full bg-surface-high border border-border font-mono text-[11px] tracking-wider ${study.eyebrowClass}`}
                    >
                      {study.eyebrow}
                    </span>
                    {study.chips.map((chip) => (
                      <span
                        key={chip.label}
                        className={`px-2.5 py-0.5 rounded font-mono text-[11px] ${chip.featured
                            ? "bg-blue-200/10 border border-blue-200/20 text-blue-200"
                            : "bg-surface-highest text-ink-soft"
                          }`}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                  <Link href={study.href} className="group/title block">
                    <h3 className="font-display text-2xl lg:text-[26px] font-bold text-white tracking-tight group-hover:text-champagne group-hover/title:text-champagne transition-colors mb-4 leading-snug">
                      {study.title}
                    </h3>
                  </Link>
                  <p className="text-[14px] lg:text-[15px] text-ink-soft leading-relaxed mb-6 font-light">
                    {study.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 py-5 my-6 border-y border-border">
                    {study.highlights.map((h) => (
                      <div key={h.label}>
                        <span className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                          {h.label}
                        </span>
                        <span
                          className={`font-display text-sm font-semibold mt-1 block ${h.accent ? "text-tertiary" : "text-white"
                            }`}
                        >
                          {h.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4 font-mono text-xs text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-blue-200" /> {study.views}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-metric" /> {study.likes}
                    </span>
                  </div>
                  <Link
                    href={study.href}
                    className="inline-flex items-center gap-2 text-champagne hover:text-white font-medium text-sm transition-colors group/link"
                  >
                    <span>{study.cta}</span>
                    <ArrowRight className="w-[18px] h-[18px] group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Visual mockup */}
              <div
                className={`lg:col-span-6 bg-surface-lowest p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 border-border relative overflow-hidden order-1 ${flipped ? "lg:order-1 lg:border-r" : "lg:order-2 lg:border-l"
                  }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${glow} via-transparent to-transparent pointer-events-none`} />
                <Cmp />
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex justify-center mt-14">
        <Link
          href="/projects"
          className="px-8 py-3.5 rounded-lg bg-surface-high border border-border hover:border-champagne/40 text-foreground hover:text-champagne font-medium text-sm tracking-wide transition-all flex items-center gap-2 group"
        >
          <span>View All Projects</span>
          <MoveRight className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedWork;
