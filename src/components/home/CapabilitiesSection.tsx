"use client";

import { Terminal, Package, LineChart } from "lucide-react";

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
  },
  {
    track: "Supply Chain & Data",
    items: ["SQL", "Snowflake", "S&OP Modeling", "Demand Forecasting"],
  },
  {
    track: "BI & Delivery",
    items: ["Power BI", "dbt", "PostgreSQL", "Next.js", "Supabase"],
  },
] as const;

const CapabilitiesSection = () => {
  return (
    <section className="max-w-[1080px] mx-auto py-16 md:py-20 px-6">
      <div className="pb-6 border-b border-outline-variant/30 mb-10">
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

      {/* Unified Ruled Architectural Tonal Container */}
      <div className="rounded-2xl bg-surface-container-low/70 dark:bg-surface-container-low border border-outline-variant/50 dark:border-outline-variant/30 overflow-hidden">
        {/* 3-Column Ruled Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/40 dark:divide-outline-variant/25">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.index}
                className="p-7 md:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${pillar.iconClasses}`}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STACK_TRACKS.map((group) => (
              <div key={group.track} className="space-y-2.5">
                <div className="font-code text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                  {group.track}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/45 dark:border-outline-variant/30 text-on-surface text-xs font-code"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
