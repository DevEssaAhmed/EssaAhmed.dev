#!/usr/bin/env node

/**
 * Executive Editorial Portfolio - 4-Tier Opaque-Box E2E Test Runner
 *
 * Tiers:
 *   Tier 1: Feature Coverage (R1 Theme & Layout, R2 Supabase Sync, R3 Responsive & Build)
 *   Tier 2: Boundary & Corner Cases (empty tags, missing images, invalid routes, 404s, fallbacks)
 *   Tier 3: Cross-Feature Combinations (Theme + Nav, Supabase data mapping, filter pills, gallery)
 *   Tier 4: Real-World Application Scenarios (Recruiter desktop, Mobile Leader, Knowledge Explorer, Recovery)
 *
 * Usage:
 *   node tests/e2e/runner.js
 *   node tests/e2e/runner.js --tier=1
 *   node tests/e2e/runner.js --tier=2
 *   node tests/e2e/runner.js --report
 */

import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { TestReporter } from "./helpers/reporter.js";

// Import Tier 1 suites
import { runR1ThemeLayoutTests } from "./tier1_features/r1_theme_layout.test.js";
import { runR2SupabaseSyncTests } from "./tier1_features/r2_supabase_sync.test.js";
import { runR3ResponsiveBuildTests } from "./tier1_features/r3_responsive_build.test.js";

// Import Tier 2 suites
import { runTier2BoundaryTests } from "./tier2_boundary/boundary_corner.test.js";

// Import Tier 3 suites
import { runTier3CrossFeatureTests } from "./tier3_cross_feature/cross_feature.test.js";

// Import Tier 4 suites
import { runTier4RealWorldTests } from "./tier4_real_world/real_world_scenarios.test.js";

async function main() {
  const args = process.argv.slice(2);
  const tierArg = args.find((a) => a.startsWith("--tier="))?.split("=")[1];
  const saveReport = args.includes("--report");
  const targetTier = tierArg ? parseInt(tierArg, 10) : null;

  console.log("\n=======================================================");
  console.log("  STARTING 4-TIER E2E OPAQUE-BOX TEST RUNNER");
  console.log(`  Target: ${targetTier ? `Tier ${targetTier}` : "All Tiers (1-4)"}`);
  console.log(`  Supabase: ${config.supabaseUrl}`);
  console.log("=======================================================\n");

  const reporter = new TestReporter("Portfolio Executive Editorial E2E Suite");

  // Run Tier 1
  if (!targetTier || targetTier === 1) {
    console.log("[RUN] Tier 1: Feature Coverage (R1 Theme, R2 Supabase, R3 Responsive/Build)...");
    await runR1ThemeLayoutTests(reporter);
    await runR2SupabaseSyncTests(reporter);
    await runR3ResponsiveBuildTests(reporter);
  }

  // Run Tier 2
  if (!targetTier || targetTier === 2) {
    console.log("[RUN] Tier 2: Boundary & Corner Cases (empty tags, missing images, 404s)...");
    await runTier2BoundaryTests(reporter);
  }

  // Run Tier 3
  if (!targetTier || targetTier === 3) {
    console.log("[RUN] Tier 3: Cross-Feature Combinations (Nav + Theme, Data Mapping, Filters)...");
    await runTier3CrossFeatureTests(reporter);
  }

  // Run Tier 4
  if (!targetTier || targetTier === 4) {
    console.log("[RUN] Tier 4: Real-World Application Scenarios (Desktop, Mobile, Recovery)...");
    await runTier4RealWorldTests(reporter);
  }

  const summary = reporter.printSummary();

  if (saveReport) {
    const reportPath = path.join(config.projectRoot, "TEST_EXECUTION_REPORT.md");
    fs.writeFileSync(reportPath, reporter.generateMarkdown(), "utf8");
    console.log(`[INFO] Execution report saved to: ${reportPath}`);
  }

  process.exit(summary.failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("FATAL: Test runner crashed with unhandled exception:", err);
  process.exit(1);
});
