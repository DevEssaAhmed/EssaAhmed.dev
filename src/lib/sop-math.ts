export interface SopInputs {
  avgDailyDemand: number;
  demandStdDev: number;
  avgLeadTimeDays: number;
  leadTimeStdDevDays: number;
  serviceLevel: number;
  unitHoldingCostYear: number;
  orderCycleDays: number;
}

export type SopDominantDriver = "deterministic" | "lead_time" | "demand" | "balanced";

export interface SopMetrics {
  inputs: SopInputs;
  zScore: number;
  meanLeadTimeDemand: number;
  demandVarianceComponent: number;
  leadTimeVarianceComponent: number;
  leadTimeDemandStdDev: number;
  demandVarianceShare: number;
  leadTimeVarianceShare: number;
  safetyStock: number;
  reorderPoint: number;
  safetyCoverDays: number;
  stockoutRiskPct: number;
  expectedShortagePerCycle: number;
  estimatedFillRatePct: number;
  annualCarryingCost: number;
  leadTimeReductionSavings: {
    appliedDeltaDays: number;
    deltaUnits: number;
    deltaCostYear: number;
  };
  demandReductionSavings: {
    deltaUnits: number;
    deltaCostYear: number;
  };
  dominantDriver: SopDominantDriver;
}

export interface SopPreset {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  inputs: SopInputs;
}

export type DistributionRegion = "expected" | "buffer" | "stockout";

export interface DistributionPoint {
  x: number;
  pdf: number;
  region: DistributionRegion;
}

export interface TradeoffPoint {
  csl: number;
  label: string;
  zScore: number;
  safetyStock: number;
  annualCarryingCost: number;
}

export interface SopCodeSnippets {
  python: string;
  sql: string;
  dax: string;
}

export const SERVICE_LEVEL_OPTIONS = [0.9, 0.95, 0.98, 0.99, 0.995] as const;

export const SOP_PRESETS: readonly SopPreset[] = [
  {
    id: "automotive-tier1",
    label: "Automotive Tier-1 Assembly",
    shortLabel: "Auto Tier-1",
    description: "High-throughput line feed with tight SLA requirements and moderate supplier jitter.",
    inputs: {
      avgDailyDemand: 240,
      demandStdDev: 35,
      avgLeadTimeDays: 12,
      leadTimeStdDevDays: 2.5,
      serviceLevel: 0.98,
      unitHoldingCostYear: 18,
      orderCycleDays: 14,
    },
  },
  {
    id: "overseas-import",
    label: "Overseas Container Import",
    shortLabel: "Ocean Import",
    description: "Long customs & transit tail where supplier lead-time variance dominates buffer size.",
    inputs: {
      avgDailyDemand: 85,
      demandStdDev: 18,
      avgLeadTimeDays: 38,
      leadTimeStdDevDays: 9,
      serviceLevel: 0.95,
      unitHoldingCostYear: 32,
      orderCycleDays: 30,
    },
  },
  {
    id: "critical-spares",
    label: "A-Class Spare Parts",
    shortLabel: "Critical Spares",
    description: "Erratic maintenance consumption demanding a 99% cycle service floor despite short lead.",
    inputs: {
      avgDailyDemand: 45,
      demandStdDev: 22,
      avgLeadTimeDays: 5,
      leadTimeStdDevDays: 1,
      serviceLevel: 0.99,
      unitHoldingCostYear: 45,
      orderCycleDays: 21,
    },
  },
] as const;

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

const SQRT_2_PI = Math.sqrt(2 * Math.PI);

/**
 * Standard normal probability density function phi(z).
 */
export function normPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / SQRT_2_PI;
}

/**
 * Standard normal cumulative distribution function Phi(z)
 * using Abramowitz & Stegun 7.1.26 approximation (< 1.5e-7 error).
 */
export function normCdf(z: number): number {
  if (z === 0) return 0.5;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * x);
  const poly =
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const upper = normPdf(x) * poly;
  const cdf = 1 - upper;
  return sign === 1 ? cdf : 1 - cdf;
}

/**
 * Inverse standard normal CDF (quantile function) using Peter Acklam's algorithm.
 */
export function normSInv(p: number): number {
  const clampedP = clamp(p, 0.0001, 0.9999);
  if (clampedP === 0.5) return 0;

  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (clampedP < pLow) {
    const q = Math.sqrt(-2 * Math.log(clampedP));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  if (clampedP <= pHigh) {
    const q = clampedP - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }

  const q = Math.sqrt(-2 * Math.log(1 - clampedP));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

/**
 * Standard normal first-order loss function L(z) = phi(z) - z * (1 - Phi(z)).
 */
export function standardNormalLoss(z: number): number {
  return Math.max(0, normPdf(z) - z * (1 - normCdf(z)));
}

function sanitizeSopInputs(raw: SopInputs): SopInputs {
  return {
    avgDailyDemand: clamp(raw.avgDailyDemand, 1, 2000),
    demandStdDev: clamp(raw.demandStdDev, 0, 1000),
    avgLeadTimeDays: clamp(raw.avgLeadTimeDays, 1, 180),
    leadTimeStdDevDays: clamp(raw.leadTimeStdDevDays, 0, 60),
    serviceLevel: clamp(raw.serviceLevel, 0.8, 0.999),
    unitHoldingCostYear: clamp(raw.unitHoldingCostYear, 0, 500),
    orderCycleDays: clamp(raw.orderCycleDays, 1, 365),
  };
}

function computeCoreBuffer(inputs: SopInputs) {
  const zScore = normSInv(inputs.serviceLevel);
  const meanLeadTimeDemand = inputs.avgDailyDemand * inputs.avgLeadTimeDays;
  const demandVarianceComponent = inputs.avgLeadTimeDays * inputs.demandStdDev ** 2;
  const leadTimeVarianceComponent =
    inputs.avgDailyDemand ** 2 * inputs.leadTimeStdDevDays ** 2;
  const totalVariance = demandVarianceComponent + leadTimeVarianceComponent;
  const leadTimeDemandStdDev = Math.sqrt(totalVariance);
  const safetyStock = leadTimeDemandStdDev > 0 ? zScore * leadTimeDemandStdDev : 0;
  const annualCarryingCost = safetyStock * inputs.unitHoldingCostYear;

  return {
    zScore,
    meanLeadTimeDemand,
    demandVarianceComponent,
    leadTimeVarianceComponent,
    totalVariance,
    leadTimeDemandStdDev,
    safetyStock,
    annualCarryingCost,
  };
}

export function calculateSopMetrics(raw: SopInputs): SopMetrics {
  const inputs = sanitizeSopInputs(raw);
  const core = computeCoreBuffer(inputs);

  const demandVarianceShare =
    core.totalVariance > 0
      ? (core.demandVarianceComponent / core.totalVariance) * 100
      : 0;
  const leadTimeVarianceShare =
    core.totalVariance > 0
      ? (core.leadTimeVarianceComponent / core.totalVariance) * 100
      : 0;

  const reorderPoint = core.meanLeadTimeDemand + core.safetyStock;
  const safetyCoverDays =
    inputs.avgDailyDemand > 0 ? core.safetyStock / inputs.avgDailyDemand : 0;
  const stockoutRiskPct = (1 - inputs.serviceLevel) * 100;
  const expectedShortagePerCycle =
    core.leadTimeDemandStdDev > 0
      ? core.leadTimeDemandStdDev * standardNormalLoss(core.zScore)
      : 0;
  const cycleDemand = inputs.avgDailyDemand * inputs.orderCycleDays;
  const estimatedFillRatePct =
    cycleDemand > 0
      ? clamp((1 - expectedShortagePerCycle / cycleDemand) * 100, 0, 100)
      : 100;

  // Sensitivity 1: reducing supplier lead-time std dev by up to 1 day
  const appliedDeltaDays = Math.min(1, inputs.leadTimeStdDevDays);
  const reducedLeadCore =
    appliedDeltaDays > 0
      ? computeCoreBuffer({
          ...inputs,
          leadTimeStdDevDays: inputs.leadTimeStdDevDays - appliedDeltaDays,
        })
      : core;
  const leadTimeReductionSavings = {
    appliedDeltaDays,
    deltaUnits: Math.max(0, core.safetyStock - reducedLeadCore.safetyStock),
    deltaCostYear: Math.max(0, core.annualCarryingCost - reducedLeadCore.annualCarryingCost),
  };

  // Sensitivity 2: reducing demand forecast std dev by 20%
  const reducedDemandCore =
    inputs.demandStdDev > 0
      ? computeCoreBuffer({
          ...inputs,
          demandStdDev: inputs.demandStdDev * 0.8,
        })
      : core;
  const demandReductionSavings = {
    deltaUnits: Math.max(0, core.safetyStock - reducedDemandCore.safetyStock),
    deltaCostYear: Math.max(0, core.annualCarryingCost - reducedDemandCore.annualCarryingCost),
  };

  let dominantDriver: SopDominantDriver = "balanced";
  if (core.leadTimeDemandStdDev === 0) {
    dominantDriver = "deterministic";
  } else if (leadTimeVarianceShare >= 60) {
    dominantDriver = "lead_time";
  } else if (demandVarianceShare >= 60) {
    dominantDriver = "demand";
  }

  return {
    inputs,
    zScore: core.zScore,
    meanLeadTimeDemand: core.meanLeadTimeDemand,
    demandVarianceComponent: core.demandVarianceComponent,
    leadTimeVarianceComponent: core.leadTimeVarianceComponent,
    leadTimeDemandStdDev: core.leadTimeDemandStdDev,
    demandVarianceShare,
    leadTimeVarianceShare,
    safetyStock: core.safetyStock,
    reorderPoint,
    safetyCoverDays,
    stockoutRiskPct,
    expectedShortagePerCycle,
    estimatedFillRatePct,
    annualCarryingCost: core.annualCarryingCost,
    leadTimeReductionSavings,
    demandReductionSavings,
    dominantDriver,
  };
}

export function buildDistributionCurve(
  metrics: SopMetrics,
  steps = 96
): DistributionPoint[] {
  const std = metrics.leadTimeDemandStdDev;
  if (std <= 0) return [];

  const mean = metrics.meanLeadTimeDemand;
  const rop = metrics.reorderPoint;
  const minX = Math.max(0, mean - 3.5 * std);
  const maxX = mean + 3.5 * std;
  const count = Math.max(16, steps);
  const stepSize = (maxX - minX) / count;
  const points: DistributionPoint[] = [];

  for (let i = 0; i <= count; i++) {
    const x = minX + i * stepSize;
    const z = (x - mean) / std;
    const pdf = normPdf(z) / std;
    let region: DistributionRegion = "expected";
    if (x > rop) {
      region = "stockout";
    } else if (x > mean) {
      region = "buffer";
    }
    points.push({ x, pdf, region });
  }

  return points;
}

const TRADEOFF_SERVICE_LEVELS = [
  0.85, 0.9, 0.925, 0.95, 0.97, 0.98, 0.99, 0.995,
] as const;

export function buildServiceLevelTradeoff(inputs: SopInputs): TradeoffPoint[] {
  const sanitized = sanitizeSopInputs(inputs);
  return TRADEOFF_SERVICE_LEVELS.map((csl) => {
    const zScore = normSInv(csl);
    const std = Math.sqrt(
      sanitized.avgLeadTimeDays * sanitized.demandStdDev ** 2 +
        sanitized.avgDailyDemand ** 2 * sanitized.leadTimeStdDevDays ** 2
    );
    const safetyStock = std > 0 ? zScore * std : 0;
    const annualCarryingCost = safetyStock * sanitized.unitHoldingCostYear;
    const pct = csl * 100;
    const label = Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;

    return {
      csl,
      label,
      zScore,
      safetyStock,
      annualCarryingCost,
    };
  });
}

export function generateSopCodeSnippets(
  inputs: SopInputs,
  metrics: SopMetrics
): SopCodeSnippets {
  const d = Number(inputs.avgDailyDemand.toFixed(1));
  const sd = Number(inputs.demandStdDev.toFixed(1));
  const l = Number(inputs.avgLeadTimeDays.toFixed(1));
  const sl = Number(inputs.leadTimeStdDevDays.toFixed(1));
  const csl = Number(inputs.serviceLevel.toFixed(3));
  const h = Number(inputs.unitHoldingCostYear.toFixed(2));
  const z = metrics.zScore.toFixed(3);
  const ss = Math.round(metrics.safetyStock).toLocaleString("en-US");
  const rop = Math.round(metrics.reorderPoint).toLocaleString("en-US");

  const python = `import math
from scipy.stats import norm

def compute_inventory_policy(
    avg_daily_demand: float = ${d},
    demand_std_dev: float = ${sd},
    avg_lead_time_days: float = ${l},
    lead_time_std_dev_days: float = ${sl},
    cycle_service_level: float = ${csl},
    holding_cost_per_unit_yr: float = ${h},
) -> dict[str, float]:
    """Combined stochastic demand + supplier lead-time safety stock model."""
    z = norm.ppf(cycle_service_level)  # z = ${z}
    mean_lt_demand = avg_daily_demand * avg_lead_time_days
    lt_demand_std = math.sqrt(
        avg_lead_time_days * (demand_std_dev ** 2)
        + (avg_daily_demand ** 2) * (lead_time_std_dev_days ** 2)
    )
    safety_stock = z * lt_demand_std          # ~${ss} units
    reorder_point = mean_lt_demand + safety_stock  # ~${rop} units
    return {
        "z_score": round(z, 3),
        "safety_stock_units": round(safety_stock, 1),
        "reorder_point_units": round(reorder_point, 1),
        "annual_carrying_cost": round(safety_stock * holding_cost_per_unit_yr, 2),
    }`;

  const sql = `-- Warehouse Policy CTE (PostgreSQL / Snowflake)
WITH sku_demand_stats AS (
    SELECT
        sku_id,
        AVG(daily_units)        AS avg_daily_demand,   -- e.g. ${d}
        STDDEV_SAMP(daily_units) AS demand_std_dev     -- e.g. ${sd}
    FROM fact_daily_demand
    WHERE demand_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY sku_id
),
supplier_lead_stats AS (
    SELECT
        sku_id,
        AVG(lead_time_days)        AS avg_lead_time,   -- e.g. ${l}d
        STDDEV_SAMP(lead_time_days) AS lead_time_std   -- e.g. ${sl}d
    FROM fact_purchase_orders
    WHERE status = 'RECEIVED'
    GROUP BY sku_id
)
SELECT
    d.sku_id,
    ROUND(${z} * SQRT(
        l.avg_lead_time * POWER(d.demand_std_dev, 2)
        + POWER(d.avg_daily_demand, 2) * POWER(l.lead_time_std, 2)
    ), 0) AS safety_stock_units,                         -- ${ss} units @ ${Math.round(csl * 1000) / 10}% CSL
    ROUND(
        (d.avg_daily_demand * l.avg_lead_time)
        + ${z} * SQRT(
            l.avg_lead_time * POWER(d.demand_std_dev, 2)
            + POWER(d.avg_daily_demand, 2) * POWER(l.lead_time_std, 2)
        ), 0
    ) AS reorder_point_units                             -- ${rop} units
FROM sku_demand_stats d
JOIN supplier_lead_stats l ON l.sku_id = d.sku_id;`;

  const dax = `// Power BI S&OP Decision Measures (z = ${z} at ${Math.round(csl * 1000) / 10}% CSL)
Target Z-Score =
NORM.S.INV( SELECTEDVALUE('Policy Parameters'[CycleServiceLevel], ${csl}) )

Lead Time Demand StdDev =
VAR AvgD = [Avg Daily Demand]       -- ${d} units/day
VAR StdD = [Daily Demand StdDev]    -- ${sd} units
VAR AvgL = [Avg Supplier Lead Days] -- ${l} days
VAR StdL = [Lead Time StdDev Days]  -- ${sl} days
RETURN
SQRT( AvgL * POWER(StdD, 2) + POWER(AvgD, 2) * POWER(StdL, 2) )

Safety Stock Units =
ROUND( [Target Z-Score] * [Lead Time Demand StdDev], 0 ) -- ${ss} units

Reorder Point Units =
ROUND( ([Avg Daily Demand] * [Avg Supplier Lead Days]) + [Safety Stock Units], 0 ) -- ${rop} units`;

  return { python, sql, dax };
}
