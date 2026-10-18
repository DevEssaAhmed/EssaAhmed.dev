import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import {
  assertOk,
  assertEqual,
  assertIncludes,
  assertNotIncludes,
} from "../helpers/assertions.js";
import { TestReporter } from "../helpers/reporter.js";
import { getSupabaseTestClient } from "../helpers/supabase-test-client.js";

/**
 * Tier 3: Cross-Feature Suite 3.1 - Theme Consistency During Dynamic Supabase Data Hydration
 */
export async function runThemeDataHydrationTests(reporter) {
  const root = config.projectRoot;

  // Test 3.1.1: Loading & Skeleton states adhere strictly to Executive Editorial dark surfaces
  const t1 = "Tier 3.1.1 - Dynamic loading and skeleton states eliminate white flashes and enforce dark surfaces";
  const start1 = Date.now();
  try {
    const skeletonFiles = [
      "src/components/home/DashboardHeroSkeleton.tsx",
      "src/app/projects/[id]/ProjectDetailPage.tsx",
      "src/app/Index.tsx",
      "src/components/PageTransition.tsx",
    ];

    for (const relPath of skeletonFiles) {
      const fullPath = path.join(root, relPath);
      assertOk(fs.existsSync(fullPath), `${relPath} must exist`);
      const content = fs.readFileSync(fullPath, "utf8");

      // Verify no light-theme base background classes exist in loading skeletons (ignoring hover states)
      const lightBgRegex = /(?:^|[\s"'])(?:bg-white|bg-gray-50|bg-gray-100|bg-slate-50)(?:[\s"']|$)/;
      assertOk(!lightBgRegex.test(content), `${relPath} skeleton must not use standalone light background classes`);
    }

    // Check ProjectDetailPage loading skeleton specifically
    const projectDetailContent = fs.readFileSync(
      path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx"),
      "utf8"
    );
    assertOk(
      projectDetailContent.includes("bg-surface-canvas") || projectDetailContent.includes("bg-background"),
      "Project detail loading state must enforce dark background (bg-surface-canvas or bg-background)"
    );

    // Check PageTransition container for canvas flash prevention
    const pageTransitionContent = fs.readFileSync(
      path.join(root, "src/components/PageTransition.tsx"),
      "utf8"
    );
    assertIncludes(
      pageTransitionContent,
      "bg-[#07090e]",
      "PageTransition container must enforce bg-[#07090e] on both normal and reduced-motion modes"
    );

    reporter.record(t1, 3, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 3, false, err, Date.now() - start1);
  }

  // Test 3.1.2: Dynamic ProjectCard hydration retains Stitch Executive Editorial palette
  const t2 = "Tier 3.1.2 - Dynamic Supabase data hydration into ProjectCard retains editorial surface hierarchy";
  const start2 = Date.now();
  try {
    const cardPath = path.join(root, "src/components/ProjectCard.tsx");
    assertOk(fs.existsSync(cardPath), "src/components/ProjectCard.tsx must exist");
    const content = fs.readFileSync(cardPath, "utf8");

    // Surface tokens
    assertIncludes(content, "bg-surface-low", "ProjectCard container must use bg-surface-low");
    assertIncludes(content, "border-border", "ProjectCard must use hairline border-border token");
    assertIncludes(content, "bg-surface-lowest", "Thumbnail wrapper must use bg-surface-lowest");

    // Champagne accent tokens
    assertIncludes(content, "text-champagne", "Category badge must use text-champagne");
    assertIncludes(content, "bg-surface-high", "Category badge wrapper must use bg-surface-high");
    assertIncludes(content, "group-hover:text-champagne", "Project title hover must transition to champagne");

    // Metrics tokens
    assertIncludes(content, "text-blue-200", "Views icon must be soft sky blue (text-blue-200)");
    assertIncludes(content, "text-metric", "Likes icon must use metric blue token");
    assertIncludes(content, "font-mono", "Metrics count and tags must use font-mono");

    reporter.record(t2, 3, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 3, false, err, Date.now() - start2);
  }

  // Test 3.1.3: Project Detail page dynamic markdown and JSONB hydration preserves dark prose styling
  const t3 = "Tier 3.1.3 - Dynamic project description hydration converts JSONB/markdown with dark prose-invert styling";
  const start3 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    assertOk(fs.existsSync(detailPath), "ProjectDetailPage.tsx must exist");
    const content = fs.readFileSync(detailPath, "utf8");

    // Checks conversion function and MarkdownRenderer
    assertIncludes(content, "tryConvertJsonToMarkdown", "Must handle BlockNote/JSON blocks conversion to markdown");
    assertOk(
      content.includes("prose-invert") || content.includes("dark:prose-invert"),
      "Description prose must enforce dark prose-invert styling"
    );
    assertIncludes(content, "MarkdownRenderer", "Must render description via MarkdownRenderer");

    // Verify CTAs adhere to champagne Executive Editorial palette
    assertIncludes(content, "bg-champagne", "Primary demo action must use bg-champagne");
    assertIncludes(content, "text-[#090c13]", "Champagne button text must use obsidian dark #090c13");

    reporter.record(t3, 3, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 3, false, err, Date.now() - start3);
  }

  // Test 3.1.4: Real-time Supabase interaction counters preserve theme and optimistic UI state
  const t4 = "Tier 3.1.4 - Dynamic Supabase like and view telemetry updates maintain theme tokens and optimistic counts";
  const start4 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const content = fs.readFileSync(detailPath, "utf8");

    assertIncludes(content, "handleLike", "ProjectDetailPage must implement handleLike handler");
    assertIncludes(content, "text-red-400 border-red-500/40", "Liked state must style with accessible dark red accent");
    assertIncludes(content, "bg-surface-high border border-border", "Action buttons must use editorial surface-high");
    assertIncludes(content, "supabase.from(\"projects\").update", "Telemetries must synchronize with Supabase projects table");

    reporter.record(t4, 3, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 3, false, err, Date.now() - start4);
  }

  // Test 3.1.5: Nullable/boundary database record hydration does not break dark layout geometry
  const t5 = "Tier 3.1.5 - Nullable Supabase fields (images, demo links, tags) hydrate gracefully without layout shifting";
  const start5 = Date.now();
  try {
    const projectsServerPath = path.join(root, "src/app/projects/page.tsx");
    assertOk(fs.existsSync(projectsServerPath), "src/app/projects/page.tsx must exist");
    const content = fs.readFileSync(projectsServerPath, "utf8");

    // Server hydration fallback checks
    assertIncludes(content, "placeholder.svg", "Missing project image must fall back to /placeholder.svg");
    assertIncludes(content, "Uncategorized", "Missing category must fall back to Uncategorized");
    assertIncludes(content, "filter(Boolean)", "Tags must be safely filtered against null/undefined");

    reporter.record(t5, 3, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 3, false, err, Date.now() - start5);
  }

  // Test 3.1.6: Live Supabase database record hydration compatibility test
  const t6 = "Tier 3.1.6 - Live Supabase projects query returns records matching Executive Editorial requirements";
  const start6 = Date.now();
  try {
    const client = getSupabaseTestClient();
    const { data: projects, error } = await client
      .from("projects")
      .select("id, title, description, image_url, views, likes, categories(name)")
      .order("created_at", { ascending: false });

    assertOk(!error, `Supabase query failed: ${error?.message}`);
    assertOk(Array.isArray(projects) && projects.length >= 4, "Must retrieve at least 4 project case studies");

    for (const project of projects) {
      assertOk(typeof project.id === "string" && project.id.length > 0, "Project must have valid string id");
      assertOk(typeof project.title === "string" && project.title.length > 0, "Project must have valid non-empty title");
      assertOk(typeof project.description === "string", "Project description must be present string");
      assertOk(typeof project.views === "number", "Project views must be a valid number");
      assertOk(typeof project.likes === "number", "Project likes must be a valid number");
    }

    reporter.record(t6, 3, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 3, false, err, Date.now() - start6);
  }
}

// Direct execution support
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const reporter = new TestReporter("Tier 3 - Theme Data Hydration");
  await runThemeDataHydrationTests(reporter);
  reporter.printSummary();
}
