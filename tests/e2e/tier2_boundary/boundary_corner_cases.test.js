import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { getSupabaseTestClient } from "../helpers/supabase-test-client.js";
import { extractTextFromMarkdown, getMarkdownExcerpt } from "../../../src/lib/markdownUtils.ts";

const { projectRoot } = config;

/**
 * Tier 2: Boundary & Corner Cases
 * Authoritative source: ORIGINAL_REQUEST.md & PROJECT.md
 * Validates edge conditions: empty tags, missing images, invalid routes, 404 handling, high-density tags, and malformed data.
 */
describe("Tier 2 - Boundary & Corner Cases", () => {
  it("BND-T1: Empty and Null Tags Resilience", () => {
    // 1. Verify ProjectCard safely handles empty or null tags
    const projectCardPath = path.join(projectRoot, "src/components/ProjectCard.tsx");
    assert.ok(fs.existsSync(projectCardPath), "ProjectCard.tsx must exist");
    const pcContent = fs.readFileSync(projectCardPath, "utf8");

    // Must handle tags safely without crashing if tags is null/empty
    const hasSafeTagSlicing =
      pcContent.includes("(tags || []).slice") ||
      pcContent.includes("tags?.slice") ||
      pcContent.includes("tags.slice");
    assert.ok(hasSafeTagSlicing, "ProjectCard must include tag slicing logic");

    // 2. Verify ProjectsPage filter logic uses optional chaining on tags
    const projectsPagePath = path.join(projectRoot, "src/app/projects/ProjectsPage.tsx");
    const ppContent = fs.readFileSync(projectsPagePath, "utf8");
    assert.match(
      ppContent,
      /p\.tags\?\.some/,
      "ProjectsPage must use optional chaining p.tags?.some to safely handle empty or null tags"
    );
  });

  it("BND-T2: High-Density & Long Tags Wrap Safety", () => {
    const projectCardPath = path.join(projectRoot, "src/components/ProjectCard.tsx");
    const pcContent = fs.readFileSync(projectCardPath, "utf8");

    // Tag container must use flex-wrap to prevent horizontal overflow blowout
    assert.match(
      pcContent,
      /flex-wrap/,
      "Tag badges container in ProjectCard must declare 'flex-wrap' to prevent card layout blowout"
    );

    // TagsPage must also wrap tags safely
    const tagsPagePath = path.join(projectRoot, "src/app/articles/tags/TagsPage.tsx");
    if (fs.existsSync(tagsPagePath)) {
      const tpContent = fs.readFileSync(tagsPagePath, "utf8");
      assert.match(
        tpContent,
        /flex-wrap/,
        "TagsPage cloud container must declare 'flex-wrap' for high-density tag clouds"
      );
    }
  });

  it("BND-T3: Missing or Broken Image Fallback", () => {
    // 1. OptimizedImage must fallback to /placeholder.svg if src is missing/empty
    const optimizedImagePath = path.join(projectRoot, "src/components/OptimizedImage.tsx");
    assert.ok(fs.existsSync(optimizedImagePath), "OptimizedImage.tsx must exist");
    const oiContent = fs.readFileSync(optimizedImagePath, "utf8");

    assert.match(
      oiContent,
      /\/placeholder\.svg/,
      "OptimizedImage must declare fallback to '/placeholder.svg' when src is missing, empty, or undefined"
    );

    // 2. ProjectCard image container must preserve aspect ratio and declare dark fallback surface
    const projectCardPath = path.join(projectRoot, "src/components/ProjectCard.tsx");
    const pcContent = fs.readFileSync(projectCardPath, "utf8");
    assert.match(
      pcContent,
      /aspect-\[16\/10\]/,
      "ProjectCard visual container must enforce aspect-[16/10] to prevent layout shift with missing image"
    );
    assert.match(
      pcContent,
      /bg-surface-lowest/,
      "ProjectCard visual container must declare dark fallback background bg-surface-lowest"
    );
  });

  it("BND-T4: Non-Existent Project UUID 404 Routing", async () => {
    const supabase = getSupabaseTestClient();
    const nonExistentUuid = "00000000-0000-0000-0000-000000000000";

    // Query non-existent UUID from database
    const { data: project, error } = await supabase
      .from("projects")
      .select("id, title")
      .eq("id", nonExistentUuid)
      .maybeSingle();

    assert.equal(project, null, "Non-existent UUID must return null data");

    // Verify projects/[id]/page.tsx calls notFound()
    const pagePath = path.join(projectRoot, "src/app/projects/[id]/page.tsx");
    const pageContent = fs.readFileSync(pagePath, "utf8");
    assert.match(
      pageContent,
      /if\s*\(!project\)\s*notFound\(\)/,
      "projects/[id]/page.tsx must invoke notFound() when project is null"
    );

    // Verify generateMetadata returns "Project Not Found"
    assert.match(
      pageContent,
      /title:\s*["']Project Not Found["']/,
      "generateMetadata must set title to 'Project Not Found' when project is null"
    );
  });

  it("BND-T5: Invalid / Malformed Project UUID Parameter Handling", async () => {
    const supabase = getSupabaseTestClient();
    const malformedId = "non-existent-malformed-slug-12345";

    // Supabase query with malformed UUID should not throw fatal unhandled process error
    const { data: project, error } = await supabase
      .from("projects")
      .select("id, title")
      .eq("id", malformedId)
      .maybeSingle();

    assert.ok(project === null, "Malformed UUID query must return null");

    // ProjectDetailPage must catch error and safely navigate back to /projects
    const detailPath = path.join(projectRoot, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const detailContent = fs.readFileSync(detailPath, "utf8");
    assert.match(
      detailContent,
      /toast\.error\(['"]Project not found['"]\)/,
      "ProjectDetailPage must catch error and display error toast"
    );
    assert.match(
      detailContent,
      /navigate\(['"]\/projects['"]\)/,
      "ProjectDetailPage must navigate back to /projects when project lookup fails"
    );
  });

  it("BND-T6: Non-Existent Tag and 404 Fallback", () => {
    const tagNotFoundPath = path.join(projectRoot, "src/app/404-tag-not-found/TagNotFoundPage.tsx");
    assert.ok(fs.existsSync(tagNotFoundPath), "404-tag-not-found page must exist");
    const content = fs.readFileSync(tagNotFoundPath, "utf8");

    // Must render informative empty/fallback state
    assert.match(content, /Tag Page Coming Soon|Tag Not Found/i, "Must display tag not found messaging");
    assert.match(content, /Browse Categories/i, "Must provide link to browse categories");
    assert.match(content, /View All Articles/i, "Must provide link to view all articles");
  });

  it("BND-T7: Extreme Title and Description Text Truncation", () => {
    const projectCardPath = path.join(projectRoot, "src/components/ProjectCard.tsx");
    const pcContent = fs.readFileSync(projectCardPath, "utf8");

    // Must enforce line-clamp-2 on title
    assert.match(
      pcContent,
      /line-clamp-2/,
      "ProjectCard title must declare 'line-clamp-2' to prevent layout blowout from 200+ char titles"
    );

    // Must enforce line-clamp-3 on description
    assert.match(
      pcContent,
      /line-clamp-3/,
      "ProjectCard description must declare 'line-clamp-3' to prevent card expansion from long markdown"
    );
  });

  it("BND-T8: Adversarial Input Escaping & Special Characters", () => {
    // 1. Markdown utility plain text extraction with adversarial inputs
    const xssPayload = "<script>alert('xss')</script> [click here](javascript:alert(1))";
    const plain = extractTextFromMarkdown(xssPayload);
    assert.equal(typeof plain, "string");
    assert.ok(!plain.includes("[click here]("), "Markdown links must be stripped from plain excerpt");

    // 2. Special characters and entity safety
    const specialChars = "Defect Rate & KPI: 4-Wheel \"Vendor\" 'Batch' — Suzuki #1 < 5% > 2%";
    const excerpt = getMarkdownExcerpt(specialChars, 100);
    assert.ok(excerpt.includes("Defect Rate & KPI"), "Excerpt should preserve semantic text");
    assert.ok(excerpt.length <= 103, "Excerpt must honor maxLength bound");

    // 3. Deeply nested markdown headers, blockquotes, code fences
    const heavyMarkdown = "### Deep Header\n\n> Nested quote\n\n```python\ndef test():\n    pass\n```\n\nBody paragraph.";
    const cleanBody = extractTextFromMarkdown(heavyMarkdown);
    assert.doesNotMatch(cleanBody, /###/, "Markdown header tokens must be stripped");
    assert.doesNotMatch(cleanBody, /```/, "Code fence tokens must be stripped");
    assert.match(cleanBody, /Body paragraph/, "Body paragraph must be retained");
  });

  it("BND-T9: Empty Search and Category Filter State", () => {
    const projectsPagePath = path.join(projectRoot, "src/app/projects/ProjectsPage.tsx");
    const ppContent = fs.readFileSync(projectsPagePath, "utf8");

    // Must render "No matching case studies" empty state
    assert.match(
      ppContent,
      /No matching case studies/,
      "ProjectsPage must render 'No matching case studies' when filter yields 0 matches"
    );
    assert.match(
      ppContent,
      /Reset Filters/,
      "ProjectsPage must provide a 'Reset Filters' button in empty filter state"
    );
  });

  it("BND-T10: Zero Database Projects Fallback State", () => {
    const projectsPagePath = path.join(projectRoot, "src/app/projects/ProjectsPage.tsx");
    const ppContent = fs.readFileSync(projectsPagePath, "utf8");

    // Must render "Projects in Production" empty banner when initialProjects is empty
    assert.match(
      ppContent,
      /Projects in Production/,
      "ProjectsPage must render 'Projects in Production' empty banner when database has 0 projects"
    );
    assert.match(
      ppContent,
      /Read Latest Articles/,
      "Zero projects fallback must link to /articles"
    );
  });

  it("BND-T11: Corrupted Block JSON to Markdown Conversion", () => {
    const detailPath = path.join(projectRoot, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const detailContent = fs.readFileSync(detailPath, "utf8");

    // Verify tryConvertJsonToMarkdown handles try/catch safely
    assert.match(
      detailContent,
      /function tryConvertJsonToMarkdown/,
      "ProjectDetailPage must define tryConvertJsonToMarkdown parser"
    );
    assert.match(
      detailContent,
      /try\s*\{[\s\S]*JSON\.parse[\s\S]*catch/,
      "tryConvertJsonToMarkdown must wrap JSON.parse in try/catch to safely return raw content on corruption"
    );
  });
});
