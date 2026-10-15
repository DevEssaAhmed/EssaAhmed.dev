import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import {
  assertOk,
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assertGte,
} from "../helpers/assertions.js";
import { TestReporter } from "../helpers/reporter.js";
import { getSupabaseTestClient } from "../helpers/supabase-test-client.js";

/**
 * Tier 4: Real-World Scenario 4.3 - Supabase Production Data Pipeline
 * Connects directly to the live Supabase instance to validate data consistency,
 * category foreign keys, project_tags junction mappings, asset URLs, and contacts schema.
 */
export async function runSupabaseProductionScenarioTests(reporter) {
  const client = getSupabaseTestClient();

  // Scenario 4.3.1: Live Projects Verification
  const t1 = "Tier 4.3.1 - Supabase projects table contains the 5 high-impact editorial case studies";
  const start1 = Date.now();
  try {
    const { data: projects, error } = await client
      .from("projects")
      .select("id, title, description, image_url, featured, views, likes, category_id, additional_images")
      .order("created_at", { ascending: false });

    assertOk(!error, `Failed to query projects: ${error?.message}`);
    assertOk(Array.isArray(projects), "Projects result must be an array");
    assertGte(projects.length, 5, "Database must contain at least 5 projects");

    const projectIds = new Set(projects.map((p) => p.id));
    const expectedIds = [
      "4e489887-2834-4774-ae54-a0b8a5b0c2a3", // Vendor Defect
      "e51f2539-7631-435e-8f77-d560c5d7fc66", // Suzuki QA
      "0c806cae-9ceb-4249-90b6-332353ef771c", // Stitching Productivity
      "d17bf217-6beb-4b4b-8f52-7444d58c453a", // Rejection Automation
      "315cf60d-63e1-4473-873c-c5ca6a12cc29", // OverTime Dashboard
    ];

    for (const id of expectedIds) {
      assertOk(projectIds.has(id), `Expected project ID ${id} must exist in Supabase database`);
    }

    // Verify Stitching Productivity has featured=true (Feature 2 in PROJECT.md)
    const stitchingProject = projects.find((p) => p.id === "0c806cae-9ceb-4249-90b6-332353ef771c");
    assertOk(stitchingProject, "Stitching project must be present");
    assertOk(stitchingProject.featured === true, "Stitching project must have featured=true");

    reporter.record(t1, 4, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 4, false, err, Date.now() - start1);
  }

  // Scenario 4.3.2: Categories Table and Foreign Key Integrity
  const t2 = "Tier 4.3.2 - Supabase categories table contains required categories and no orphaned projects";
  const start2 = Date.now();
  try {
    const { data: categories, error: catError } = await client
      .from("categories")
      .select("id, name, slug");

    assertOk(!catError, `Failed to query categories: ${catError?.message}`);
    assertOk(Array.isArray(categories) && categories.length > 0, "Categories must be populated");

    const categoryNames = new Set(categories.map((c) => c.name));
    assertOk(categoryNames.has("Business Intelligence"), "Must contain 'Business Intelligence' category");
    assertOk(categoryNames.has("Data Pipelines"), "Must contain 'Data Pipelines' category");
    assertOk(categoryNames.has("Automation"), "Must contain 'Automation' category");

    // Check that every project has a valid category_id
    const validCategoryIds = new Set(categories.map((c) => c.id));
    const { data: projects, error: projError } = await client
      .from("projects")
      .select("id, title, category_id");

    assertOk(!projError, `Failed to query project category links: ${projError?.message}`);
    for (const p of projects || []) {
      assertOk(p.category_id, `Project ${p.title} (${p.id}) must have category_id`);
      assertOk(
        validCategoryIds.has(p.category_id),
        `Project ${p.title} category_id ${p.category_id} must reference a valid category in categories table`
      );
    }

    reporter.record(t2, 4, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 4, false, err, Date.now() - start2);
  }

  // Scenario 4.3.3: Project Tags Junction Table Integrity
  const t3 = "Tier 4.3.3 - project_tags junction table links all 5 case studies to standardized tags";
  const start3 = Date.now();
  try {
    const { data: projectTags, error } = await client
      .from("project_tags")
      .select("project_id, tag_id, tags(name)");

    assertOk(!error, `Failed to query project_tags: ${error?.message}`);
    assertOk(Array.isArray(projectTags), "project_tags must be an array");
    assertGte(projectTags.length, 10, "project_tags junction table must have at least 10 tag associations");

    const taggedProjectIds = new Set(projectTags.map((pt) => pt.project_id));
    const expectedIds = [
      "4e489887-2834-4774-ae54-a0b8a5b0c2a3",
      "e51f2539-7631-435e-8f77-d560c5d7fc66",
      "0c806cae-9ceb-4249-90b6-332353ef771c",
      "d17bf217-6beb-4b4b-8f52-7444d58c453a",
      "315cf60d-63e1-4473-873c-c5ca6a12cc29",
    ];

    for (const id of expectedIds) {
      assertOk(
        taggedProjectIds.has(id),
        `Project ID ${id} must have associated tags in project_tags junction table`
      );
    }

    reporter.record(t3, 4, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 4, false, err, Date.now() - start3);
  }

  // Scenario 4.3.4: Asset and Media URL Integrity
  const t4 = "Tier 4.3.4 - Project asset image URLs and additional_images are non-empty and reachable format";
  const start4 = Date.now();
  try {
    const { data: projects, error } = await client
      .from("projects")
      .select("id, title, image_url, additional_images");

    assertOk(!error, `Failed to query project media: ${error?.message}`);

    for (const p of projects || []) {
      assertOk(typeof p.image_url === "string" && p.image_url.length > 0, `Project ${p.title} must have image_url`);
      assertOk(
        p.image_url.startsWith("http://") ||
          p.image_url.startsWith("https://") ||
          p.image_url.startsWith("/"),
        `Project ${p.title} image_url must be a valid HTTP/HTTPS URL or root-relative path: ${p.image_url}`
      );

      if (Array.isArray(p.additional_images) && p.additional_images.length > 0) {
        for (const img of p.additional_images) {
          assertOk(
            typeof img === "string" &&
              (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")),
            `Project ${p.title} additional image must be valid URL: ${img}`
          );
        }
      }
    }

    reporter.record(t4, 4, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 4, false, err, Date.now() - start4);
  }

  // Scenario 4.3.5: Contacts Table Schema & Dispatch Verification
  const t5 = "Tier 4.3.5 - Supabase contacts table is accessible and configured for project brief ingestion";
  const start5 = Date.now();
  try {
    // Perform a select query with limit(0) to verify table existence and column readiness
    const { data, error } = await client
      .from("contacts")
      .select("id, name, email, purpose, message, created_at")
      .limit(1);

    assertOk(!error, `contacts table check failed: ${error?.message}`);
    assertOk(Array.isArray(data), "contacts table query must return an array");

    reporter.record(t5, 4, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 4, false, err, Date.now() - start5);
  }
}

// Direct execution support
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const reporter = new TestReporter("Tier 4 - Supabase Production Scenario");
  await runSupabaseProductionScenarioTests(reporter);
  reporter.printSummary();
}
