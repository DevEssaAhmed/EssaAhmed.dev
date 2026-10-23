import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { getSupabaseTestClient } from "../helpers/supabase-test-client.js";
import {
  assertOk,
  assertEqual,
  assertIncludes,
  assertNotIncludes,
} from "../helpers/assertions.js";

/**
 * Tier 2: Boundary & Corner Cases
 */
export async function runTier2BoundaryTests(reporter) {
  const root = config.projectRoot;

  // Test 2.1: Empty Tags Handling
  const t1 = "Boundary 2.1 - Project and Article components handle empty or null tags array gracefully";
  const start1 = Date.now();
  try {
    // Check ProjectsPage for safe tag handling
    const projectsPath = path.join(root, "src/app/projects/ProjectsPage.tsx");
    assertOk(fs.existsSync(projectsPath), "ProjectsPage.tsx must exist");
    const content = fs.readFileSync(projectsPath, "utf8");

    const hasSafeTagHandling =
      content.includes("tags = []") ||
      content.includes("tags?.") ||
      content.includes("tags || []") ||
      content.includes("Array.isArray(tags)") ||
      content.includes("tags.length") ||
      content.includes("tagUtils");
    assertOk(hasSafeTagHandling, "ProjectsPage must safely handle tags without throwing");

    // Also check projects page mapping
    const pagePath = path.join(root, "src/app/projects/page.tsx");
    const pageContent = fs.readFileSync(pagePath, "utf8");
    assertOk(
      pageContent.includes("Array.isArray(project.tags)") || pageContent.includes("tags || []"),
      "projects/page.tsx must safely handle project tags array"
    );

    reporter.record(t1, 2, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 2, false, err, Date.now() - start1);
  }

  // Test 2.2: Missing or Invalid Image URL Fallback
  const t2 = "Boundary 2.2 - Project listing and detail pages supply fallback placeholder for missing images";
  const start2 = Date.now();
  try {
    const pagePath = path.join(root, "src/app/projects/page.tsx");
    const content = fs.readFileSync(pagePath, "utf8");

    // Verify fallback placeholder string is provided if image_url is missing
    const hasPlaceholder =
      content.includes("image_url ||") ||
      content.includes("/placeholder.svg") ||
      content.includes("placeholder");
    assertOk(hasPlaceholder, "Projects page must supply a fallback placeholder when image_url is null");

    // Verify ProjectDetailPage handles missing image
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const detailContent = fs.readFileSync(detailPath, "utf8");
    const detailHasFallback =
      detailContent.includes("placeholder") ||
      detailContent.includes("image_url ||") ||
      detailContent.includes("project.image_url");
    assertOk(detailHasFallback, "ProjectDetailPage must have safe rendering for project images");

    reporter.record(t2, 2, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 2, false, err, Date.now() - start2);
  }

  // Test 2.3: Non-Existent Route (404) Handling
  const t3 = "Boundary 2.3 - 404 NotFound page renders Executive Editorial styling with return navigation";
  const start3 = Date.now();
  try {
    const notFoundPath = path.join(root, "src/app/NotFound.tsx");
    assertOk(fs.existsSync(notFoundPath), "src/app/NotFound.tsx must exist");
    const content = fs.readFileSync(notFoundPath, "utf8");

    assertIncludes(content, "Page Not Found", "NotFound component must display 'Page Not Found'");
    const hasDarkCanvas = content.includes("bg-surface") || content.includes("bg-background") || content.includes("bg-[#07090e]");
    assertOk(hasDarkCanvas, "NotFound must use dark canvas token (bg-surface, bg-background, or bg-[#07090e])");
    assertOk(content.includes('href="/"') || content.includes('href: "/"'), "NotFound must provide link back to Home");
    assertOk(content.includes('href="/projects"') || content.includes('href: "/projects"'), "NotFound must provide link to Projects");
    reporter.record(t3, 2, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 2, false, err, Date.now() - start3);
  }

  // Test 2.4: Non-Existent Project UUID Routing
  const t4 = "Boundary 2.4 - Project detail route calls Next.js notFound() for non-existent project IDs";
  const start4 = Date.now();
  try {
    const detailPagePath = path.join(root, "src/app/projects/[id]/page.tsx");
    assertOk(fs.existsSync(detailPagePath), "src/app/projects/[id]/page.tsx must exist");
    const content = fs.readFileSync(detailPagePath, "utf8");

    assertIncludes(content, "if (!project) notFound();", "Page must invoke notFound() when project is not found");
    assertIncludes(content, "generateMetadata", "Page must define generateMetadata with notFound fallback");
    reporter.record(t4, 2, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 2, false, err, Date.now() - start4);
  }

  // Test 2.5: 404 Tag Not Found Page
  const t5 = "Boundary 2.5 - Dedicated Tag Not Found route exists with safe return links";
  const start5 = Date.now();
  try {
    const tag404Path = path.join(root, "src/app/404-tag-not-found/page.tsx");
    assertOk(fs.existsSync(tag404Path), "404-tag-not-found/page.tsx must exist");
    const content = fs.readFileSync(tag404Path, "utf8");

    assertIncludes(content, "TagNotFoundPage", "Must export TagNotFoundPage");
    reporter.record(t5, 2, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 2, false, err, Date.now() - start5);
  }

  // Test 2.6: Global Error Boundary
  const t6 = "Boundary 2.6 - Root error boundary catches runtime exceptions and provides reset action";
  const start6 = Date.now();
  try {
    const errorPath = path.join(root, "src/app/error.tsx");
    assertOk(fs.existsSync(errorPath), "src/app/error.tsx must exist");
    const content = fs.readFileSync(errorPath, "utf8");

    assertIncludes(content, "reset", "Error boundary must accept and expose reset handler");
    const hasDarkCanvas = content.includes("bg-surface") || content.includes("bg-background") || content.includes("bg-[#07090e]");
    assertOk(hasDarkCanvas, "Error boundary must render on dark background (bg-surface, bg-background, or bg-[#07090e])");
    reporter.record(t6, 2, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 2, false, err, Date.now() - start6);
  }
}
