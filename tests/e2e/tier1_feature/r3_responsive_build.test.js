import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { config } from "../config.js";

const { projectRoot } = config;

/**
 * Tier 1: Feature Coverage — Requirement R3
 * Authoritative source: ORIGINAL_REQUEST.md & PROJECT.md
 * R3: Responsive Polish & Production Build Verification
 */
describe("Tier 1 - R3: Responsive Polish & Production Build Verification", () => {
  it("R3-T1: Responsive Navigation & Mobile Drawer Hierarchy", () => {
    const navPath = path.join(projectRoot, "src/components/Navigation.tsx");
    assert.ok(fs.existsSync(navPath), "Navigation.tsx must exist");
    const navContent = fs.readFileSync(navPath, "utf8");

    // Must define 64px (h-16) header height
    assert.match(
      navContent,
      /h-16/,
      "Navigation must define 64px / h-16 standard mobile header height"
    );

    // Mobile drawer accessibility & modal dialog semantics
    assert.match(
      navContent,
      /role=['"]dialog['"]/,
      "Mobile drawer must have role='dialog' for accessibility"
    );
    assert.match(
      navContent,
      /aria-modal=['"]true['"]/,
      "Mobile drawer must declare aria-modal='true'"
    );
    assert.match(
      navContent,
      /aria-label=['"]Mobile navigation menu['"]/,
      "Mobile drawer must have an accessible aria-label"
    );

    // Escape key handler to close menu
    assert.match(
      navContent,
      /handleEscape/,
      "Navigation must listen for Escape key to close mobile drawer"
    );

    // Breakpoint resize handler to auto-close drawer at >= 768px
    assert.match(
      navContent,
      /innerWidth\s*>=\s*768/,
      "Navigation must auto-dismiss mobile menu when resized to desktop breakpoint"
    );

    // Scroll locking
    assert.match(
      navContent,
      /document\.body\.style\.overflow\s*=\s*['"]hidden['"]/,
      "Navigation must lock body scroll when mobile menu is open"
    );
  });

  it("R3-T2: Multi-Viewport Grid Hierarchy & Layout Scalability", () => {
    // 1. ProjectsPage must use responsive grid classes
    const projectsPagePath = path.join(projectRoot, "src/app/projects/ProjectsPage.tsx");
    assert.ok(fs.existsSync(projectsPagePath), "ProjectsPage.tsx must exist");
    const ppContent = fs.readFileSync(projectsPagePath, "utf8");

    assert.match(
      ppContent,
      /grid-cols-1\s+sm:grid-cols-2\s+lg:grid-cols-3/,
      "ProjectsPage must declare 1-col mobile, 2-col tablet, 3-col desktop grid hierarchy"
    );

    // 2. FeaturedWork must define responsive container padding
    const featuredWorkPath = path.join(projectRoot, "src/components/home/FeaturedWork.tsx");
    assert.ok(fs.existsSync(featuredWorkPath), "FeaturedWork.tsx must exist");
    const fwContent = fs.readFileSync(featuredWorkPath, "utf8");

    assert.match(
      fwContent,
      /px-6\s+lg:px-12|max-w-7xl/,
      "FeaturedWork must define responsive container padding across viewports"
    );
  });

  it("R3-T3: WCAG AA Contrast Tokens and Accessible Focus Indicators", () => {
    // 1. Button component focus indicator
    const buttonPath = path.join(projectRoot, "src/components/ui/button.tsx");
    assert.ok(fs.existsSync(buttonPath), "button.tsx must exist");
    const btnContent = fs.readFileSync(buttonPath, "utf8");

    assert.match(
      btnContent,
      /focus-visible:ring-2\s+focus-visible:ring-primary/,
      "Button component must define high-contrast visible focus ring"
    );

    // 2. ProjectCard focus-within and screen-reader labels
    const projectCardPath = path.join(projectRoot, "src/components/ProjectCard.tsx");
    assert.ok(fs.existsSync(projectCardPath), "ProjectCard.tsx must exist");
    const pcContent = fs.readFileSync(projectCardPath, "utf8");

    assert.match(
      pcContent,
      /focus-within:ring-2\s+focus-within:ring-champagne/,
      "ProjectCard must declare focus-within ring using champagne accent"
    );
    assert.match(
      pcContent,
      /aria-label=/,
      "ProjectCard must provide descriptive aria-labels for assistive technology"
    );
  });

  it("R3-T4: ProjectCard DOM Validity and Card Alignment", () => {
    const projectCardPath = path.join(projectRoot, "src/components/ProjectCard.tsx");
    const pcContent = fs.readFileSync(projectCardPath, "utf8");

    // Standardized h-full on article
    assert.match(
      pcContent,
      /<article[^>]*className=["`][^"`]*h-full/,
      "ProjectCard article must declare h-full for vertical grid cell alignment"
    );

    // Title min-height to align cards with 1 vs 2 lines of text
    assert.match(
      pcContent,
      /min-h-\[3\.25rem\]|min-h-\[/,
      "ProjectCard heading must enforce min-height for uniform layout rhythm"
    );

    // Secondary actions (GitHub, external link) must use z-20 so they are not nested inside card link
    assert.match(
      pcContent,
      /relative\s+z-20/,
      "ProjectCard actions must be elevated with relative z-20 to avoid invalid nested link DOM hierarchy"
    );
  });

  it("R3-T5: Next.js Configuration and Build Script Standards", async () => {
    // 1. package.json scripts
    const pkgPath = path.join(projectRoot, "package.json");
    assert.ok(fs.existsSync(pkgPath), "package.json must exist");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    assert.equal(pkg.scripts?.build, "next build", "package.json must have build script 'next build'");
    assert.equal(pkg.scripts?.lint, "next lint", "package.json must have lint script 'next lint'");

    // 2. tsconfig.json configuration (parsed using TypeScript's native JSONC parser)
    const tsconfigPath = path.join(projectRoot, "tsconfig.json");
    assert.ok(fs.existsSync(tsconfigPath), "tsconfig.json must exist");
    const { default: ts } = await import("typescript");
    const parsedConfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    assert.equal(parsedConfig.error, undefined, "tsconfig.json must be valid JSONC without syntax errors");
    const tsconfig = parsedConfig.config;

    assert.equal(tsconfig.compilerOptions?.strict, true, "tsconfig compilerOptions.strict must be true");
    assert.ok(
      tsconfig.compilerOptions?.paths?.["@/*"]?.[0] === "./src/*" ||
        tsconfig.compilerOptions?.paths?.["@/*"]?.[0] === "src/*",
      "tsconfig must configure @/* path alias to ./src/*"
    );
  });

  it("R3-T6: Clean TypeScript Compilation Verification", () => {
    // Run tsc --noEmit check to guarantee 0 build/type errors
    let tscOutput = "";
    try {
      tscOutput = execSync("npx tsc --noEmit", {
        cwd: projectRoot,
        encoding: "utf8",
        timeout: 60000,
      });
    } catch (err) {
      // If error, capture stdout/stderr
      tscOutput = `${err.stdout || ""}\n${err.stderr || ""}\n${err.message || ""}`;
      assert.fail(`TypeScript compilation check failed with errors:\n${tscOutput}`);
    }

    assert.ok(
      !tscOutput.toLowerCase().includes("error ts"),
      `TypeScript compiler output should not contain TypeScript errors: ${tscOutput}`
    );
  });
});
