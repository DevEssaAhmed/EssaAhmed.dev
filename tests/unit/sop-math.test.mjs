import test from "node:test";
import assert from "node:assert/strict";

import {
  SOP_PRESETS,
  buildDistributionCurve,
  buildServiceLevelTradeoff,
  calculateSopMetrics,
  generateSopCodeSnippets,
  normCdf,
  normPdf,
  normSInv,
} from "../../src/lib/sop-math.ts";

test("normSInv matches standard statistical z-quantiles across common service levels", () => {
  const expected = [
    [0.9, 1.28155],
    [0.95, 1.64485],
    [0.98, 2.05375],
    [0.99, 2.32635],
    [0.995, 2.57583],
  ];

  for (const [p, zExpected] of expected) {
    const zActual = normSInv(p);
    assert.ok(
      Math.abs(zActual - zExpected) < 1e-3,
      `Expected normSInv(${p}) ≈ ${zExpected}, got ${zActual}`
    );
  }
});

test("normPdf and normCdf satisfy symmetry and boundary properties", () => {
  assert.equal(normCdf(0), 0.5);
  assert.ok(Math.abs(normPdf(0) - 1 / Math.sqrt(2 * Math.PI)) < 1e-12);
  assert.equal(normPdf(1.5), normPdf(-1.5));

  for (const z of [0.5, 1.28, 1.96, 2.58]) {
    assert.ok(Math.abs(normCdf(z) + normCdf(-z) - 1) < 1e-6);
  }
});

test("calculateSopMetrics matches closed-form analytical inventory formulas", () => {
  const metrics = calculateSopMetrics({
    avgDailyDemand: 100,
    demandStdDev: 20,
    avgLeadTimeDays: 9,
    leadTimeStdDevDays: 2,
    serviceLevel: 0.95,
    unitHoldingCostYear: 20,
    orderCycleDays: 14,
  });

  const expectedMean = 900;
  const expectedDemandVar = 9 * 400; // 3600
  const expectedLtVar = 10000 * 4; // 40000
  const expectedStd = Math.sqrt(43600);
  const expectedZ = normSInv(0.95);
  const expectedSafety = expectedZ * expectedStd;
  const expectedRop = expectedMean + expectedSafety;

  assert.equal(metrics.meanLeadTimeDemand, expectedMean);
  assert.equal(metrics.demandVarianceComponent, expectedDemandVar);
  assert.equal(metrics.leadTimeVarianceComponent, expectedLtVar);
  assert.ok(Math.abs(metrics.leadTimeDemandStdDev - expectedStd) < 1e-9);
  assert.ok(Math.abs(metrics.safetyStock - expectedSafety) < 1e-9);
  assert.ok(Math.abs(metrics.reorderPoint - expectedRop) < 1e-9);
  assert.ok(Math.abs(metrics.annualCarryingCost - expectedSafety * 20) < 1e-9);
  assert.ok(Math.abs(metrics.demandVarianceShare + metrics.leadTimeVarianceShare - 100) < 1e-9);
  assert.equal(metrics.dominantDriver, "lead_time");
  assert.ok(metrics.estimatedFillRatePct > 95 && metrics.estimatedFillRatePct <= 100);
});

test("calculateSopMetrics handles zero-variance deterministic inputs cleanly", () => {
  const metrics = calculateSopMetrics({
    avgDailyDemand: 50,
    demandStdDev: 0,
    avgLeadTimeDays: 10,
    leadTimeStdDevDays: 0,
    serviceLevel: 0.98,
    unitHoldingCostYear: 25,
    orderCycleDays: 14,
  });

  assert.equal(metrics.leadTimeDemandStdDev, 0);
  assert.equal(metrics.safetyStock, 0);
  assert.equal(metrics.reorderPoint, 500);
  assert.equal(metrics.safetyCoverDays, 0);
  assert.equal(metrics.annualCarryingCost, 0);
  assert.equal(metrics.expectedShortagePerCycle, 0);
  assert.equal(metrics.estimatedFillRatePct, 100);
  assert.equal(metrics.dominantDriver, "deterministic");
  assert.deepEqual(buildDistributionCurve(metrics), []);
});

test("presets classify variance drivers accurately and sensitivity levers save positive cost", () => {
  const byId = new Map(SOP_PRESETS.map((p) => [p.id, calculateSopMetrics(p.inputs)]));
  assert.equal(byId.get("automotive-tier1")?.dominantDriver, "lead_time");
  assert.equal(byId.get("overseas-import")?.dominantDriver, "lead_time");
  assert.equal(byId.get("critical-spares")?.dominantDriver, "balanced");

  for (const metrics of byId.values()) {
    assert.ok(metrics.leadTimeReductionSavings.deltaUnits > 0);
    assert.ok(metrics.demandReductionSavings.deltaUnits > 0);
    const curve = buildDistributionCurve(metrics);
    assert.ok(curve.length > 50);
    assert.ok(curve.some((pt) => pt.region === "expected"));
    assert.ok(curve.some((pt) => pt.region === "buffer"));
    assert.ok(curve.some((pt) => pt.region === "stockout"));
  }
});

test("buildServiceLevelTradeoff increases monotonically with accelerating marginal cost", () => {
  const curve = buildServiceLevelTradeoff(SOP_PRESETS[0].inputs);
  assert.equal(curve.length, 8);
  for (let i = 1; i < curve.length; i++) {
    assert.ok(curve[i].safetyStock > curve[i - 1].safetyStock);
    assert.ok(curve[i].annualCarryingCost > curve[i - 1].annualCarryingCost);
  }
  const at95 = curve.find((p) => p.csl === 0.95);
  const at995 = curve.find((p) => p.csl === 0.995);
  assert.ok(at95 && at995 && at995.safetyStock > at95.safetyStock * 1.5);
});

test("generateSopCodeSnippets embeds active parameters in Python, SQL, and DAX", () => {
  const preset = SOP_PRESETS[0].inputs;
  const metrics = calculateSopMetrics(preset);
  const snippets = generateSopCodeSnippets(preset, metrics);

  assert.ok(snippets.python.includes("avg_daily_demand: float = 240"));
  assert.ok(snippets.python.includes("scipy.stats import norm"));
  assert.ok(snippets.sql.includes("STDDEV_SAMP(daily_units)"));
  assert.ok(snippets.dax.includes("NORM.S.INV"));
});
