import { Zap, Package, LineChart } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { OptimizedImage } from "@/components/OptimizedImage";

interface HeroSystemDiagramProps {
  avatarUrl?: string | null;
  name?: string;
}

const PIPELINE_STAGES = [
  {
    index: "01",
    title: "Ingest & Automate",
    detail: "ERP, spreadsheets & webhooks → Python / Airflow",
    icon: Zap,
    iconClasses: "text-primary bg-primary/10 border-primary/20",
  },
  {
    index: "02",
    title: "Model & Forecast",
    detail: "Multi-echelon S&OP demand, safety stock & vendor OTIF",
    icon: Package,
    iconClasses: "text-secondary bg-secondary/10 border-secondary/20",
  },
  {
    index: "03",
    title: "Decide & Monitor",
    detail: "Dimensional star schemas → Executive Power BI",
    icon: LineChart,
    iconClasses: "text-tertiary bg-tertiary/10 border-tertiary/20",
  },
] as const;

export default function HeroSystemDiagram({
  avatarUrl,
  name = "Essa Ahmed",
}: HeroSystemDiagramProps) {
  const hasValidAvatar =
    typeof avatarUrl === "string" &&
    avatarUrl.trim().length > 0 &&
    !avatarUrl.includes("placeholder");

  return (
    <div
      aria-label="Decision systems architecture overview"
      className="rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/55 dark:border-outline-variant/35 shadow-sm overflow-hidden"
    >
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
            return (
              <div key={stage.index}>
                <div className="rounded-xl bg-surface-container-lowest/95 dark:bg-surface-container/85 border border-outline-variant/45 dark:border-outline-variant/30 p-3.5 flex items-start gap-3.5 shadow-sm">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${stage.iconClasses}`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-code text-[11px] text-outline font-medium">
                        {stage.index}
                      </span>
                      <span className="font-display text-sm font-semibold text-on-surface">
                        {stage.title}
                      </span>
                    </div>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {stage.detail}
                    </p>
                  </div>
                </div>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="w-px h-3 bg-outline-variant/55 dark:bg-outline-variant/40 ml-8"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Identity & Engineering Discipline Footer */}
      <div className="px-5 py-3 border-t border-outline-variant/35 dark:border-outline-variant/25 bg-surface-container-low/45 dark:bg-surface-container/35 flex items-center gap-2.5">
        {hasValidAvatar ? (
          <OptimizedImage
            src={avatarUrl}
            alt={name}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover border border-outline-variant/40 shrink-0"
          />
        ) : (
          <BrandMark size="sm" />
        )}
        <span className="font-code text-[11px] text-on-surface-variant truncate">
          Production-first systems · Zero manual reporting
        </span>
      </div>
    </div>
  );
}
