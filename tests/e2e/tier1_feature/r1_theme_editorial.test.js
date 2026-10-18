import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

const { projectRoot } = config;

/**
 * Tier 1: Feature Coverage — Requirement R1
 * Authoritative source: ORIGINAL_REQUEST.md & PROJECT.md
 * R1: Complete Site-Wide "Executive Editorial" Theme & Layout Upgrade
 */
describe("Tier 1 - R1: Executive Editorial Theme & Layout Upgrade", () => {
  it("R1-T1: Global Theme Tokens and Color Palette Definition", () => {
    // 1. Verify tailwind.config.ts contains obsidian surfaces, champagne, platinum, metric, tertiary
    const tailwindPath = path.join(projectRoot, "tailwind.config.ts");
    assert.ok(fs.existsSync(tailwindPath), "tailwind.config.ts must exist");
    const tailwindContent = fs.readFileSync(tailwindPath, "utf8");

    // Surface tokens
    assert.match(tailwindContent, /surface:\s*['"]#07090e['"]|surface:\s*\{/, "Must declare surface tokens in tailwind.config.ts");
    assert.match(tailwindContent, /#07090e/, "Obsidian primary surface #07090e must be defined");
    assert.match(tailwindContent, /#05060a/, "Canvas surface #05060a must be defined");
    assert.match(tailwindContent, /#030407/, "Lowest surface #030407 must be defined");
    assert.match(tailwindContent, /#0b0e16/, "Low surface #0b0e16 must be defined");
    assert.match(tailwindContent, /#0f131d/, "Container surface #0f131d must be defined");
    assert.match(tailwindContent, /#161b26/, "High surface #161b26 must be defined");
    assert.match(tailwindContent, /#1c2230/, "Highest surface #1c2230 must be defined");

    // Accent tokens
    assert.match(tailwindContent, /#f3e8d2/, "Champagne #f3e8d2 must be defined");
    assert.match(tailwindContent, /#c2b49c/, "Champagne-dim #c2b49c must be defined");
    assert.match(tailwindContent, /#e2e8f0/, "Platinum #e2e8f0 must be defined");
    assert.match(tailwindContent, /#34d399/, "Tertiary emerald #34d399 must be defined");
    assert.match(tailwindContent, /#60A5FA/, "Metric soft sky #60A5FA must be defined");

    // 2. Verify src/index.css base layer defines HSL CSS variables for dark editorial theme
    const cssPath = path.join(projectRoot, "src/index.css");
    assert.ok(fs.existsSync(cssPath), "src/index.css must exist");
    const cssContent = fs.readFileSync(cssPath, "utf8");

    assert.match(cssContent, /color-scheme:\s*dark/, "src/index.css must declare color-scheme: dark");
    assert.match(cssContent, /--background:\s*223\s+33%\s+4%/, "--background must match #07090e HSL");
    assert.match(cssContent, /--primary:\s*40\s+58%\s+89%/, "--primary must match champagne HSL");
    assert.match(cssContent, /--primary-glow:\s*38\s+24%\s+69%/, "--primary-glow must match champagne-dim HSL");
  });

  it("R1-T2: Root Layout Canvas & Flash Prevention", () => {
    // Verify src/app/layout.tsx enforces dark canvas directly on html and body
    const layoutPath = path.join(projectRoot, "src/app/layout.tsx");
    assert.ok(fs.existsSync(layoutPath), "src/app/layout.tsx must exist");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");

    // Must have dark class on html
    assert.match(layoutContent, /<html[^>]*className=\{?["`][^"`]*dark/, "html tag must include 'dark' class");
    // Must declare dark obsidian background on html to prevent white window flash
    assert.match(
      layoutContent,
      /<html[^>]*className=\{?["`][^"`]*(bg-\[#07090e\]|bg-surface)/,
      "html tag must include bg-[#07090e] or bg-surface to eliminate initial white canvas flash"
    );
    // Body must also be styled with dark background
    assert.match(
      layoutContent,
      /<body[^>]*className=\{?["`][^"`]*(bg-\[#07090e\]|bg-surface)/,
      "body tag must include dark background class"
    );
    // Preconnect to Supabase CDN for optimized image delivery
    assert.match(
      layoutContent,
      /href="https:\/\/kexmzaaufxbzegurxuqz\.supabase\.co"/,
      "layout.tsx should preconnect to Supabase Storage domain"
    );
  });

  it("R1-T3: PageTransition Canvas Isolation", () => {
    // Verify PageTransition wraps navigation transitions in an opaque dark background
    const pageTransitionPath = path.join(projectRoot, "src/components/PageTransition.tsx");
    assert.ok(fs.existsSync(pageTransitionPath), "PageTransition.tsx must exist");
    const ptContent = fs.readFileSync(pageTransitionPath, "utf8");

    assert.match(
      ptContent,
      /className=["`][^"`]*(bg-\[#07090e\]|bg-surface)/,
      "PageTransition container must declare dark background to prevent white bleed-through during opacity exit"
    );
    // Verify reduced motion handling also preserves background
    assert.match(
      ptContent,
      /prefersReducedMotion/,
      "PageTransition must respect reduced motion accessibility preferences"
    );
  });

  it("R1-T4: Elimination of Legacy Contrasting Gradients & Rainbow Colors", () => {
    // 1. CategoriesPage must not contain contrasting rainbow CARD_ACCENTS
    const categoriesPath = path.join(projectRoot, "src/app/articles/categories/CategoriesPage.tsx");
    if (fs.existsSync(categoriesPath)) {
      const catContent = fs.readFileSync(categoriesPath, "utf8");
      assert.doesNotMatch(
        catContent,
        /CARD_ACCENTS\s*=\s*\[/,
        "CategoriesPage must purge legacy CARD_ACCENTS rainbow array"
      );
      assert.doesNotMatch(
        catContent,
        /from-rose-500|from-pink-500|from-violet-500/i,
        "CategoriesPage must not contain legacy neon/rainbow gradient accents"
      );
    }

    // 2. TagsPage must not contain rainbow TAG_COLORS
    const tagsPath = path.join(projectRoot, "src/app/articles/tags/TagsPage.tsx");
    if (fs.existsSync(tagsPath)) {
      const tagsContent = fs.readFileSync(tagsPath, "utf8");
      assert.doesNotMatch(
        tagsContent,
        /TAG_COLORS\s*=\s*\[/,
        "TagsPage must purge legacy TAG_COLORS rainbow gradient array"
      );
    }

    // 3. ArticleDetailPageEnhanced progress bar must use champagne/blue/editorial palette, not pink/violet
    const articleDetailPath = path.join(projectRoot, "src/app/articles/[slug]/ArticleDetailPageEnhanced.tsx");
    if (fs.existsSync(articleDetailPath)) {
      const articleContent = fs.readFileSync(articleDetailPath, "utf8");
      assert.doesNotMatch(
        articleContent,
        /bg-gradient-to-r\s+from-primary\s+via-violet-500\s+to-pink-500/,
        "ArticleDetailPageEnhanced must not use legacy violet-to-pink reading progress bar"
      );
      assert.match(
        articleContent,
        /from-champagne/,
        "ArticleDetailPageEnhanced reading progress bar must adopt the champagne editorial palette"
      );
    }
  });

  it("R1-T5: Strict Typography Pairing Across Components", () => {
    // Verify layout.tsx configures Google fonts and tailwind sets font families
    const layoutPath = path.join(projectRoot, "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");

    assert.match(layoutContent, /Plus_Jakarta_Sans/, "Root layout must import Plus_Jakarta_Sans");
    assert.match(layoutContent, /Inter/, "Root layout must import Inter");
    assert.match(layoutContent, /JetBrains_Mono/, "Root layout must import JetBrains_Mono");

    const tailwindPath = path.join(projectRoot, "tailwind.config.ts");
    const tailwindContent = fs.readFileSync(tailwindPath, "utf8");
    assert.match(tailwindContent, /display:\s*\[['"]var\(--font-jakarta\)/, "fontFamily.display must map to Jakarta");
    assert.match(tailwindContent, /sans:\s*\[['"]var\(--font-inter\)/, "fontFamily.sans must map to Inter");
    assert.match(
      tailwindContent,
      /mono:\s*\[['"]var\(--font-(mono|jetbrains-mono)\)/,
      "fontFamily.mono must map to JetBrains Mono token variable"
    );
  });

  it("R1-T6: Theme Provider Persistence & Dark Mode Enforcement", () => {
    const themeContextPath = path.join(projectRoot, "src/contexts/ThemeContext.tsx");
    assert.ok(fs.existsSync(themeContextPath), "src/contexts/ThemeContext.tsx must exist");
    const themeContent = fs.readFileSync(themeContextPath, "utf8");

    assert.match(themeContent, /classList\.add\(['"]dark['"]\)/, "ThemeContext must ensure 'dark' class is added");
    assert.match(themeContent, /classList\.remove\(['"]light['"]\)/, "ThemeContext must purge 'light' class");
    assert.match(themeContent, /localStorage\.setItem\(['"]theme['"],\s*['"]dark['"]\)/, "ThemeContext must persist dark theme in localStorage");
  });

  it("R1-T7: Site-Wide Route Editorial Styling Compliance", () => {
    // Check core routes to verify they consume editorial dark tokens
    const filesToCheck = [
      "src/app/projects/ProjectsPage.tsx",
      "src/app/projects/[id]/ProjectDetailPage.tsx",
      "src/components/ProjectCard.tsx",
      "src/app/articles/categories/CategoriesPage.tsx",
      "src/app/articles/tags/TagsPage.tsx",
    ];

    for (const relPath of filesToCheck) {
      const fullPath = path.join(projectRoot, relPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        const hasEditorialTokens =
          content.includes("bg-surface") ||
          content.includes("text-champagne") ||
          content.includes("bg-champagne") ||
          content.includes("font-display") ||
          content.includes("border-border");
        assert.ok(
          hasEditorialTokens,
          `${relPath} must consume Executive Editorial design tokens (surface, champagne, font-display, border-border)`
        );
      }
    }
  });
});
