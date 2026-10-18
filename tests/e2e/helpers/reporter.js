/**
 * E2E Test Suite Reporter
 */

export class TestReporter {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.results = [];
    this.startTime = Date.now();
  }

  record(name, tier, fnResult, error = null, durationMs = 0) {
    const passed = !error;
    this.results.push({
      name,
      tier,
      passed,
      error: error ? (error.stack || error.message || String(error)) : null,
      durationMs,
    });
  }

  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log("\n=======================================================");
    console.log(`  E2E TEST RUNNER SUMMARY: ${this.suiteName}`);
    console.log("=======================================================");
    console.log(`  Total Tests : ${total}`);
    console.log(`  Passed      : ${passed} \x1b[32m✔\x1b[0m`);
    console.log(`  Failed      : ${failed} ${failed > 0 ? "\x1b[31m✘\x1b[0m" : ""}`);
    console.log(`  Duration    : ${(totalDuration / 1000).toFixed(2)}s`);
    console.log("-------------------------------------------------------");

    // Breakdown by tier
    const tiers = [...new Set(this.results.map((r) => r.tier))];
    for (const tier of tiers) {
      const tierResults = this.results.filter((r) => r.tier === tier);
      const tierPassed = tierResults.filter((r) => r.passed).length;
      const tierTotal = tierResults.length;
      const statusIcon = tierPassed === tierTotal ? "\x1b[32m✔\x1b[0m" : "\x1b[31m✘\x1b[0m";
      console.log(`  [Tier ${tier}] ${tierPassed}/${tierTotal} passed ${statusIcon}`);
    }

    if (failed > 0) {
      console.log("\n------------------ FAILURES ---------------------------");
      for (const r of this.results.filter((r) => !r.passed)) {
        console.log(`\n\x1b[31m[FAIL] [Tier ${r.tier}] ${r.name}\x1b[0m`);
        console.log(r.error);
      }
      console.log("-------------------------------------------------------");
    }
    console.log("=======================================================\n");

    return { total, passed, failed, durationMs: totalDuration };
  }

  generateMarkdown() {
    const totalDuration = Date.now() - this.startTime;
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    let md = `# E2E Test Execution Report\n\n`;
    md += `- **Suite**: ${this.suiteName}\n`;
    md += `- **Date**: ${new Date().toISOString()}\n`;
    md += `- **Status**: ${failed === 0 ? "PASSED" : "FAILED"}\n`;
    md += `- **Total Tests**: ${total}\n`;
    md += `- **Passed**: ${passed}\n`;
    md += `- **Failed**: ${failed}\n`;
    md += `- **Duration**: ${(totalDuration / 1000).toFixed(2)}s\n\n`;

    md += `## Tier Breakdown\n\n`;
    md += `| Tier | Total | Passed | Failed | Status |\n`;
    md += `|------|-------|--------|--------|--------|\n`;

    const tiers = [...new Set(this.results.map((r) => r.tier))].sort();
    for (const tier of tiers) {
      const tierResults = this.results.filter((r) => r.tier === tier);
      const tierPassed = tierResults.filter((r) => r.passed).length;
      const tierFailed = tierResults.length - tierPassed;
      const status = tierFailed === 0 ? "PASS" : "FAIL";
      md += `| Tier ${tier} | ${tierResults.length} | ${tierPassed} | ${tierFailed} | ${status} |\n`;
    }

    md += `\n## Test Case Results\n\n`;
    md += `| Status | Tier | Test Case | Duration |\n`;
    md += `|--------|------|-----------|----------|\n`;
    for (const r of this.results) {
      const icon = r.passed ? "PASS" : "FAIL";
      md += `| ${icon} | Tier ${r.tier} | ${r.name} | ${r.durationMs}ms |\n`;
    }

    if (failed > 0) {
      md += `\n## Failure Details\n\n`;
      for (const r of this.results.filter((r) => !r.passed)) {
        md += `### [Tier ${r.tier}] ${r.name}\n\n`;
        md += "```\n" + (r.error || "Unknown error") + "\n```\n\n";
      }
    }

    return md;
  }
}
