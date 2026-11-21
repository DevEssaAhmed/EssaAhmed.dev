"use client";

import { useMemo, useState, type PointerEvent } from "react";
import {
  buildDistributionCurve,
  normCdf,
  normPdf,
  type SopMetrics,
} from "@/lib/sop-math";

interface DistributionChartProps {
  metrics: SopMetrics;
  baselineMetrics?: SopMetrics | null;
}

const VIEW_W = 640;
const VIEW_H = 248;
const MARGIN = { top: 42, right: 24, bottom: 34, left: 24 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;
const BASELINE_Y = MARGIN.top + PLOT_H;

function formatCompact(value: number): string {
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`;
  return Math.round(value).toLocaleString("en-US");
}

function toAreaPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return "";
  const line = pts
    .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const lastX = pts[pts.length - 1].x.toFixed(1);
  const firstX = pts[0].x.toFixed(1);
  return `${line} L${lastX},${BASELINE_Y} L${firstX},${BASELINE_Y} Z`;
}

function toStrokePath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return "";
  return pts
    .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}

export default function DistributionChart({
  metrics,
  baselineMetrics,
}: DistributionChartProps) {
  const [hoverDemand, setHoverDemand] = useState<number | null>(null);

  const chart = useMemo(() => {
    const std = metrics.leadTimeDemandStdDev;
    const mean = metrics.meanLeadTimeDemand;
    const rop = metrics.reorderPoint;

    if (std <= 0) {
      return {
        isDeterministic: true as const,
        mean,
        rop,
      };
    }

    const activeCurve = buildDistributionCurve(metrics, 96);
    const hasBaseline = Boolean(
      baselineMetrics && baselineMetrics.leadTimeDemandStdDev > 0
    );
    const baseCurve =
      hasBaseline && baselineMetrics
        ? buildDistributionCurve(baselineMetrics, 96)
        : [];

    const minX =
      baseCurve.length > 0
        ? Math.min(activeCurve[0].x, baseCurve[0].x)
        : activeCurve[0].x;
    const maxX =
      baseCurve.length > 0
        ? Math.max(
            activeCurve[activeCurve.length - 1].x,
            baseCurve[baseCurve.length - 1].x
          )
        : activeCurve[activeCurve.length - 1].x;
    const xSpan = Math.max(1e-6, maxX - minX);
    const maxPdf = Math.max(
      ...activeCurve.map((pt) => pt.pdf),
      ...baseCurve.map((pt) => pt.pdf),
      normPdf(0) / std
    );

    const mapX = (val: number) =>
      MARGIN.left + ((val - minX) / xSpan) * PLOT_W;
    const mapY = (pdf: number) =>
      BASELINE_Y - (pdf / (maxPdf * 1.12)) * PLOT_H;

    const meanPdfPt = { x: mapX(mean), y: mapY(normPdf(0) / std) };
    const ropPdfPt = {
      x: mapX(rop),
      y: mapY(normPdf(metrics.zScore) / std),
    };

    const allSvgPts = activeCurve.map((pt) => ({
      x: mapX(pt.x),
      y: mapY(pt.pdf),
      rawX: pt.x,
    }));

    const expectedPts = [
      ...allSvgPts.filter((p) => p.rawX < mean).map(({ x, y }) => ({ x, y })),
      meanPdfPt,
    ];
    const bufferPts = [
      meanPdfPt,
      ...allSvgPts
        .filter((p) => p.rawX > mean && p.rawX < rop)
        .map(({ x, y }) => ({ x, y })),
      ropPdfPt,
    ];
    const stockoutPts = [
      ropPdfPt,
      ...allSvgPts.filter((p) => p.rawX > rop).map(({ x, y }) => ({ x, y })),
    ];

    const baselineStrokePath =
      baseCurve.length > 0
        ? toStrokePath(
            baseCurve.map((pt) => ({ x: mapX(pt.x), y: mapY(pt.pdf) }))
          )
        : null;
    const baselineRopX =
      hasBaseline && baselineMetrics
        ? mapX(baselineMetrics.reorderPoint)
        : null;

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = minX + t * xSpan;
      return { x: mapX(val), label: formatCompact(val) };
    });

    return {
      isDeterministic: false as const,
      mean,
      std,
      rop,
      minX,
      maxX,
      xSpan,
      maxPdf,
      meanX: meanPdfPt.x,
      ropX: ropPdfPt.x,
      baselineRopX,
      baselineStrokePath,
      expectedPath: toAreaPath(expectedPts),
      bufferPath: toAreaPath(bufferPts),
      stockoutPath: toAreaPath(stockoutPts),
      strokePath: toStrokePath(allSvgPts.map(({ x, y }) => ({ x, y }))),
      ticks,
    };
  }, [metrics, baselineMetrics]);

  if (chart.isDeterministic) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-outline-variant/35 bg-surface-container-low/50 p-6 flex flex-col items-center justify-center text-center min-h-[210px]">
          <div className="font-code text-xs uppercase tracking-[0.14em] text-outline mb-2">
            Deterministic Regime (σ_LT = 0)
          </div>
          <div className="font-display text-2xl font-bold text-on-surface tabular-nums">
            ROP = Mean Lead-Time Demand = {formatCompact(chart.mean)} units
          </div>
          <p className="font-body-md text-xs text-on-surface-variant max-w-md mt-2">
            Both daily demand and supplier lead-time standard deviations are zero, so no probabilistic safety buffer is required.
          </p>
        </div>
      </div>
    );
  }

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    if (svgX < MARGIN.left || svgX > VIEW_W - MARGIN.right) {
      setHoverDemand(null);
      return;
    }
    const demandVal =
      chart.minX + ((svgX - MARGIN.left) / PLOT_W) * chart.xSpan;
    setHoverDemand(demandVal);
  };

  const hoverStats = (() => {
    if (hoverDemand === null) return null;
    const z = (hoverDemand - chart.mean) / chart.std;
    const pdf = normPdf(z) / chart.std;
    const hx =
      MARGIN.left + ((hoverDemand - chart.minX) / chart.xSpan) * PLOT_W;
    const hy = BASELINE_Y - (pdf / (chart.maxPdf * 1.12)) * PLOT_H;
    const coveredPct = normCdf(z) * 100;
    const riskPct = (1 - normCdf(z)) * 100;
    const boxW = 204;
    const boxH = 24;
    const flipLeft = hx > VIEW_W - MARGIN.right - boxW - 10;
    const boxX = flipLeft ? hx - boxW - 8 : hx + 8;
    const boxY = Math.max(MARGIN.top + 4, Math.min(BASELINE_Y - boxH - 8, hy - 28));

    return {
      demandVal: hoverDemand,
      hx,
      hy,
      coveredPct,
      riskPct,
      boxW,
      boxH,
      boxX,
      boxY,
    };
  })();

  const labelGap = chart.ropX - chart.meanX;
  const ropTextAnchor = chart.ropX > VIEW_W - 115 ? "end" : "start";
  const ropTextX = ropTextAnchor === "end" ? chart.ropX - 6 : chart.ropX + 6;
  const meanTextX = labelGap < 85 ? chart.meanX - 6 : chart.meanX;
  const meanTextAnchor = labelGap < 85 ? "end" : "middle";

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={`Lead-time demand normal distribution centered at ${Math.round(
          chart.mean
        )} units with reorder point at ${Math.round(chart.rop)} units`}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverDemand(null)}
        className="w-full h-auto overflow-visible select-none cursor-crosshair"
      >
        <title>Lead-time demand probability distribution and safety stock buffer</title>
        <desc>
          Probability density curve showing expected demand up to{" "}
          {Math.round(chart.mean)} units, safety stock buffer of{" "}
          {Math.round(metrics.safetyStock)} units up to the reorder point of{" "}
          {Math.round(chart.rop)} units, and residual stockout probability of{" "}
          {metrics.stockoutRiskPct.toFixed(1)} percent.
        </desc>

        {/* Horizontal Gridlines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = BASELINE_Y - frac * PLOT_H;
          return (
            <line
              key={frac}
              x1={MARGIN.left}
              y1={y}
              x2={VIEW_W - MARGIN.right}
              y2={y}
              stroke="rgb(var(--stitch-outline-variant) / 0.35)"
              strokeDasharray="3 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Shaded Distribution Zones */}
        <path d={chart.expectedPath} fill="rgb(var(--stitch-primary) / 0.14)" />
        <path d={chart.bufferPath} fill="rgb(var(--stitch-secondary) / 0.24)" />
        <path d={chart.stockoutPath} fill="rgb(var(--stitch-tertiary) / 0.3)" />

        {/* Baseline Ghost Curve & ROP Marker (when pinned) */}
        {chart.baselineStrokePath && (
          <path
            d={chart.baselineStrokePath}
            fill="none"
            stroke="rgb(var(--stitch-outline) / 0.65)"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
        )}
        {chart.baselineRopX !== null && (
          <g>
            <line
              x1={chart.baselineRopX}
              y1={MARGIN.top + 8}
              x2={chart.baselineRopX}
              y2={BASELINE_Y}
              stroke="rgb(var(--stitch-outline))"
              strokeDasharray="2 3"
              strokeWidth="1.5"
            />
            <text
              x={chart.baselineRopX}
              y={BASELINE_Y - 8}
              textAnchor="middle"
              fill="rgb(var(--stitch-outline))"
              fontSize="10"
              fontFamily="var(--font-mono), monospace"
            >
              BASE
            </text>
          </g>
        )}

        {/* Smooth Active PDF Curve */}
        <path
          d={chart.strokePath}
          fill="none"
          stroke="rgb(var(--stitch-primary))"
          strokeWidth="2.25"
          strokeLinecap="round"
        />

        {/* Mean Lead-Time Demand Marker */}
        <line
          x1={chart.meanX}
          y1={20}
          x2={chart.meanX}
          y2={BASELINE_Y}
          stroke="rgb(var(--stitch-outline))"
          strokeDasharray="4 3"
          strokeWidth="1.5"
        />
        <text
          x={meanTextX}
          y={13}
          textAnchor={meanTextAnchor}
          fill="rgb(var(--stitch-on-surface-variant))"
          fontSize="11"
          fontFamily="var(--font-mono), monospace"
        >
          {`μ_LT ${formatCompact(chart.mean)}`}
        </text>

        {/* Safety Stock Bracket Indicator */}
        {labelGap > 26 && (
          <g>
            <line
              x1={chart.meanX}
              y1={28}
              x2={chart.ropX}
              y2={28}
              stroke="rgb(var(--stitch-secondary))"
              strokeWidth="1.5"
            />
            <circle cx={chart.meanX} cy={28} r="2.2" fill="rgb(var(--stitch-secondary))" />
            <circle cx={chart.ropX} cy={28} r="2.2" fill="rgb(var(--stitch-secondary))" />
            {labelGap > 58 && (
              <text
                x={(chart.meanX + chart.ropX) / 2}
                y={24}
                textAnchor="middle"
                fill="rgb(var(--stitch-secondary))"
                fontSize="10"
                fontWeight="600"
                fontFamily="var(--font-mono), monospace"
              >
                {`+SS ${formatCompact(metrics.safetyStock)}`}
              </text>
            )}
          </g>
        )}

        {/* Reorder Point Marker */}
        <line
          x1={chart.ropX}
          y1={16}
          x2={chart.ropX}
          y2={BASELINE_Y}
          stroke="rgb(var(--stitch-secondary))"
          strokeWidth="2"
        />
        <text
          x={ropTextX}
          y={13}
          textAnchor={ropTextAnchor}
          fill="rgb(var(--stitch-secondary))"
          fontSize="11"
          fontWeight="600"
          fontFamily="var(--font-mono), monospace"
        >
          {`ROP ${formatCompact(chart.rop)}`}
        </text>

        {/* Interactive Hover Crosshair & Percentile Probe */}
        {hoverStats && (
          <g className="pointer-events-none">
            <line
              x1={hoverStats.hx}
              y1={MARGIN.top}
              x2={hoverStats.hx}
              y2={BASELINE_Y}
              stroke="rgb(var(--stitch-on-surface) / 0.45)"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <circle
              cx={hoverStats.hx}
              cy={hoverStats.hy}
              r="5"
              fill="rgb(var(--stitch-surface-container-lowest))"
              stroke="rgb(var(--stitch-primary))"
              strokeWidth="2"
            />
            <rect
              x={hoverStats.boxX}
              y={hoverStats.boxY}
              width={hoverStats.boxW}
              height={hoverStats.boxH}
              rx="6"
              fill="rgba(13, 17, 23, 0.94)"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="1"
            />
            <text
              x={hoverStats.boxX + 10}
              y={hoverStats.boxY + 15.5}
              fill="#F8FAFC"
              fontSize="10"
              fontFamily="var(--font-mono), monospace"
            >
              {`${Math.round(hoverStats.demandVal).toLocaleString(
                "en-US"
              )}u · ${hoverStats.coveredPct.toFixed(
                1
              )}% cov · ${hoverStats.riskPct.toFixed(1)}% risk`}
            </text>
          </g>
        )}

        {/* Baseline Axis */}
        <line
          x1={MARGIN.left}
          y1={BASELINE_Y}
          x2={VIEW_W - MARGIN.right}
          y2={BASELINE_Y}
          stroke="rgb(var(--stitch-outline-variant) / 0.7)"
          strokeWidth="1"
        />

        {/* X-Axis Ticks */}
        {chart.ticks.map((tick, idx) => (
          <text
            key={idx}
            x={tick.x}
            y={BASELINE_Y + 18}
            textAnchor={
              idx === 0 ? "start" : idx === chart.ticks.length - 1 ? "end" : "middle"
            }
            fill="rgb(var(--stitch-outline))"
            fontSize="10"
            fontFamily="var(--font-mono), monospace"
          >
            {tick.label}
          </text>
        ))}
      </svg>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] font-code text-on-surface-variant">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/35 border border-primary/60" />
            <span>Expected Demand (&le; μ_LT)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-secondary/45 border border-secondary/70" />
            <span>Safety Stock Buffer</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-tertiary/50 border border-tertiary/80" />
            <span>Stockout Tail ({metrics.stockoutRiskPct.toFixed(1)}%)</span>
          </span>
          {chart.baselineStrokePath && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 border-t border-dashed border-outline" />
              <span>Pinned Baseline</span>
            </span>
          )}
        </div>
        <span className="text-outline">Hover curve to inspect percentile</span>
      </div>
    </div>
  );
}
