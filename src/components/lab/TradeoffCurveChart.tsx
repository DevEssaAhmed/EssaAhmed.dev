"use client";

import { useMemo } from "react";
import type { TradeoffPoint } from "@/lib/sop-math";

interface TradeoffCurveChartProps {
  points: TradeoffPoint[];
  activeServiceLevel: number;
  onSelectServiceLevel: (csl: number) => void;
}

const VIEW_W = 440;
const VIEW_H = 198;
const MARGIN = { top: 24, right: 24, bottom: 32, left: 48 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;
const BASELINE_Y = MARGIN.top + PLOT_H;

function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

export default function TradeoffCurveChart({
  points,
  activeServiceLevel,
  onSelectServiceLevel,
}: TradeoffCurveChartProps) {
  const { coords, linePath, areaPath, yTicks } = useMemo(() => {
    const maxSS = Math.max(10, ...points.map((p) => p.safetyStock)) * 1.15;
    const count = Math.max(1, points.length - 1);

    const mapped = points.map((pt, idx) => {
      const x = MARGIN.left + (idx / count) * PLOT_W;
      const y = BASELINE_Y - (pt.safetyStock / maxSS) * PLOT_H;
      return { ...pt, x, y };
    });

    const line = mapped
      .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");
    const area =
      mapped.length > 0
        ? `${line} L${mapped[mapped.length - 1].x.toFixed(1)},${BASELINE_Y} L${mapped[0].x.toFixed(1)},${BASELINE_Y} Z`
        : "";

    const ticks = [0, 0.5, 1].map((frac) => ({
      y: BASELINE_Y - frac * PLOT_H,
      label: formatCompact(frac * maxSS),
    }));

    return { coords: mapped, linePath: line, areaPath: area, yTicks: ticks };
  }, [points]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="Service level versus required safety stock curve"
      className="w-full h-auto overflow-visible select-none"
    >
      <title>Non-linear cost of higher cycle service levels</title>
      <desc>
        Interactive chart showing safety stock growth from 85% to 99.5% cycle service level. Click any service level node to update the simulation.
      </desc>

      {/* Y-Axis Gridlines */}
      {yTicks.map((tick, idx) => (
        <g key={idx}>
          <line
            x1={MARGIN.left}
            y1={tick.y}
            x2={VIEW_W - MARGIN.right}
            y2={tick.y}
            stroke="rgb(var(--stitch-outline-variant) / 0.35)"
            strokeDasharray={idx === 0 ? undefined : "3 4"}
            strokeWidth="1"
          />
          <text
            x={MARGIN.left - 8}
            y={tick.y + 3}
            textAnchor="end"
            fill="rgb(var(--stitch-outline))"
            fontSize="10"
            fontFamily="var(--font-mono), monospace"
          >
            {tick.label}
          </text>
        </g>
      ))}

      {/* Area & Trendline */}
      <path d={areaPath} fill="rgb(var(--stitch-primary) / 0.12)" />
      <path
        d={linePath}
        fill="none"
        stroke="rgb(var(--stitch-primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Interactive Service-Level Nodes */}
      {coords.map((pt, idx) => {
        const isActive = Math.abs(pt.csl - activeServiceLevel) < 0.002;
        const labelY = Math.max(12, pt.y - 10);
        const showTopLabel = isActive;

        return (
          <g
            key={pt.csl}
            role="button"
            tabIndex={0}
            aria-label={`Set cycle service level to ${pt.label} (${Math.round(
              pt.safetyStock
            )} units)`}
            onClick={() => onSelectServiceLevel(pt.csl)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectServiceLevel(pt.csl);
              }
            }}
            className="cursor-pointer focus:outline-none group"
          >
            <circle cx={pt.x} cy={pt.y} r="15" fill="transparent" />
            {isActive && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r="8"
                fill="rgb(var(--stitch-primary) / 0.18)"
              />
            )}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={isActive ? 4.8 : 3.5}
              fill={
                isActive
                  ? "rgb(var(--stitch-primary))"
                  : "rgb(var(--stitch-surface-container-lowest))"
              }
              stroke="rgb(var(--stitch-primary))"
              strokeWidth="2"
            />
            {showTopLabel && (
              <text
                x={idx >= coords.length - 2 ? pt.x - 4 : pt.x}
                y={labelY}
                textAnchor={idx >= coords.length - 2 ? "end" : "middle"}
                fill="rgb(var(--stitch-on-surface))"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-mono), monospace"
              >
                {`${Math.round(pt.safetyStock).toLocaleString("en-US")}u`}
              </text>
            )}
            <text
              x={pt.x}
              y={BASELINE_Y + 18}
              textAnchor="middle"
              fill={
                isActive
                  ? "rgb(var(--stitch-primary))"
                  : "rgb(var(--stitch-outline))"
              }
              fontWeight={isActive ? "700" : "500"}
              fontSize="10"
              fontFamily="var(--font-mono), monospace"
            >
              {pt.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
