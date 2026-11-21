"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, LineChart, Package, Zap } from "lucide-react";
import { InteractiveAvatar3D } from "@/components/InteractiveAvatar3D";

interface HeroSystemDiagramProps {
  avatarUrl?: string | null;
  name?: string;
}

const PIPELINE_STAGES = [
  {
    index: "01",
    domainTag: "ETL",
    title: "Ingest & Automate",
    detail: "ERP, spreadsheets & webhooks → Python / Airflow",
    icon: Zap,
    iconClasses: "text-primary bg-primary/10 border-primary/20",
    activeCardClasses:
      "border-primary/50 bg-surface-container-lowest dark:bg-surface-container ring-1 ring-primary/20",
    railClass: "bg-primary",
    badgeClasses: "text-primary bg-primary/10 border-primary/25",
    trace: {
      input: "erp_orders + supplier_asn",
      engine: "Python + Airflow · schema check & dedup",
      output: "clean_orders + Slack anomaly alert",
    },
  },
  {
    index: "02",
    domainTag: "STOCHASTIC",
    title: "Model & Forecast",
    detail: "Multi-echelon S&OP demand, safety stock & vendor OTIF",
    icon: Package,
    iconClasses: "text-secondary bg-secondary/10 border-secondary/20",
    activeCardClasses:
      "border-secondary/50 bg-surface-container-lowest dark:bg-surface-container ring-1 ring-secondary/20",
    railClass: "bg-secondary",
    badgeClasses: "text-secondary bg-secondary/10 border-secondary/25",
    trace: {
      input: "90d demand (μ, σd) + PO lead (L, σL)",
      engine: "SS = z · √(L·σd² + d̄²·σL²) → ROP",
      output: "tiered SKU replenishment queue",
    },
  },
  {
    index: "03",
    domainTag: "OLAP",
    title: "Decide & Monitor",
    detail: "Dimensional star schemas → Executive Power BI",
    icon: LineChart,
    iconClasses: "text-tertiary bg-tertiary/10 border-tertiary/20",
    activeCardClasses:
      "border-tertiary/50 bg-surface-container-lowest dark:bg-surface-container ring-1 ring-tertiary/20",
    railClass: "bg-tertiary",
    badgeClasses: "text-tertiary bg-tertiary/10 border-tertiary/25",
    trace: {
      input: "fact_orders ⋈ dim_vendor ⋈ dim_date",
      engine: "Star schema + DAX OTIF & fill-rate",
      output: "Power BI cockpit · root-cause slice",
    },
  },
] as const;

type StageIndex = (typeof PIPELINE_STAGES)[number]["index"];

export default function HeroSystemDiagram({
  avatarUrl: _avatarUrl,
  name = "Essa Ahmed",
}: HeroSystemDiagramProps) {
  const [activeStage, setActiveStage] = useState<StageIndex>("01");

  const selectedIdx = PIPELINE_STAGES.findIndex(
    (stage) => stage.index === activeStage
  );
  const selectedStage =
    PIPELINE_STAGES[selectedIdx >= 0 ? selectedIdx : 0];

  const handleStageKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = PIPELINE_STAGES[(idx + 1) % PIPELINE_STAGES.length];
      setActiveStage(next.index);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev =
        PIPELINE_STAGES[
          (idx - 1 + PIPELINE_STAGES.length) % PIPELINE_STAGES.length
        ];
      setActiveStage(prev.index);
    }
  };

  return (
    <div
      aria-label="Decision systems architecture overview"
      className="relative rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/55 dark:border-outline-variant/35 shadow-sm overflow-hidden"
    >
      {/* Corner Drafting Crosshairs */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-1 left-1.5 font-code text-[10px] leading-none text-outline/45 z-20"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-1 right-1.5 font-code text-[10px] leading-none text-outline/45 z-20"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-1 left-1.5 font-code text-[10px] leading-none text-outline/45 z-20"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-1 right-1.5 font-code text-[10px] leading-none text-outline/45 z-20"
      >
        +
      </span>

      {/* Blueprint Header */}
      <div className="px-5 py-3 border-b border-outline-variant/35 dark:border-outline-variant/25 bg-surface-container-low/65 dark:bg-surface-container/50 flex items-center justify-between gap-3">
        <span className="font-code text-[11px] uppercase tracking-[0.14em] text-outline font-medium">
          SYSTEM ARCHITECTURE
        </span>
        <span className="font-code text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container dark:bg-surface-container-high border border-outline-variant/40 dark:border-outline-variant/30 text-on-surface-variant">
          3-STAGE PIPELINE
        </span>
      </div>

      {/* Stage Stack over subtle architectural grid */}
      <div className="relative p-5 bg-grid-pattern">
        <div className="relative flex flex-col">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = stage.index === activeStage;
            return (
              <div key={stage.index}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveStage(stage.index)}
                  onKeyDown={(e) => handleStageKeyDown(e, idx)}
                  className={`relative w-full text-left rounded-xl border p-3.5 flex items-start gap-3.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    isActive
                      ? `${stage.activeCardClasses} shadow-sm`
                      : "bg-surface-container-lowest/85 dark:bg-surface-container/55 border-outline-variant/40 dark:border-outline-variant/25 hover:border-outline-variant/75 dark:hover:border-outline-variant/45 opacity-85 hover:opacity-100"
                  }`}
                >
                  {isActive && (
                    <m.span
                      layoutId="heroBlueprintActiveRail"
                      aria-hidden="true"
                      className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full ${stage.railClass}`}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${stage.iconClasses}`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-code text-[11px] text-outline font-medium">
                          {stage.index}
                        </span>
                        <span className="font-display text-sm font-semibold text-on-surface truncate">
                          {stage.title}
                        </span>
                      </div>
                      <span
                        className={`font-code text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 transition-opacity ${
                          isActive
                            ? `${stage.badgeClasses} opacity-100`
                            : "border-transparent text-outline opacity-0"
                        }`}
                      >
                        {stage.domainTag}
                      </span>
                    </div>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {stage.detail}
                    </p>
                  </div>
                </button>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <svg
                    width="20"
                    height="18"
                    viewBox="0 0 20 18"
                    className="ml-6 block"
                    aria-hidden="true"
                  >
                    <line
                      x1="10"
                      y1="0"
                      x2="10"
                      y2="18"
                      stroke="rgb(var(--stitch-outline-variant) / 0.5)"
                      strokeWidth="1"
                    />
                    <line
                      x1="10"
                      y1="0"
                      x2="10"
                      y2="18"
                      stroke={
                        idx === 0
                          ? "rgb(var(--stitch-primary))"
                          : "rgb(var(--stitch-secondary))"
                      }
                      strokeWidth="1.5"
                      strokeDasharray="4 8"
                      className="animate-signal-flow"
                    />
                    <path
                      d="M7 12L10 15L13 12"
                      fill="none"
                      stroke="rgb(var(--stitch-outline) / 0.65)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recessed Obsidian Stage Trace Console */}
      <div
        aria-live="polite"
        className="relative overflow-hidden bg-[#0D1117] text-slate-200 px-5 py-3.5 border-t border-outline-variant/40 dark:border-white/10"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 surface-grain" />
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={selectedStage.index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative z-10 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 pb-1">
              <span className="font-code text-[10px] uppercase tracking-[0.14em] text-slate-400">
                STAGE {selectedStage.index} · {selectedStage.domainTag}
              </span>
              <span className="font-code text-[10px] text-slate-300 truncate">
                {selectedStage.title}
              </span>
            </div>
            <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-2.5 gap-y-1 font-code text-[11px]">
              <span className="text-slate-400 uppercase">INPUT</span>
              <span
                className="text-slate-200 truncate"
                title={selectedStage.trace.input}
              >
                {selectedStage.trace.input}
              </span>
              <span className="text-slate-400 uppercase">ENGINE</span>
              <span
                className="text-sky-300 truncate"
                title={selectedStage.trace.engine}
              >
                {selectedStage.trace.engine}
              </span>
              <span className="text-slate-400 uppercase">OUTPUT</span>
              <span
                className="text-emerald-300 truncate"
                title={selectedStage.trace.output}
              >
                {selectedStage.trace.output}
              </span>
            </div>
          </m.div>
        </AnimatePresence>
      </div>

      {/* Identity & Decision Lab Footer */}
      <div className="px-5 py-3 border-t border-outline-variant/35 dark:border-outline-variant/25 bg-surface-container-low/65 dark:bg-surface-container/45 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <InteractiveAvatar3D variant="badge" name={name} />
          <span className="font-code text-[11px] text-on-surface-variant truncate">
            Interactive blueprint · Inspect stages
          </span>
        </div>
        <Link
          href="/lab"
          className="inline-flex items-center gap-1 font-code text-[11px] font-semibold text-primary hover:underline shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <span>S&amp;OP Lab</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
