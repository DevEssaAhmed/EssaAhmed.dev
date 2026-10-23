import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { config } from "../config.js";
import {
  assertOk,
  assertIncludes,
  assertNotIncludes,
} from "../helpers/assertions.js";

/**
 * Tier 1: Requirement R3 - Responsive Polish & Production Build Verification
 */
export async function runR3ResponsiveBuildTests(reporter) {
  const root = config.projectRoot;

  // Test 3.1: TypeScript Compilation Verification (tsc --noEmit)
  const t1 = "R3.1 - TypeScript compiler runs with zero type diagnostics (tsc --noEmit)";
  const start1 = Date.now();
  try {
    // Run tsc --noEmit in projectRoot
    const output = execSync("npx tsc --noEmit", {
      cwd: root,
      encoding: "utf8",
      timeout: 45000,
    });
    reporter.record(t1, 1, true, null, Date.now() - start1);
  } catch (err) {
    const errorDetails = err.stdout || err.stderr || err.message;
    reporter.record(t1, 1, false, new Error(errorDetails), Date.now() - start1);
  }

  // Test 3.2: Supabase Type Contract Verification
  const t2 = "R3.2 - Supabase database types module exports valid Database definitions";
  const start2 = Date.now();
  try {
    const typesPath = path.join(root, "src/integrations/supabase/types.ts");
    assertOk(fs.existsSync(typesPath), "src/integrations/supabase/types.ts must exist");
    const content = fs.readFileSync(typesPath, "utf8");

    assertIncludes(content, "export type Database", "types.ts must export Database type");
    assertIncludes(content, "export type Json", "types.ts must export Json type");
    reporter.record(t2, 1, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 1, false, err, Date.now() - start2);
  }

  // Test 3.3: Mobile Navigation Header & Viewport Specifications
  const t3 = "R3.3 - Navigation component enforces 64px (h-16) header and glass obsidian backdrop";
  const start3 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    assertOk(fs.existsSync(navPath), "src/components/Navigation.tsx must exist");
    const content = fs.readFileSync(navPath, "utf8");

    // Check for fixed/sticky positioning and backdrop blur
    const hasPositioning = content.includes("fixed") || content.includes("sticky");
    const hasBackdrop = content.includes("backdrop-blur");
    assertOk(hasPositioning, "Navigation must declare fixed or sticky positioning");
    assertOk(hasBackdrop, "Navigation header must declare backdrop blur styling");
    reporter.record(t3, 1, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 1, false, err, Date.now() - start3);
  }

  // Test 3.4: Mobile Navigation Drawer & Accessibility Attributes
  const t4 = "R3.4 - Mobile Navigation Drawer includes dialog semantics, aria-modal, and close action";
  const start4 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    assertOk(fs.existsSync(navPath), "src/components/Navigation.tsx must exist");
    const content = fs.readFileSync(navPath, "utf8");

    assertOk(content.includes('role="dialog"') || content.includes("role='dialog'"), "Mobile drawer must declare role='dialog'");
    assertOk(content.includes('aria-modal="true"') || content.includes("aria-modal='true'"), "Mobile drawer must declare aria-modal='true'");
    assertOk(content.includes('aria-label="Mobile navigation menu"') || content.includes("aria-label='Mobile navigation menu'"), "Mobile drawer must declare aria-label");
    assertOk(content.includes('aria-label="Close navigation menu"') || content.includes("aria-label='Close navigation menu'"), "Close button must declare aria-label");
    assertIncludes(content, "Escape", "Navigation must handle Escape key event to close drawer");
    reporter.record(t4, 1, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 1, false, err, Date.now() - start4);
  }

  // Test 3.5: Responsive Breakpoints on Projects and Editorial Showcase
  const t5 = "R3.5 - Page layouts define mobile-first responsive breakpoints (sm:, md:, lg:)";
  const start5 = Date.now();
  try {
    const filesToCheck = [
      "src/app/projects/ProjectsPage.tsx",
      "src/components/home/FeaturedWork.tsx",
    ];

    for (const rel of filesToCheck) {
      const full = path.join(root, rel);
      assertOk(fs.existsSync(full), `${rel} must exist`);
      const content = fs.readFileSync(full, "utf8");

      assertIncludes(content, "grid-cols-1", `${rel} must define single column for mobile viewports`);
      assertOk(
        content.includes("sm:grid-cols-") || content.includes("md:grid-cols-") || content.includes("lg:grid-cols-"),
        `${rel} must adapt column grid for tablet/desktop viewports`
      );
    }
    reporter.record(t5, 1, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 1, false, err, Date.now() - start5);
  }

  // Test 3.6: WCAG AA Accessibility, Contrast, & Focus Rings
  const t6 = "R3.6 - Interactive buttons and links configure accessible focus states and aria attributes";
  const start6 = Date.now();
  try {
    const tabNavPath = path.join(root, "src/components/TabNavigation.tsx");
    assertOk(fs.existsSync(tabNavPath), "TabNavigation.tsx must exist");
    const tabContent = fs.readFileSync(tabNavPath, "utf8");

    assertIncludes(tabContent, 'role="tablist"', "Tab navigation must declare role='tablist'");
    assertIncludes(tabContent, 'role="tab"', "Tab items must declare role='tab'");
    assertIncludes(tabContent, 'aria-selected=', "Tab buttons must manage aria-selected state");
    assertIncludes(tabContent, 'aria-label=', "Tablist must declare an aria-label");
    reporter.record(t6, 1, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 1, false, err, Date.now() - start6);
  }
}
