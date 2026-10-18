import { fileURLToPath } from "node:url";
import { TestReporter } from "../helpers/reporter.js";
import { runThemeDataHydrationTests } from "./theme_data_hydration.test.js";
import { runCategoryFilterSearchTests } from "./category_filter_search.test.js";
import { runNavigationDrawerTransitionTests } from "./navigation_drawer_transition.test.js";
import { runProjectTelemetryGalleryTests } from "./project_telemetry_gallery.test.js";

/**
 * Executes all Tier 3 Cross-Feature Pairwise Interaction test suites.
 */
export async function runTier3Tests(existingReporter = null) {
  const reporter = existingReporter || new TestReporter("Tier 3 - Cross-Feature Interactions");

  await runThemeDataHydrationTests(reporter);
  await runCategoryFilterSearchTests(reporter);
  await runNavigationDrawerTransitionTests(reporter);
  await runProjectTelemetryGalleryTests(reporter);

  if (!existingReporter) {
    reporter.printSummary();
  }

  return reporter;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await runTier3Tests();
}
