"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Terminal, Package, LineChart } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const PILLARS = [
  {
    index: "01",
    title: "Workflow & Process Automation",
    description:
      "Eliminating repetitive spreadsheet and ERP bottlenecks with automated Python microservices, scheduled pipelines, and real-time webhook/Slack alerts.",
    icon: Terminal,
    iconClasses: "bg-primary/10 border-primary/20 text-primary",
    dotClass: "bg-primary",
    deliverables: [
      "Zero-touch scheduled jobs",
      "Webhook & Slack alerts",
      "Automated ETL reconciliations",
    ],
  },
  {
    index: "02",
    title: "Supply Chain & Demand Planning",
    description:
      "Multi-echelon demand forecasting, inventory replenishment modeling, vendor lead-time tracking, and S&OP scenario planning.",
    icon: Package,
    iconClasses: "bg-secondary/10 border-secondary/20 text-secondary",
    dotClass: "bg-secondary",
    deliverables: [
      "S&OP forecast modeling",
      "Safety stock optimization",
      "Vendor SLA & OTIF audit",
    ],
  },
  {
    index: "03",
    title: "Analytics & Decision Systems",
    description:
      "High-speed dimensional warehouses and executive Power BI cockpits designed for instant root-cause slicing and operational clarity.",
    icon: LineChart,
    iconClasses: "bg-tertiary/10 border-tertiary/20 text-tertiary",
    dotClass: "bg-tertiary",
    deliverables: [
      "Sub-second DAX/SQL queries",
      "Star schema dimensional modeling",
      "Executive cockpit design",
    ],
  },
] as const;

const STACK_TRACKS = [
  {
    track: "Automation",
    items: ["Python", "Airflow", "FastAPI", "Docker"],
    activeRing: "ring-1 ring-primary/35 bg-primary/[0.04] border-primary/35",
  },
  {
    track: "Supply Chain & Data",
    items: ["SQL", "Snowflake", "S&OP Modeling", "Demand Forecasting"],
    activeRing: "ring-1 ring-secondary/35 bg-secondary/[0.04] border-secondary/35",
  },
  {
    track: "BI & Delivery",
    items: ["Power BI", "dbt", "PostgreSQL", "Next.js", "Supabase"],
    activeRing: "ring-1 ring-tertiary/35 bg-tertiary/[0.04] border-tertiary/35",
  },
] as const;

const PILLAR_HIGHLIGHT_CLASSES = [
  "bg-primary/[0.035] dark:bg-primary/[0.06]",
  "bg-secondary/[0.035] dark:bg-secondary/[0.06]",
  "bg-tertiary/[0.035] dark:bg-tertiary/[0.06]",
] as const;

const CapabilitiesSection = () => {
  const [activeTrack, setActiveTrack] = useState<number | null>(null);

  return (
    <section className="max-w-[1080px] mx-auto py-16 md:py-20 px-6">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-outline-variant/30 mb-10 gap-4">
          <div>
            <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
              02 / CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-on-surface tracking-tight">
              Core Capabilities
            </h2>
            <p className="text-on-surface-variant font-body-md text-body-md mt-1.5">
              Engineered systems built for process velocity, inventory precision, and reliable reporting.
            </p>
          </div>
          <Link
            className="text-primary text-label-md font-label-md flex items-center gap-1.5 hover:underline shrink-0 font-semibold rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            href="/lab"
          >
            <span>Launch S&amp;OP Lab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Unified Ruled Architectural Tonal Container */}
        <div
          onMouseLeave={() => setActiveTrack(null)}
          className="relative rounded-2xl bg-surface-container-low/70 dark:bg-surface-container-low border border-outline-variant/50 dark:border-outline-variant/30 overflow-hidden"
        >
          {/* Corner Drafting Crosshairs */}
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute top-1 left-1.5 font-code text-[10px] leading-none text-outline/45 z-10"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute top-1 right-1.5 font-code text-[10px] leading-none text-outline/45 z-10"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-1 left-1.5 font-code text-[10px] leading-none text-outline/45 z-10"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-1 right-1.5 font-code text-[10px] leading-none text-outline/45 z-10"
          >
            +
          </span>

          {/* 3-Column Ruled Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/40 dark:divide-outline-variant/25">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isHighlighted = activeTrack === idx;
              const isDimmed = activeTrack !== null && activeTrack !== idx;
              return (
                <div
                  key={pillar.index}
                  onMouseEnter={() => setActiveTrack(idx)}
                  onFocus={() => setActiveTrack(idx)}
                  onBlur={() => setActiveTrack(null)}
                  className={`p-7 md:p-8 flex flex-col justify-between transition-all duration-200 ${
                    isHighlighted ? PILLAR_HIGHLIGHT_CLASSES[idx] : ""
                  } ${isDimmed ? "opacity-75" : "opacity-100"}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-200 ${
                          isHighlighted ? "scale-105" : ""
                        } ${pillar.iconClasses}`}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <span className="font-code text-xs text-outline font-medium">
                        {pillar.index}
                      </span>
                    </div>
                    <h3 className="text-headline-sm font-display font-semibold text-on-surface mb-2.5">
                      {pillar.title}
                    </h3>
                    <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-6">
                      {pillar.description}
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-label-md font-label-md text-on-surface pt-5 border-t border-outline-variant/30 dark:border-outline-variant/20">
                    {pillar.deliverables.map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${pillar.dotClass}`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Integrated Production Stack Band */}
          <div className="border-t border-outline-variant/40 dark:border-outline-variant/25 bg-surface-container-lowest/65 dark:bg-surface-container/45 px-7 md:px-8 py-6">
            <span className="font-code text-[11px] uppercase tracking-[0.14em] text-outline mb-4 block">
              PRODUCTION STACK &amp; TOOLING
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STACK_TRACKS.map((group, idx) => {
                const isHighlighted = activeTrack === idx;
                return (
                  <div
                    key={group.track}
                    onMouseEnter={() => setActiveTrack(idx)}
                    className={`rounded-xl p-3 -m-1.5 border transition-all duration-200 space-y-2.5 ${
                      isHighlighted
                        ? group.activeRing
                        : "border-transparent"
                    }`}
                  >
                    <div className="font-code text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                      {group.track}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((tool) => (
                        <span
                          key={tool}
                          className={`px-2.5 py-1 rounded-md border text-on-surface text-xs font-code transition-colors ${
                            isHighlighted
                              ? "bg-surface-container-lowest dark:bg-surface-container-high border-outline-variant/70"
                              : "bg-surface-container-low dark:bg-surface-container border-outline-variant/45 dark:border-outline-variant/30"
                          }`}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default CapabilitiesSection;
