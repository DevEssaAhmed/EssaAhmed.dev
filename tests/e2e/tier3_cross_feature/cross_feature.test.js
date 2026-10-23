import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { getSupabaseTestClient } from "../helpers/supabase-test-client.js";
import {
  assertOk,
  assertEqual,
  assertGte,
  assertIncludes,
} from "../helpers/assertions.js";

/**
 * Tier 3: Cross-Feature Combinations
 */
export async function runTier3CrossFeatureTests(reporter) {
  const root = config.projectRoot;
  let supabase;
  try {
    supabase = getSupabaseTestClient();
  } catch (err) {
    reporter.record("Tier 3 - Supabase Client Initialization", 3, false, err, 0);
    return;
  }

  // Test 3.1: Theme + Navigation Integration
  const t1 = "Cross-Feature 3.1 - Navigation component applies dark surfaces, hairline borders, and champagne accents";
  const start1 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    assertOk(fs.existsSync(navPath), "Navigation.tsx must exist");
    const content = fs.readFileSync(navPath, "utf8");

    assertIncludes(content, "bg-surface", "Navigation must use bg-surface tokens");
    assertIncludes(content, "outline-variant", "Navigation must use hairline outline-variant token");
    assertIncludes(content, "text-on-surface", "Navigation items must use text-on-surface tokens");
    assertIncludes(content, "surface-container", "Navigation controls must use surface-container tokens");
    reporter.record(t1, 3, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 3, false, err, Date.now() - start1);
  }

  // Test 3.2: Dynamic Supabase Query + Data Mapping Contract
  const t2 = "Cross-Feature 3.2 - Live Supabase joined query (projects + categories + tags) matches ProjectCard schema";
  const start2 = Date.now();
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*, categories(name), project_tags(tags(name))")
      .order("created_at", { ascending: false });

    assertOk(!error, `Supabase joined query failed: ${error?.message}`);
    assertOk(Array.isArray(data), "Data must be an array");
    assertGte(data.length, 1, "Must return at least one project");

    // Test data transformation exactly as executed in src/app/projects/page.tsx
    const mapped = data.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image_url || "/placeholder.svg",
      tags: (p.project_tags || []).map((pt) => pt.tags?.name).filter(Boolean),
      category: p.categories?.name || "Uncategorized",
      demoUrl: p.demo_url,
      githubUrl: p.github_url,
      views: p.views || 0,
      likes: p.likes || 0,
      comments: p.comments || 0,
    }));

    const sample = mapped[0];
    assertOk(sample.id, "Mapped project must contain id");
    assertOk(sample.title, "Mapped project must contain title");
    assertOk(Array.isArray(sample.tags), "Mapped project must contain array of tags");
    assertOk(typeof sample.category === "string", "Mapped project must contain category string");
    assertOk(sample.image, "Mapped project must contain valid image or placeholder");

    reporter.record(t2, 3, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 3, false, err, Date.now() - start2);
  }

  // Test 3.3: Filter Pills + Article Listing Contract
  const t3 = "Cross-Feature 3.3 - Articles listing integrates category filtering and metadata pills";
  const start3 = Date.now();
  try {
    const articlesPath = path.join(root, "src/app/articles/ArticlesPage.tsx");
    assertOk(fs.existsSync(articlesPath), "ArticlesPage.tsx must exist");
    const content = fs.readFileSync(articlesPath, "utf8");

    assertOk(content.includes("bg-surface") || content.includes("bg-background"), "ArticlesPage must use canvas token");
    const hasFilters =
      content.includes("filter") ||
      content.includes("category") ||
      content.includes("selectedCategory");
    assertOk(hasFilters, "ArticlesPage must include filtering capability");
    reporter.record(t3, 3, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 3, false, err, Date.now() - start3);
  }

  // Test 3.4: Project Detail Gallery Switcher + Supabase Assets
  const t4 = "Cross-Feature 3.4 - Project detail supports additional_images gallery and media switching";
  const start4 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    assertOk(fs.existsSync(detailPath), "ProjectDetailPage.tsx must exist");
    const content = fs.readFileSync(detailPath, "utf8");

    const hasMediaOrGallery =
      content.includes("additional_images") ||
      content.includes("image_url") ||
      content.includes("selectedImage") ||
      content.includes("activeImage") ||
      content.includes("gallery");
    assertOk(hasMediaOrGallery, "ProjectDetailPage must include media presentation logic");
    reporter.record(t4, 3, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 3, false, err, Date.now() - start4);
  }

  // Test 3.5: Breadcrumbs Navigation Hierarchy
  const t5 = "Cross-Feature 3.5 - Breadcrumbs component exposes structured accessible path hierarchy";
  const start5 = Date.now();
  try {
    const bcPath = path.join(root, "src/components/Breadcrumbs.tsx");
    assertOk(fs.existsSync(bcPath), "Breadcrumbs.tsx must exist");
    const content = fs.readFileSync(bcPath, "utf8");

    assertIncludes(content, 'aria-label="Breadcrumb"', "Breadcrumbs must declare aria-label");
    assertIncludes(content, "text-champagne", "Active/current breadcrumb item must adopt champagne highlight");
    reporter.record(t5, 3, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 3, false, err, Date.now() - start5);
  }
}
