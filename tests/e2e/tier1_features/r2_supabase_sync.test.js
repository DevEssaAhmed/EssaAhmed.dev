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
 * Tier 1: Requirement R2 - Supabase Project Data & Asset Synchronization
 */
export async function runR2SupabaseSyncTests(reporter) {
  const root = config.projectRoot;
  let supabase;
  try {
    supabase = getSupabaseTestClient();
  } catch (err) {
    reporter.record("R2 - Supabase Client Initialization", 1, false, err, 0);
    return;
  }

  // Test 2.1: Categories Synchronization ("Data Pipelines", "Automation", "Business Intelligence")
  const t1 = "R2.1 - Categories table contains 'Data Pipelines', 'Automation', and 'Business Intelligence'";
  const start1 = Date.now();
  try {
    const { data: categories, error } = await supabase.from("categories").select("*");
    assertOk(!error, `Failed to query categories: ${error?.message}`);
    assertOk(Array.isArray(categories), "Categories must return an array");

    const categoryNames = categories.map((c) => c.name);
    assertIncludes(categoryNames, "Data Pipelines", "Categories must include 'Data Pipelines'");
    assertIncludes(categoryNames, "Automation", "Categories must include 'Automation'");
    assertIncludes(categoryNames, "Business Intelligence", "Categories must include 'Business Intelligence'");

    // Verify slugs are standardized
    const slugs = categories.map((c) => c.slug);
    assertIncludes(slugs, "data-pipelines", "Categories must include slug 'data-pipelines'");
    assertIncludes(slugs, "automation", "Categories must include slug 'automation'");
    assertIncludes(slugs, "business-intelligence", "Categories must include slug 'business-intelligence'");

    reporter.record(t1, 1, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 1, false, err, Date.now() - start1);
  }

  // Test 2.2: Standardized Tags Synchronization
  const t2 = "R2.2 - Tags table contains standardized editorial tags (Power BI, QA, Manufacturing, etc.)";
  const start2 = Date.now();
  try {
    const { data: tags, error } = await supabase.from("tags").select("*");
    assertOk(!error, `Failed to query tags: ${error?.message}`);
    assertOk(Array.isArray(tags), "Tags must return an array");

    const tagNames = tags.map((t) => t.name);
    const expectedTags = [
      "Power BI",
      "Quality Assurance",
      "Manufacturing",
      "Operations",
      "Vendor Management",
      "ETL",
    ];

    for (const expected of expectedTags) {
      assertIncludes(tagNames, expected, `Tags must include '${expected}'`);
    }
    reporter.record(t2, 1, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 1, false, err, Date.now() - start2);
  }

  // Test 2.3: High-Impact Editorial Case Study Records
  const t3 = "R2.3 - Projects table contains the high-impact editorial case studies with images and descriptions";
  const start3 = Date.now();
  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id, title, description, image_url, featured, category_id");
    assertOk(!error, `Failed to query projects: ${error?.message}`);
    assertOk(Array.isArray(projects), "Projects must return an array");
    assertGte(projects.length, 5, "Projects table should contain at least 5 records");

    // Key case studies that must be present
    const titles = projects.map((p) => p.title);
    const expectedTitles = [
      "Stitching Offline Productivity Dashboard",
      "4-Wheel Vendor Defect Analysis – Executive Quality Review",
      "Case Study: Suzuki Manufacturing Quality Assurance Dashboard",
      "Rejection Dashboard Automation",
    ];

    for (const title of expectedTitles) {
      const match = projects.find((p) => p.title.includes(title.split("–")[0].trim()));
      assertOk(match, `Project with title matching '${title}' must exist in database`);
      assertOk(match.image_url, `Project '${title}' must have an image_url`);
      assertOk(
        match.image_url.startsWith("https://") || match.image_url.startsWith("/"),
        `Project image_url must be an absolute HTTPS or root path: ${match.image_url}`
      );
      assertOk(match.description && match.description.length > 20, `Project '${title}' must have a valid description`);
    }
    reporter.record(t3, 1, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 1, false, err, Date.now() - start3);
  }

  // Test 2.4: Project Tags Junction Table Mapping
  const t4 = "R2.4 - project_tags junction table links all projects to multiple standardized tags";
  const start4 = Date.now();
  try {
    const { data: junctionRows, error } = await supabase
      .from("project_tags")
      .select("project_id, tag_id, tags(name)");
    assertOk(!error, `Failed to query project_tags: ${error?.message}`);
    assertOk(Array.isArray(junctionRows), "project_tags must return an array");
    assertGte(junctionRows.length, 15, "project_tags junction table must have at least 15 relationships");

    // Ensure projects have associated tags
    const projectTagMap = new Map();
    for (const row of junctionRows) {
      if (!projectTagMap.has(row.project_id)) projectTagMap.set(row.project_id, []);
      projectTagMap.get(row.project_id).push(row.tags?.name);
    }
    assertGte(projectTagMap.size, 4, "At least 4 distinct projects must have tags in junction table");

    reporter.record(t4, 1, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 1, false, err, Date.now() - start4);
  }

  // Test 2.5: Featured Projects & FeaturedWork Direct Links
  const t5 = "R2.5 - FeaturedWork component links 4 case studies directly to /projects/[id] UUIDs";
  const start5 = Date.now();
  try {
    // 1. Verify database featured flag on Stitching Productivity
    const { data: stitching, error } = await supabase
      .from("projects")
      .select("id, title, featured")
      .eq("id", "0c806cae-9ceb-4249-90b6-332353ef771c")
      .single();
    assertOk(!error, `Failed to query stitching project: ${error?.message}`);
    assertEqual(stitching.featured, true, "Stitching Productivity Dashboard must have featured=true");

    // 2. Verify FeaturedWork component code links to actual UUIDs
    const fwPath = path.join(root, "src/components/home/FeaturedWork.tsx");
    assertOk(fs.existsSync(fwPath), "FeaturedWork.tsx must exist");
    const fwContent = fs.readFileSync(fwPath, "utf8");

    const expectedUUIDs = [
      "4e489887-2834-4774-ae54-a0b8a5b0c2a3",
      "e51f2539-7631-435e-8f77-d560c5d7fc66",
      "0c806cae-9ceb-4249-90b6-332353ef771c",
      "d17bf217-6beb-4b4b-8f52-7444d58c453a",
    ];

    for (const uuid of expectedUUIDs) {
      assertIncludes(
        fwContent,
        `/projects/${uuid}`,
        `FeaturedWork.tsx must link directly to case study UUID ${uuid}`
      );
    }
    reporter.record(t5, 1, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 1, false, err, Date.now() - start5);
  }

  // Test 2.6: Supabase Storage CDN Media Accessibility
  const t6 = "R2.6 - Project images hosted on Supabase Storage CDN are reachable and return HTTP 200";
  const start6 = Date.now();
  try {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title, image_url")
      .not("image_url", "is", null)
      .limit(3);

    assertOk(projects && projects.length > 0, "Must have projects with image_url to test");

    for (const p of projects) {
      if (p.image_url && p.image_url.startsWith("https://")) {
        const res = await fetch(p.image_url, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        });
        assertOk(
          res.ok || res.status === 200 || res.status === 304,
          `Image for project '${p.title}' returned status ${res.status}: ${p.image_url}`
        );
      }
    }
    reporter.record(t6, 1, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 1, false, err, Date.now() - start6);
  }
}
