import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { getSupabaseTestClient } from "../helpers/supabase-test-client.js";

const { projectRoot } = config;

/**
 * Tier 1: Feature Coverage — Requirement R2
 * Authoritative source: ORIGINAL_REQUEST.md & PROJECT.md
 * R2: Supabase Project Data & Asset Synchronization
 */
describe("Tier 1 - R2: Supabase Project Data & Asset Synchronization", () => {
  it("R2-T1: 5 Core Case Studies Exist in Supabase projects Table", async () => {
    const supabase = getSupabaseTestClient();
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id, title, description, image_url, featured, tags");

    assert.equal(error, null, `Supabase query should not error: ${error?.message}`);
    assert.ok(Array.isArray(projects), "Projects must return an array");
    assert.ok(projects.length >= 5, `Expected at least 5 projects in database, found ${projects.length}`);

    const projectTitles = projects.map((p) => p.title.toLowerCase());

    // Verify key editorial case studies are present
    const expectedKeywords = [
      "vendor defect analysis",
      "suzuki",
      "stitching offline productivity",
      "rejection",
      "overtime",
    ];

    for (const keyword of expectedKeywords) {
      const match = projectTitles.some((t) => t.includes(keyword));
      assert.ok(match, `Case study containing "${keyword}" must exist in Supabase projects table`);
    }

    // Verify each project has valid title and image URL
    for (const p of projects) {
      assert.ok(p.title && p.title.trim().length > 0, `Project ${p.id} must have a non-empty title`);
      assert.ok(p.image_url && p.image_url.startsWith("http"), `Project ${p.id} must have a valid HTTP image_url`);
    }
  });

  it("R2-T2: Stitching Offline Productivity Dashboard Featured Flag and Payload", async () => {
    const supabase = getSupabaseTestClient();
    const { data: stitchingProjects, error } = await supabase
      .from("projects")
      .select("id, title, featured, tags, description")
      .ilike("title", "%Stitching%");

    assert.equal(error, null, "Query for Stitching project should succeed");
    assert.ok(stitchingProjects && stitchingProjects.length > 0, "Stitching project must exist");

    const stitching = stitchingProjects[0];
    assert.equal(
      stitching.featured,
      true,
      "Stitching Offline Productivity Dashboard must have featured=true per Executive Editorial showcase specs"
    );
    assert.ok(Array.isArray(stitching.tags) && stitching.tags.length > 0, "Stitching project must have tags populated");
    assert.ok(
      stitching.description && stitching.description.length > 20,
      "Stitching project must have a detailed editorial description"
    );
  });

  it("R2-T3: Supabase Storage Public CDN Asset Reachability", async () => {
    const supabase = getSupabaseTestClient();
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id, title, image_url, additional_images");

    assert.equal(error, null, "Projects fetch for asset verification should succeed");
    assert.ok(projects && projects.length > 0, "Must have projects to verify assets");

    // Collect all image URLs
    const assetUrls = [];
    for (const p of projects) {
      if (p.image_url) assetUrls.push(p.image_url);
      if (Array.isArray(p.additional_images)) {
        for (const img of p.additional_images) {
          if (img) assetUrls.push(img);
        }
      }
    }

    assert.ok(assetUrls.length > 0, "Should have assets to test reachability");

    // Test reachability for first 5 primary assets
    for (const url of assetUrls.slice(0, 5)) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        assert.equal(
          res.status,
          200,
          `Storage asset ${url} must return HTTP 200 OK, got ${res.status}`
        );
        const contentType = res.headers.get("content-type") || "";
        assert.ok(
          contentType.startsWith("image/") || contentType.includes("octet-stream"),
          `Storage asset ${url} content-type must be image, got ${contentType}`
        );
      } catch (err) {
        // If HEAD is blocked by CORS/CDN, fallback to GET range request
        const getRes = await fetch(url, {
          method: "GET",
          headers: { Range: "bytes=0-10" },
        });
        assert.ok(
          getRes.status === 200 || getRes.status === 206,
          `Asset fallback GET ${url} must return 200/206, got ${getRes.status}`
        );
      }
    }
  });

  it("R2-T4: Category and Tag Junction Synchronization", async () => {
    const supabase = getSupabaseTestClient();

    // 1. Verify categories exist
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name, slug");

    assert.equal(catError, null, "Categories query should succeed");
    assert.ok(categories && categories.length >= 2, "Expected at least 2 categories");

    const categoryNames = categories.map((c) => c.name);
    assert.ok(
      categoryNames.includes("Business Intelligence"),
      "Business Intelligence category must exist"
    );

    // 2. Verify project_tags junction records exist
    const { data: junctionRows, error: junctionError } = await supabase
      .from("project_tags")
      .select("project_id, tag_id")
      .limit(50);

    assert.equal(junctionError, null, "project_tags junction query should succeed");
    assert.ok(
      junctionRows && junctionRows.length > 0,
      `Expected project_tags junction mappings, found ${junctionRows?.length || 0}`
    );
  });

  it("R2-T5: Home Page FeaturedWork Direct UUID Links", () => {
    const featuredWorkPath = path.join(projectRoot, "src/components/home/FeaturedWork.tsx");
    assert.ok(fs.existsSync(featuredWorkPath), "FeaturedWork.tsx must exist");
    const content = fs.readFileSync(featuredWorkPath, "utf8");

    // Case studies in FeaturedWork must link directly to /projects/[uuid]
    const uuidPattern = /\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
    const matches = content.match(uuidPattern) || [];

    assert.ok(
      matches.length >= 4,
      `FeaturedWork.tsx must link all 4 showcase cards to /projects/[uuid], found ${matches.length} direct UUID links`
    );

    // Verify key project UUIDs are present
    assert.match(
      content,
      /4e489887-2834-4774-ae54-a0b8a5b0c2a3/,
      "FeaturedWork must link to 4-Wheel Vendor Defect UUID"
    );
    assert.match(
      content,
      /e51f2539-7631-435e-8f77-d560c5d7fc66/,
      "FeaturedWork must link to Suzuki QA UUID"
    );
    assert.match(
      content,
      /0c806cae-9ceb-4249-90b6-332353ef771c/,
      "FeaturedWork must link to Stitching Productivity UUID"
    );
  });

  it("R2-T6: Supabase Strongly Typed Database Schema Definitions", () => {
    const typesPath = path.join(projectRoot, "src/integrations/supabase/types.ts");
    assert.ok(fs.existsSync(typesPath), "src/integrations/supabase/types.ts must exist");
    const typesContent = fs.readFileSync(typesPath, "utf8");

    // Must NOT be stubbed as export type Database = any;
    assert.doesNotMatch(
      typesContent,
      /export\s+type\s+Database\s*=\s*any\s*;/,
      "Database type must not be stubbed as 'any'"
    );

    // Must contain typed Tables definition
    assert.match(typesContent, /projects:\s*\{/, "Must declare typed 'projects' table");
    assert.match(typesContent, /categories:\s*\{/, "Must declare typed 'categories' table");
    assert.match(typesContent, /tags:\s*\{/, "Must declare typed 'tags' table");
    assert.match(typesContent, /project_tags:\s*\{/, "Must declare typed 'project_tags' table");
    assert.match(typesContent, /featured:\s*boolean\s*\|\s*null/, "projects must have typed featured boolean");
  });

  it("R2-T7: Project Detail Server Data-Fetching Contract", () => {
    const pagePath = path.join(projectRoot, "src/app/projects/[id]/page.tsx");
    assert.ok(fs.existsSync(pagePath), "src/app/projects/[id]/page.tsx must exist");
    const pageContent = fs.readFileSync(pagePath, "utf8");

    // Must import notFound from next/navigation
    assert.match(pageContent, /notFound/, "projects/[id]/page.tsx must import notFound");
    // Must invoke notFound() when project is missing
    assert.match(pageContent, /if\s*\(!project\)\s*notFound\(\)/, "Must call notFound() when project is null");
    // Must query Supabase server with joins
    assert.match(pageContent, /from\(["']projects["']\)/, "Must query projects table");
    assert.match(pageContent, /from\(["']project_tags["']\)/, "Must query project_tags junction");
  });
});
