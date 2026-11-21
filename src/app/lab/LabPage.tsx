"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  Code2,
  Copy,
  Layers,
  Pin,
  PinOff,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import DistributionChart from "@/components/lab/DistributionChart";
import TradeoffCurveChart from "@/components/lab/TradeoffCurveChart";
import CodeExportPanel from "@/components/lab/CodeExportPanel";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useProfile } from "@/contexts/ProfileContext";
import {
  SERVICE_LEVEL_OPTIONS,
  SOP_PRESETS,
  buildServiceLevelTradeoff,
  calculateSopMetrics,
  generateSopCodeSnippets,
  type SopInputs,
} from "@/lib/sop-math";

const DEFAULT_PRESET = SOP_PRESETS[0];

function sliderStyle(value: number, min: number, max: number): CSSProperties {
  const pct = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  return { "--slider-pct": `${pct}%` } as CSSProperties;
}

function formatUnits(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function DeltaPill({
  delta,
  unit = "",
  prefix = "",
  invertGood = false,
}: {
  delta: number | null;
  unit?: string;
  prefix?: string;
  invertGood?: boolean;
}) {
  if (delta === null || Math.abs(delta) < 0.5) return null;
  const isPositive = delta > 0;
  const isFavorable = invertGood ? !isPositive : isPositive;
  const formatted = `${isPositive ? "+" : "-"}${prefix}${Math.abs(
    Math.round(delta)
  ).toLocaleString("en-US")}${unit}`;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded font-code text-[10px] font-medium tabular-nums ${
        isFavorable
          ? "bg-secondary/12 text-secondary border border-secondary/25"
          : "bg-tertiary/12 text-tertiary border border-tertiary/25"
      }`}
    >
      {formatted} vs base
    </span>
  );
}

export default function LabPage() {
  const { profile } = useProfile();
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    DEFAULT_PRESET.id
  );
  const [inputs, setInputs] = useState<SopInputs>(DEFAULT_PRESET.inputs);
  const [baselineInputs, setBaselineInputs] = useState<SopInputs | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const metrics = useMemo(() => calculateSopMetrics(inputs), [inputs]);
  const baselineMetrics = useMemo(
    () => (baselineInputs ? calculateSopMetrics(baselineInputs) : null),
    [baselineInputs]
  );
  const tradeoffPoints = useMemo(
    () => buildServiceLevelTradeoff(inputs),
    [inputs]
  );
  const codeSnippets = useMemo(
    () => generateSopCodeSnippets(inputs, metrics),
    [inputs, metrics]
  );

  const email = profile?.email || "essaahmedsiddiqui@gmail.com";

  const updateInput = <K extends keyof SopInputs>(key: K, value: SopInputs[K]) => {
    setSelectedPresetId(null);
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetId: string) => {
    const preset = SOP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setInputs(preset.inputs);
  };

  const handleReset = () => {
    setSelectedPresetId(DEFAULT_PRESET.id);
    setInputs(DEFAULT_PRESET.inputs);
    setBaselineInputs(null);
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const demandCvPct =
    inputs.avgDailyDemand > 0
      ? Math.round((inputs.demandStdDev / inputs.avgDailyDemand) * 100)
      : 0;

  const ssAt95 = tradeoffPoints.find((pt) => pt.csl === 0.95)?.safetyStock ?? 0;
  const ssAt995 = tradeoffPoints.find((pt) => pt.csl === 0.995)?.safetyStock ?? 0;
  const jumpPct95To995 =
    ssAt95 > 0 ? Math.round(((ssAt995 - ssAt95) / ssAt95) * 100) : 0;

  const activePreset = SOP_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-[1080px] w-full mx-auto px-6 pt-12 md:pt-16 pb-20 space-y-12"
      >
        {/* 1. HEADER & SCENARIO PRESETS */}
        <header className="pb-8 border-b border-outline-variant/30 space-y-6">
          <div className="space-y-3">
            <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block">
              01 / SYSTEMS LAB
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.08]">
              S&amp;OP Safety Stock &amp;{" "}
              <span className="text-primary">Reorder Simulator</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Model combined demand volatility and supplier lead-time uncertainty in real time. Stress-test service-level buffers, decompose risk drivers, and export production formulas in Python, SQL, and Power BI DAX.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* Scenarios */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-code text-[11px] uppercase tracking-wider text-outline mr-1">
                Scenarios:
              </span>
              {SOP_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    aria-pressed={isSelected}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-label-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isSelected
                        ? "bg-on-surface text-surface border-on-surface font-semibold shadow-sm"
                        : "bg-surface-container-low dark:bg-surface-container border-outline-variant/45 dark:border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Baseline & Reset */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setBaselineInputs((prev) => (prev ? null : { ...inputs }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-code border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  baselineInputs
                    ? "bg-primary/10 border-primary/35 text-primary font-semibold"
                    : "bg-surface-container-low border-outline-variant/45 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {baselineInputs ? (
                  <>
                    <PinOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Clear Baseline</span>
                  </>
                ) : (
                  <>
                    <Pin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pin Baseline</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-code border border-outline-variant/45 bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {activePreset && (
            <p className="font-code text-xs text-outline">
              Active profile: {activePreset.description}
            </p>
          )}
        </header>

        {/* 2. PRIMARY WORKBENCH: CONTROLS + KPI MATRIX + DISTRIBUTION */}
        <section aria-label="Simulation parameters and lead-time distribution">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Left Parameter Controls */}
            <div className="lg:col-span-5 rounded-2xl card-elevated border p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-outline-variant/25 pb-3.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    className="w-4 h-4 text-primary"
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-sm font-semibold text-on-surface">
                    SKU &amp; Supplier Parameters
                  </h2>
                </div>
                <span className="font-code text-[11px] text-outline">
                  Stochastic ROP
                </span>
              </div>

              {/* Avg Daily Demand */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="slider-demand-mean"
                    className="font-medium text-on-surface"
                  >
                    Avg Daily Demand (d&#772;)
                  </label>
                  <span className="font-code font-semibold text-on-surface tabular-nums">
                    {inputs.avgDailyDemand} units/day
                  </span>
                </div>
                <input
                  id="slider-demand-mean"
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={inputs.avgDailyDemand}
                  style={sliderStyle(inputs.avgDailyDemand, 10, 500)}
                  onChange={(e) =>
                    updateInput("avgDailyDemand", Number(e.target.value))
                  }
                  className="lab-slider"
                />
              </div>

              {/* Demand Std Dev */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="slider-demand-std"
                    className="font-medium text-on-surface"
                  >
                    Daily Demand Volatility (&sigma;_d)
                  </label>
                  <span className="font-code font-semibold text-primary tabular-nums">
                    &plusmn;{inputs.demandStdDev} units ({demandCvPct}% CV)
                  </span>
                </div>
                <input
                  id="slider-demand-std"
                  type="range"
                  min={0}
                  max={150}
                  step={1}
                  value={inputs.demandStdDev}
                  style={sliderStyle(inputs.demandStdDev, 0, 150)}
                  onChange={(e) =>
                    updateInput("demandStdDev", Number(e.target.value))
                  }
                  className="lab-slider"
                />
              </div>

              {/* Avg Supplier Lead Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="slider-lt-mean"
                    className="font-medium text-on-surface"
                  >
                    Mean Supplier Lead Time (L&#772;)
                  </label>
                  <span className="font-code font-semibold text-on-surface tabular-nums">
                    {inputs.avgLeadTimeDays} days
                  </span>
                </div>
                <input
                  id="slider-lt-mean"
                  type="range"
                  min={1}
                  max={60}
                  step={1}
                  value={inputs.avgLeadTimeDays}
                  style={sliderStyle(inputs.avgLeadTimeDays, 1, 60)}
                  onChange={(e) =>
                    updateInput("avgLeadTimeDays", Number(e.target.value))
                  }
                  className="lab-slider"
                />
              </div>

              {/* Lead Time Std Dev */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="slider-lt-std"
                    className="font-medium text-on-surface"
                  >
                    Lead-Time Std Dev (&sigma;_L)
                  </label>
                  <span className="font-code font-semibold text-secondary tabular-nums">
                    &plusmn;{inputs.leadTimeStdDevDays.toFixed(1)} days
                  </span>
                </div>
                <input
                  id="slider-lt-std"
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={inputs.leadTimeStdDevDays}
                  style={sliderStyle(inputs.leadTimeStdDevDays, 0, 15)}
                  onChange={(e) =>
                    updateInput("leadTimeStdDevDays", Number(e.target.value))
                  }
                  className="lab-slider"
                />
              </div>

              {/* Cycle Service Level Segmented Selector */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-on-surface">
                    Target Cycle Service Level
                  </span>
                  <span className="font-code text-outline tabular-nums">
                    z = {metrics.zScore.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {SERVICE_LEVEL_OPTIONS.map((csl) => {
                    const isSelected = Math.abs(inputs.serviceLevel - csl) < 0.002;
                    const label =
                      csl === 0.995 ? "99.5%" : `${Math.round(csl * 100)}%`;
                    return (
                      <button
                        key={csl}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => updateInput("serviceLevel", csl)}
                        className={`py-2 rounded-lg text-xs font-code transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isSelected
                            ? "bg-primary text-on-primary border-primary font-semibold shadow-sm"
                            : "bg-surface-container-low dark:bg-surface-container border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Financial & Review Cycle Inputs */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline-variant/25">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label
                      htmlFor="slider-holding-cost"
                      className="text-on-surface-variant"
                    >
                      Holding Cost/yr
                    </label>
                    <span className="font-code font-semibold text-on-surface tabular-nums">
                      ${inputs.unitHoldingCostYear}
                    </span>
                  </div>
                  <input
                    id="slider-holding-cost"
                    type="range"
                    min={4}
                    max={120}
                    step={2}
                    value={inputs.unitHoldingCostYear}
                    style={sliderStyle(inputs.unitHoldingCostYear, 4, 120)}
                    onChange={(e) =>
                      updateInput("unitHoldingCostYear", Number(e.target.value))
                    }
                    className="lab-slider"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label
                      htmlFor="slider-order-cycle"
                      className="text-on-surface-variant"
                    >
                      Order Cycle
                    </label>
                    <span className="font-code font-semibold text-on-surface tabular-nums">
                      {inputs.orderCycleDays}d
                    </span>
                  </div>
                  <input
                    id="slider-order-cycle"
                    type="range"
                    min={7}
                    max={60}
                    step={1}
                    value={inputs.orderCycleDays}
                    style={sliderStyle(inputs.orderCycleDays, 7, 60)}
                    onChange={(e) =>
                      updateInput("orderCycleDays", Number(e.target.value))
                    }
                    className="lab-slider"
                  />
                </div>
              </div>
            </div>

            {/* Right Outputs: 4 KPIs + Normal Distribution Curve */}
            <div className="lg:col-span-7 space-y-6">
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <SpotlightCard className="rounded-2xl card-elevated border p-4">
                  <div className="space-y-1.5">
                    <div className="font-code text-[10px] uppercase tracking-[0.12em] text-outline">
                      Reorder Point
                    </div>
                    <div className="font-display text-2xl font-bold text-on-surface tabular-nums">
                      {formatUnits(metrics.reorderPoint)}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-code text-[11px] text-on-surface-variant">
                        &mu;={formatUnits(metrics.meanLeadTimeDemand)}u
                      </span>
                      <DeltaPill
                        delta={
                          baselineMetrics
                            ? metrics.reorderPoint - baselineMetrics.reorderPoint
                            : null
                        }
                        unit="u"
                        invertGood
                      />
                    </div>
                  </div>
                </SpotlightCard>

                <SpotlightCard className="rounded-2xl card-elevated border p-4">
                  <div className="space-y-1.5">
                    <div className="font-code text-[10px] uppercase tracking-[0.12em] text-outline">
                      Safety Stock
                    </div>
                    <div className="font-display text-2xl font-bold text-secondary tabular-nums">
                      {formatUnits(metrics.safetyStock)}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-code text-[11px] text-on-surface-variant">
                        {metrics.safetyCoverDays.toFixed(1)}d cover
                      </span>
                      <DeltaPill
                        delta={
                          baselineMetrics
                            ? metrics.safetyStock - baselineMetrics.safetyStock
                            : null
                        }
                        unit="u"
                        invertGood
                      />
                    </div>
                  </div>
                </SpotlightCard>

                <SpotlightCard className="rounded-2xl card-elevated border p-4">
                  <div className="space-y-1.5">
                    <div className="font-code text-[10px] uppercase tracking-[0.12em] text-outline">
                      Buffer Cost/yr
                    </div>
                    <div className="font-display text-2xl font-bold text-primary tabular-nums">
                      {formatCurrency(metrics.annualCarryingCost)}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-code text-[11px] text-on-surface-variant">
                        at ${inputs.unitHoldingCostYear}/u
                      </span>
                      <DeltaPill
                        delta={
                          baselineMetrics
                            ? metrics.annualCarryingCost -
                              baselineMetrics.annualCarryingCost
                            : null
                        }
                        prefix="$"
                        invertGood
                      />
                    </div>
                  </div>
                </SpotlightCard>

                <SpotlightCard className="rounded-2xl card-elevated border p-4">
                  <div className="space-y-1.5">
                    <div className="font-code text-[10px] uppercase tracking-[0.12em] text-outline">
                      Est. Fill Rate
                    </div>
                    <div className="font-display text-2xl font-bold text-on-surface tabular-nums">
                      {metrics.estimatedFillRatePct.toFixed(2)}%
                    </div>
                    <div className="font-code text-[11px] text-on-surface-variant tabular-nums">
                      E[short] {metrics.expectedShortagePerCycle.toFixed(1)}u/cycle
                    </div>
                  </div>
                </SpotlightCard>
              </div>

              {/* Distribution Visualization */}
              <div className="rounded-2xl card-elevated border p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/25">
                  <div>
                    <span className="font-code text-[10px] uppercase tracking-[0.14em] text-outline block">
                      02 / LEAD-TIME DEMAND DISTRIBUTION
                    </span>
                    <h2 className="font-display text-base font-semibold text-on-surface mt-0.5">
                      Stockout Threshold &amp; Buffer Region
                    </h2>
                  </div>
                  <div className="font-code text-xs px-2.5 py-1 rounded-md bg-surface-container-low dark:bg-surface-container border border-outline-variant/40 text-on-surface tabular-nums">
                    &sigma;_LT = {Math.round(metrics.leadTimeDemandStdDev).toLocaleString("en-US")} units
                  </div>
                </div>

                <DistributionChart
                  metrics={metrics}
                  baselineMetrics={baselineMetrics}
                />

                {/* Live Substituted Formula Readout */}
                <div className="rounded-xl bg-surface-container-low/80 dark:bg-[#0D1117] border border-outline-variant/35 px-4 py-3 font-code text-[11px] sm:text-xs flex flex-wrap items-center justify-between gap-2 tabular-nums">
                  <span className="text-on-surface-variant dark:text-slate-300">
                    SS = {metrics.zScore.toFixed(2)} &times; &radic;(
                    {inputs.avgLeadTimeDays}&times;{inputs.demandStdDev}&sup2; +{" "}
                    {inputs.avgDailyDemand}&sup2;&times;
                    {inputs.leadTimeStdDevDays.toFixed(1)}&sup2;) ={" "}
                    <strong className="text-secondary">
                      {formatUnits(metrics.safetyStock)}u
                    </strong>
                  </span>
                  <span className="text-on-surface-variant dark:text-slate-300">
                    ROP = {formatUnits(metrics.meanLeadTimeDemand)} +{" "}
                    {formatUnits(metrics.safetyStock)} ={" "}
                    <strong className="text-primary">
                      {formatUnits(metrics.reorderPoint)}u
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. VARIANCE ATTRIBUTION & SERVICE-LEVEL COST CURVE */}
        <section className="space-y-6">
          <div className="pb-5 border-b border-outline-variant/30">
            <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
              03 / SENSITIVITY &amp; TRADEOFF ANALYSIS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Where Inventory Risk Concentrates
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Risk Driver Decomposition */}
            <div className="lg:col-span-6 rounded-2xl card-elevated border p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-secondary" aria-hidden="true" />
                    <h3 className="font-display text-base font-semibold text-on-surface">
                      Variance Attribution (L&middot;&sigma;_d&sup2; vs d&#772;&sup2;&middot;&sigma;_L&sup2;)
                    </h3>
                  </div>
                  <span className="font-code text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container border border-outline-variant/35 text-on-surface-variant">
                    {metrics.dominantDriver === "lead_time"
                      ? "Lead-Time Driven"
                      : metrics.dominantDriver === "demand"
                      ? "Demand Driven"
                      : metrics.dominantDriver === "deterministic"
                      ? "Zero Variance"
                      : "Balanced Risk"}
                  </span>
                </div>

                {/* Stacked Proportion Bar */}
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full overflow-hidden bg-surface-container flex">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${metrics.demandVarianceShare}%` }}
                      title={`Demand volatility: ${metrics.demandVarianceShare.toFixed(1)}%`}
                    />
                    <div
                      className="h-full bg-secondary transition-all duration-300"
                      style={{ width: `${metrics.leadTimeVarianceShare}%` }}
                      title={`Lead-time variance: ${metrics.leadTimeVarianceShare.toFixed(1)}%`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 font-code text-xs tabular-nums">
                    <span className="inline-flex items-center gap-1.5 text-on-surface">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Demand Vol: {metrics.demandVarianceShare.toFixed(1)}%
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-on-surface">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      Lead-Time Jitter: {metrics.leadTimeVarianceShare.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Actionable Levers Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-outline-variant/25">
                <SpotlightCard className="rounded-xl bg-surface-container-low/70 dark:bg-surface-container p-4 border border-outline-variant/35">
                  <div className="space-y-1">
                    <div className="font-code text-[10px] uppercase tracking-wider text-outline">
                      Lever A · Stabilize Supplier SLA
                    </div>
                    <div className="font-display text-sm font-semibold text-on-surface">
                      Cut &sigma;_L by {metrics.leadTimeReductionSavings.appliedDeltaDays.toFixed(1)}d
                    </div>
                    <div className="font-code text-xs text-secondary font-semibold tabular-nums">
                      Saves {formatUnits(metrics.leadTimeReductionSavings.deltaUnits)}u (
                      {formatCurrency(metrics.leadTimeReductionSavings.deltaCostYear)}/yr)
                    </div>
                  </div>
                </SpotlightCard>

                <SpotlightCard className="rounded-xl bg-surface-container-low/70 dark:bg-surface-container p-4 border border-outline-variant/35">
                  <div className="space-y-1">
                    <div className="font-code text-[10px] uppercase tracking-wider text-outline">
                      Lever B · Sharpen Forecast
                    </div>
                    <div className="font-display text-sm font-semibold text-on-surface">
                      Cut &sigma;_d by 20%
                    </div>
                    <div className="font-code text-xs text-primary font-semibold tabular-nums">
                      Saves {formatUnits(metrics.demandReductionSavings.deltaUnits)}u (
                      {formatCurrency(metrics.demandReductionSavings.deltaCostYear)}/yr)
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            </div>

            {/* Service-Level Escalation Curve */}
            <div className="lg:col-span-6 rounded-2xl card-elevated border p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" aria-hidden="true" />
                  <h3 className="font-display text-base font-semibold text-on-surface">
                    Buffer Cost vs Service Level
                  </h3>
                </div>
                <span className="font-code text-[11px] text-outline">
                  Click any node to apply
                </span>
              </div>

              <TradeoffCurveChart
                points={tradeoffPoints}
                activeServiceLevel={inputs.serviceLevel}
                onSelectServiceLevel={(csl) => updateInput("serviceLevel", csl)}
              />

              <p className="font-code text-xs text-on-surface-variant pt-2 border-t border-outline-variant/25 leading-relaxed">
                {metrics.leadTimeDemandStdDev > 0
                  ? `Raising service target from 95% to 99.5% increases safety buffer by +${jumpPct95To995}% (${formatUnits(
                      ssAt95
                    )}u -> ${formatUnits(ssAt995)}u) due to normal-tail steepening.`
                  : "With zero variance across demand and lead time, all service levels require 0 buffer units."}
              </p>
            </div>
          </div>
        </section>

        {/* 4. PRODUCTION IMPLEMENTATION SNIPPETS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 border-b border-outline-variant/30 gap-4">
            <div>
              <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
                04 / PRODUCTION IMPLEMENTATION
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2.5">
                <Code2 className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />
                <span>Deployable Policy Logic</span>
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 font-code text-xs text-on-surface-variant">
              <Layers className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
              <span>Synchronized with active parameters</span>
            </span>
          </div>

          <CodeExportPanel snippets={codeSnippets} />
        </section>

        {/* 5. INVERTED HIGH-CONTRAST CTA BANNER */}
        <section className="pt-2">
          <ScrollReveal>
            <div className="rounded-2xl bg-inverse-surface text-inverse-on-surface dark:bg-surface-container-low dark:text-on-surface border border-on-surface/10 dark:border-outline-variant/40 p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60 [background-size:32px_32px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 surface-grain" />
              <span
                aria-hidden="true"
                className="pointer-events-none select-none absolute top-2 left-2.5 font-code text-[11px] leading-none text-inverse-on-surface/35 dark:text-outline/45"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none select-none absolute top-2 right-2.5 font-code text-[11px] leading-none text-inverse-on-surface/35 dark:text-outline/45"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none select-none absolute bottom-2 left-2.5 font-code text-[11px] leading-none text-inverse-on-surface/35 dark:text-outline/45"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none select-none absolute bottom-2 right-2.5 font-code text-[11px] leading-none text-inverse-on-surface/35 dark:text-outline/45"
              >
                +
              </span>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/20 blur-[100px]"
              />

              <div className="relative z-10">
                <span className="inline-block font-code text-[11px] uppercase tracking-[0.16em] text-inverse-on-surface/70 dark:text-outline mb-4">
                  FROM MODEL TO PRODUCTION
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight max-w-2xl mx-auto">
                  Need automated S&amp;OP or ERP inventory optimization across real SKUs?
                </h2>
                <p className="text-inverse-on-surface/75 dark:text-on-surface-variant font-body-lg text-body-lg max-w-xl mx-auto mt-4 leading-relaxed">
                  I translate stochastic inventory policy into scheduled Python/SQL pipelines and executive Power BI control towers.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                  <a
                    href={`mailto:${email}`}
                    className="group bg-surface text-on-surface dark:bg-on-surface dark:text-surface font-label-md text-label-md font-semibold px-6 py-3 rounded-full hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>Discuss a System</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="bg-white/10 hover:bg-white/15 border border-white/15 text-inverse-on-surface dark:bg-surface-container dark:hover:bg-surface-container-high dark:border-outline-variant/40 dark:text-on-surface font-code text-label-md px-5 py-3 rounded-full hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>{copiedEmail ? "Copied to clipboard!" : email}</span>
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-emerald-400 dark:text-secondary" />
                    ) : (
                      <Copy className="w-4 h-4 text-inverse-on-surface/70 dark:text-outline" />
                    )}
                  </button>
                  <Link
                    href="/projects"
                    className="text-xs font-code text-inverse-on-surface/80 dark:text-on-surface-variant hover:underline px-2 py-1"
                  >
                    Browse Case Studies &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <OptimizedFooter />
    </div>
  );
}
