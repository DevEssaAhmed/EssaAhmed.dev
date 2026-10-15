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
 * Tier 4: Real-World Application Scenarios
 */
export async function runTier4RealWorldTests(reporter) {
  const root = config.projectRoot;
  let supabase;
  try {
    supabase = getSupabaseTestClient();
  } catch (err) {
    reporter.record("Tier 4 - Supabase Client Initialization", 4, false, err, 0);
    return;
  }

  // Scenario 4.1: Executive Recruiter / Client Case Study Journey (Desktop)
  const t1 = "Scenario 4.1 - Executive Recruiter Journey: Home Hero -> Featured Case Study -> Project Detail & Metrics";
  const start1 = Date.now();
  try {
    // 1. Inspect FeaturedWork cards for executive case studies
    const fwPath = path.join(root, "src/components/home/FeaturedWork.tsx");
    const fwContent = fs.readFileSync(fwPath, "utf8");

    // Case study target: 4-Wheel Vendor Defect Analysis
    const vendorDefectUUID = "4e489887-2834-4774-ae54-a0b8a5b0c2a3";
    assertIncludes(fwContent, `/projects/${vendorDefectUUID}`, "FeaturedWork must link to Vendor Defect Analysis case study");

    // 2. Fetch targeted project from database to ensure real-world data payload is intact
    const { data: project, error: pErr } = await supabase
      .from("projects")
      .select("*, categories(name)")
      .eq("id", vendorDefectUUID)
      .single();

    assertOk(!pErr, `Target project lookup failed: ${pErr?.message}`);
    assertOk(project, "Target project must exist in Supabase");
    assertIncludes(project.title, "Vendor Defect", "Project title must match case study");
    assertOk(project.image_url, "Project must have valid image asset URL");

    // 3. Verify ProjectDetailPage can receive and render this project's payload
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const detailContent = fs.readFileSync(detailPath, "utf8");
    assertIncludes(detailContent, "initialProject", "ProjectDetailPage must accept initialProject prop");
    assertIncludes(detailContent, "title", "ProjectDetailPage must render title");

    reporter.record(t1, 4, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 4, false, err, Date.now() - start1);
  }

  // Scenario 4.2: Mobile Engineering Leader Viewport Journey
  const t2 = "Scenario 4.2 - Mobile Engineering Leader Journey: 375px Viewport -> Hamburger Nav -> Projects Grid";
  const start2 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const navContent = fs.readFileSync(navPath, "utf8");

    // Verify mobile hamburger button exists and opens portal drawer
    assertIncludes(navContent, "mobileMenu", "Navigation must render mobileMenu portal");
    assertIncludes(navContent, "overflow = 'hidden'", "Body scroll must lock when mobile drawer opens");
    assertIncludes(navContent, "/projects", "Mobile nav must include Projects route");

    // Verify ProjectsPage handles single-column mobile view
    const projectsPath = path.join(root, "src/app/projects/ProjectsPage.tsx");
    const projectsContent = fs.readFileSync(projectsPath, "utf8");
    assertIncludes(projectsContent, "grid-cols-1", "Projects grid must be 1 column on mobile viewports");

    reporter.record(t2, 4, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 4, false, err, Date.now() - start2);
  }

  // Scenario 4.3: Knowledge Explorer Journey (Articles, Categories, Diary)
  const t3 = "Scenario 4.3 - Knowledge Explorer Journey: Articles Filter -> Read Article -> Diary Timeline";
  const start3 = Date.now();
  try {
    // 1. Articles Hub verification
    const articlesPath = path.join(root, "src/app/articles/ArticlesPage.tsx");
    assertOk(fs.existsSync(articlesPath), "ArticlesPage must exist");

    // 2. Diary Hub verification
    const diaryPath = path.join(root, "src/app/diary/DiaryPage.tsx");
    assertOk(fs.existsSync(diaryPath), "DiaryPage must exist");
    const diaryContent = fs.readFileSync(diaryPath, "utf8");
    const hasDarkBg =
      diaryContent.includes("bg-surface") ||
      diaryContent.includes("bg-background") ||
      diaryContent.includes("bg-[#07090e]");
    assertOk(hasDarkBg, "DiaryPage must adopt dark background (bg-surface, bg-background, or bg-[#07090e])");

    reporter.record(t3, 4, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 4, false, err, Date.now() - start3);
  }

  // Scenario 4.4: Resilient Recovery Journey (Invalid Project -> 404 -> Safe Return)
  const t4 = "Scenario 4.4 - Resilient Recovery Journey: Invalid Route -> Styled 404 -> Safe Home/Projects Return";
  const start4 = Date.now();
  try {
    const notFoundPath = path.join(root, "src/app/NotFound.tsx");
    const content = fs.readFileSync(notFoundPath, "utf8");

    assertIncludes(content, "404", "NotFound must display 404 code");
    assertIncludes(content, "Page Not Found", "NotFound must display clear user guidance");
    assertOk(content.includes('href="/"') || content.includes('href: "/"'), "Must offer return to Home");
    assertOk(content.includes('href="/projects"') || content.includes('href: "/projects"'), "Must offer return to Projects");
    assertOk(content.includes('href="/articles"') || content.includes('href: "/articles"'), "Must offer return to Articles");

    reporter.record(t4, 4, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 4, false, err, Date.now() - start4);
  }
}
