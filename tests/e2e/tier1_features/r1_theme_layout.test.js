import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import {
  assertOk,
  assertEqual,
  assertIncludes,
  assertNotIncludes,
  assertMatch,
} from "../helpers/assertions.js";

/**
 * Tier 1: Requirement R1 - Complete Site-Wide "Executive Editorial" Theme & Layout Upgrade
 */
export async function runR1ThemeLayoutTests(reporter) {
  const root = config.projectRoot;

  // Test 1.1: Root Layout & Body Base Canvas
  const t1 = "R1.1 - Root layout declares dark mode, obsidian canvas (#07090e), and font variables";
  const start1 = Date.now();
  try {
    const layoutPath = path.join(root, "src/app/layout.tsx");
    assertOk(fs.existsSync(layoutPath), "src/app/layout.tsx must exist");
    const content = fs.readFileSync(layoutPath, "utf8");

    assertIncludes(content, "bg-[#07090e]", "Root layout html tag must include bg-[#07090e]");
    assertIncludes(content, "dark", "Root layout must enforce dark class");
    assertIncludes(content, "--font-inter", "Layout must configure Inter font variable");
    assertIncludes(content, "--font-jakarta", "Layout must configure Plus Jakarta Sans font variable");
    assertIncludes(content, "--font-mono", "Layout must configure JetBrains Mono font variable");
    assertIncludes(content, "selection:bg-champagne/20", "Layout must configure champagne selection styles");
    reporter.record(t1, 1, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 1, false, err, Date.now() - start1);
  }

  // Test 1.2: Global CSS Design Tokens & Surface System
  const t2 = "R1.2 - Global CSS defines Executive Editorial tokens and HSL surface palette";
  const start2 = Date.now();
  try {
    const cssPath = path.join(root, "src/index.css");
    assertOk(fs.existsSync(cssPath), "src/index.css must exist");
    const content = fs.readFileSync(cssPath, "utf8");

    assertIncludes(content, "--background: 223 33% 4%", "CSS must declare #07090e obsidian background");
    assertIncludes(content, "--warm-accent: 40 58% 89%", "CSS must declare champagne warm accent");
    assertIncludes(content, "--surface-0", "CSS must declare surface-0 token");
    assertIncludes(content, "--surface-1", "CSS must declare surface-1 token");
    assertIncludes(content, "--surface-2", "CSS must declare surface-2 token");
    assertIncludes(content, "--border: 220 14% 14%", "CSS must declare hairline border token");
    assertIncludes(content, "color-scheme: dark", "CSS must enforce dark color scheme");
    reporter.record(t2, 1, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 1, false, err, Date.now() - start2);
  }

  // Test 1.3: Tailwind Configuration Editorial Palette
  const t3 = "R1.3 - Tailwind config exports champagne, platinum, and 8-tier surface hierarchy";
  const start3 = Date.now();
  try {
    const twPath = path.join(root, "tailwind.config.ts");
    assertOk(fs.existsSync(twPath), "tailwind.config.ts must exist");
    const content = fs.readFileSync(twPath, "utf8");

    assertIncludes(content, "#f3e8d2", "Tailwind config must define champagne default #f3e8d2");
    assertIncludes(content, "#c2b49c", "Tailwind config must define champagne dim #c2b49c");
    assertIncludes(content, "#e2e8f0", "Tailwind config must define platinum #e2e8f0");
    assertIncludes(content, "#34d399", "Tailwind config must define tertiary emerald #34d399");
    assertIncludes(content, "#60A5FA", "Tailwind config must define metric blue #60A5FA");
    assertIncludes(content, "#030407", "Tailwind config must define surface lowest (#030407)");
    assertIncludes(content, "#1c2230", "Tailwind config must define surface highest (#1c2230)");
    reporter.record(t3, 1, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 1, false, err, Date.now() - start3);
  }

  // Test 1.4: Elimination of Light Theme Flash in Page Transitions
  const t4 = "R1.4 - PageTransition component eliminates light theme flash via obsidian canvas";
  const start4 = Date.now();
  try {
    const ptPath = path.join(root, "src/components/PageTransition.tsx");
    assertOk(fs.existsSync(ptPath), "src/components/PageTransition.tsx must exist");
    const content = fs.readFileSync(ptPath, "utf8");

    const hasObsidian =
      content.includes("bg-[#07090e]") ||
      content.includes("bg-background") ||
      content.includes("bg-surface");
    assertOk(hasObsidian, "PageTransition container must enforce dark background token");
    assertNotIncludes(content, "bg-white", "PageTransition container must not default to white background");
    reporter.record(t4, 1, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 1, false, err, Date.now() - start4);
  }

  // Test 1.5: Route Theme Uniformity Across Key Hubs
  const t5 = "R1.5 - Key page routes use Executive Editorial tokens and dark background containers";
  const start5 = Date.now();
  try {
    const routeFiles = [
      "src/app/projects/ProjectsPage.tsx",
      "src/app/projects/[id]/ProjectDetailPage.tsx",
      "src/app/articles/ArticlesPage.tsx",
      "src/app/NotFound.tsx",
    ];

    for (const relPath of routeFiles) {
      const fullPath = path.join(root, relPath);
      assertOk(fs.existsSync(fullPath), `Route file ${relPath} must exist`);
      const content = fs.readFileSync(fullPath, "utf8");
      const hasDarkCanvas =
        content.includes("bg-background") ||
        content.includes("bg-[#07090e]") ||
        content.includes("bg-surface");
      assertOk(hasDarkCanvas, `${relPath} must use dark canvas token (bg-background, bg-[#07090e], or bg-surface)`);
    }
    reporter.record(t5, 1, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 1, false, err, Date.now() - start5);
  }

  // Test 1.6: Typography Pairing and Hairline Borders
  const t6 = "R1.6 - Typography classes pair Plus Jakarta Sans, Inter, and JetBrains Mono with hairline borders";
  const start6 = Date.now();
  try {
    const featuredPath = path.join(root, "src/components/home/FeaturedWork.tsx");
    assertOk(fs.existsSync(featuredPath), "FeaturedWork.tsx must exist");
    const content = fs.readFileSync(featuredPath, "utf8");

    assertIncludes(content, "font-display", "Components must use font-display for editorial headings");
    assertIncludes(content, "font-mono", "Components must use font-mono for metrics and telemetry chips");
    assertIncludes(content, "border-border", "Components must use hairline border-border token");
    assertIncludes(content, "text-champagne", "FeaturedWork must style primary accents with text-champagne");
    reporter.record(t6, 1, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 1, false, err, Date.now() - start6);
  }
}
