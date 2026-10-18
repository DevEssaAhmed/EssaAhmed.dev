import { fileURLToPath } from "node:url";
import { TestReporter } from "../helpers/reporter.js";
import { runFullExecutiveJourneyTests } from "./full_executive_journey.test.js";
import { runResponsiveMobileJourneyTests } from "./responsive_mobile_journey.test.js";
import { runSupabaseProductionScenarioTests } from "./supabase_production_scenario.test.js";

/**
 * Executes all Tier 4 Real-World Application Scenario test suites.
 */
export async function runTier4Tests(existingReporter = null) {
  const reporter = existingReporter || new TestReporter("Tier 4 - Real-World Application Scenarios");

  await runFullExecutiveJourneyTests(reporter);
  await runResponsiveMobileJourneyTests(reporter);
  await runSupabaseProductionScenarioTests(reporter);

  if (!existingReporter) {
    reporter.printSummary();
  }

  return reporter;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await runTier4Tests();
}
