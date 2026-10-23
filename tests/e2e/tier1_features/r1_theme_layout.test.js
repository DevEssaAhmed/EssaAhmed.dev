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
 * Tier 1: Requirement R1 - Complete Site-Wide Modern Portfolio Theme & Layout
 */
export async function runR1ThemeLayoutTests(reporter) {
  const root = config.projectRoot;

  // Test 1.1: Root Layout & Body Base Canvas
  const t1 = "R1.1 - Root layout declares surface canvas, font variables, and theme initializer";
  const start1 = Date.now();
  try {
    const layoutPath = path.join(root, "src/app/layout.tsx");
    assertOk(fs.existsSync(layoutPath), "src/app/layout.tsx must exist");
    const content = fs.readFileSync(layoutPath, "utf8");

    assertIncludes(content, "bg-surface", "Root layout body must include bg-surface canvas");
    assertIncludes(content, "--font-inter", "Layout must configure Inter font variable");
    assertIncludes(content, "--font-jakarta", "Layout must configure Plus Jakarta Sans font variable");
    assertIncludes(content, "--font-mono", "Layout must configure JetBrains Mono font variable");
    assertIncludes(content, "theme-initializer", "Layout must include theme-initializer script");
    reporter.record(t1, 1, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 1, false, err, Date.now() - start1);
  }

  // Test 1.2: Global CSS Design Tokens & Surface System
  const t2 = "R1.2 - Global CSS defines Stitch tokens and adaptive surface palette";
  const start2 = Date.now();
  try {
    const cssPath = path.join(root, "src/index.css");
    assertOk(fs.existsSync(cssPath), "src/index.css must exist");
    const content = fs.readFileSync(cssPath, "utf8");

    assertIncludes(content, "--stitch-background", "CSS must declare --stitch-background token");
    assertIncludes(content, "--stitch-surface", "CSS must declare --stitch-surface token");
    assertIncludes(content, "--stitch-outline-variant", "CSS must declare --stitch-outline-variant token");
    assertIncludes(content, "--stitch-primary", "CSS must declare --stitch-primary token");
    assertIncludes(content, "--stitch-secondary", "CSS must declare --stitch-secondary token");
    reporter.record(t2, 1, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 1, false, err, Date.now() - start2);
  }

  // Test 1.3: Tailwind Configuration Palette
  const t3 = "R1.3 - Tailwind config exports on-surface, outline, and tiered surface hierarchy";
  const start3 = Date.now();
  try {
    const twPath = path.join(root, "tailwind.config.ts");
    assertOk(fs.existsSync(twPath), "tailwind.config.ts must exist");
    const content = fs.readFileSync(twPath, "utf8");

    assertIncludes(content, "on-surface", "Tailwind config must define on-surface");
    assertIncludes(content, "outline-variant", "Tailwind config must define outline-variant");
    assertIncludes(content, "primary:", "Tailwind config must define primary token");
    assertIncludes(content, "secondary:", "Tailwind config must define secondary token");
    assertIncludes(content, "tertiary:", "Tailwind config must define tertiary token");
    assertIncludes(content, "surface-lowest", "Tailwind config must define surface lowest");
    reporter.record(t3, 1, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 1, false, err, Date.now() - start3);
  }

  // Test 1.4: Elimination of Light Theme Flash in Page Transitions
  const t4 = "R1.4 - PageTransition component eliminates theme flash via surface canvas";
  const start4 = Date.now();
  try {
    const ptPath = path.join(root, "src/components/PageTransition.tsx");
    assertOk(fs.existsSync(ptPath), "src/components/PageTransition.tsx must exist");
    const content = fs.readFileSync(ptPath, "utf8");

    const hasCanvas =
      content.includes("bg-[#07090e]") ||
      content.includes("bg-background") ||
      content.includes("bg-surface");
    assertOk(hasCanvas, "PageTransition container must enforce adaptive canvas token");
    assertNotIncludes(content, "bg-white", "PageTransition container must not default to hardcoded white");
    reporter.record(t4, 1, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 1, false, err, Date.now() - start4);
  }

  // Test 1.5: Route Theme Uniformity Across Key Hubs
  const t5 = "R1.5 - Key page routes use design system tokens and surface background containers";
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
      assertOk(hasDarkCanvas, `${relPath} must use canvas token (bg-background or bg-surface)`);
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

    const hasHeadings = content.includes("font-display") || content.includes("font-headline-md");
    assertOk(hasHeadings, "Components must use editorial headings");
    assertIncludes(content, "font-code", "Components must use font-code for metrics and chips");
    assertIncludes(content, "outline-variant", "Components must use hairline outline-variant border token");
    reporter.record(t6, 1, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 1, false, err, Date.now() - start6);
  }
}
