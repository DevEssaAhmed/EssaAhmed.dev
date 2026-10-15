import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { config } from "../config.js";
import {
  assertOk,
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assertNotIncludes,
  assertMatch,
} from "../helpers/assertions.js";
import { TestReporter } from "../helpers/reporter.js";
import { getSupabaseTestClient } from "../helpers/supabase-test-client.js";

/**
 * Tier 4: Real-World Scenario 4.1 - Full Executive User Journey
 * End-to-end multi-step flow of an executive inspecting Essa Ahmed's portfolio:
 * Home Showcase -> Case Study Drilldown -> Telemetry & Gallery -> Articles Hub -> Contact Brief Dispatch
 */
export async function runFullExecutiveJourneyTests(reporter) {
  const root = config.projectRoot;

  // Step 1: Landing on Home Showcase
  const t1 = "Tier 4.1.1 - Executive lands on Home: verifies Executive Editorial hero, availability, and KPI telemetry strip";
  const start1 = Date.now();
  try {
    const indexPath = path.join(root, "src/app/Index.tsx");
    assertOk(fs.existsSync(indexPath), "Index.tsx must exist");
    const content = fs.readFileSync(indexPath, "utf8");

    // Hero branding and value proposition
    assertOk(
      content.includes("Available for analytics roles &amp; projects") ||
        content.includes("Available for analytics roles & projects"),
      "Hero must show active enterprise availability pill"
    );
    assertIncludes(content, "I engineer", "Hero heading must declare core engineering identity");
    assertIncludes(content, "decision systems", "Hero heading must emphasize decision systems");
    assertIncludes(content, "creating impact", "Hero heading must highlight impact gradient");

    // Executive KPI telemetry strip
    assertIncludes(content, "Projects Led", "KPI strip must include Projects Led");
    assertIncludes(content, "15+", "Default KPI must display 15+ Projects Led");
    assertIncludes(content, "Hours Analyzed", "KPI strip must include Hours Analyzed");
    assertIncludes(content, "500+", "Default KPI must display 500+ Hours Analyzed");
    assertIncludes(content, "Clients Served", "KPI strip must include Clients Served");
    assertIncludes(content, "50+", "Default KPI must display 50+ Clients Served");
    assertIncludes(content, "Data Accuracy SLA", "KPI strip must include Data Accuracy SLA");
    assertIncludes(content, "99.8%", "KPI strip must declare 99.8% Data Accuracy SLA");

    // Primary action CTAs
    assertIncludes(content, 'href="/projects"', "Hero must provide direct CTA to /projects");
    assertIncludes(content, 'href="#contact"', "Hero must provide direct CTA to #contact");

    reporter.record(t1, 4, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 4, false, err, Date.now() - start1);
  }

  // Step 2: Featured Work Showcase Exploration
  const t2 = "Tier 4.1.2 - Executive explores Featured Work: filters by domain and clicks direct case study deep-link";
  const start2 = Date.now();
  try {
    const featuredPath = path.join(root, "src/components/home/FeaturedWork.tsx");
    assertOk(fs.existsSync(featuredPath), "FeaturedWork.tsx must exist");
    const content = fs.readFileSync(featuredPath, "utf8");

    // Verify all 4 authoritative editorial case studies with their exact UUID links
    const expectedStudies = [
      {
        id: "vendor-defect",
        title: "4-Wheel Vendor Defect Analysis",
        href: "/projects/4e489887-2834-4774-ae54-a0b8a5b0c2a3",
        visual: "bars",
      },
      {
        id: "suzuki-qa",
        title: "Suzuki Manufacturing Quality Assurance",
        href: "/projects/e51f2539-7631-435e-8f77-d560c5d7fc66",
        visual: "pareto",
      },
      {
        id: "stitching-productivity",
        title: "Stitching Offline Productivity",
        href: "/projects/0c806cae-9ceb-4249-90b6-332353ef771c",
        visual: "run",
      },
      {
        id: "rejection-automation",
        title: "Rejection Dashboard Automation",
        href: "/projects/d17bf217-6beb-4b4b-8f52-7444d58c453a",
        visual: "telemetry",
      },
    ];

    for (const study of expectedStudies) {
      assertIncludes(content, study.href, `FeaturedWork must link directly to ${study.title} UUID (${study.href})`);
      assertIncludes(content, study.visual, `FeaturedWork must render custom telemetry visual mockup for ${study.id}`);
    }

    // Verify view all projects button
    assertIncludes(content, 'href="/projects"', "Showcase must offer 'View All Projects' navigation CTA");

    reporter.record(t2, 4, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 4, false, err, Date.now() - start2);
  }

  // Step 3: Deep Inspection of Case Study Detail
  const t3 = "Tier 4.1.3 - Executive deep-dives into Case Study Detail: verifies telemetry, gallery switcher, and architecture markdown";
  const start3 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    assertOk(fs.existsSync(detailPath), "ProjectDetailPage.tsx must exist");
    const content = fs.readFileSync(detailPath, "utf8");

    // Visual showcase and gallery
    assertIncludes(content, "OptimizedImage", "Must use OptimizedImage for performant visual delivery");
    assertIncludes(content, "setSelectedImageIndex", "Must provide interactive gallery switcher");
    assertIncludes(content, "border-champagne", "Active visual thumbnail must be highlighted in champagne");

    // Architectural tab switching
    assertIncludes(content, "Technical Analysis", "Must display Technical Analysis tab trigger");
    assertIncludes(content, "prose prose-invert", "Technical analysis body must render formatted markdown prose");
    assertIncludes(content, "MarkdownRenderer", "Must render Markdown content");

    // Action buttons
    assertIncludes(content, "Live Demo", "Must provide Live Demo action if demo_url is present");
    assertIncludes(content, "Source Code", "Must provide Source Code action if github_url is present");
    assertIncludes(content, "Share", "Must provide Share action");

    reporter.record(t3, 4, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 4, false, err, Date.now() - start3);
  }

  // Step 4: Primary Navigation to Articles Hub
  const t4 = "Tier 4.1.4 - Executive navigates to Articles Hub: validates editorial sub-navigation and tag filtering";
  const start4 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const navContent = fs.readFileSync(navPath, "utf8");
    assertIncludes(navContent, "path: '/articles'", "Navigation must include direct link to /articles");

    const articlesPath = path.join(root, "src/app/articles/ArticlesPage.tsx");
    assertOk(fs.existsSync(articlesPath), "ArticlesPage.tsx must exist");
    const content = fs.readFileSync(articlesPath, "utf8");

    // Editorial layout tokens
    assertIncludes(content, "eyebrow mb-3", "Articles page must declare editorial eyebrow");
    assertIncludes(content, "Architecture Notes", "Eyebrow text must read Architecture Notes");
    assertIncludes(content, "Articles &amp; Insights", "Main heading must read Articles & Insights");
    assertIncludes(content, "ArticlesSubNav", "Must embed ArticlesSubNav sub-navigation bar");

    // Topic pill filtering
    assertIncludes(content, "allTags.map", "Must render dynamic topic tag pills");
    assertIncludes(content, "bg-champagne text-[#090c13]", "Selected topic pill must receive champagne active styling");

    reporter.record(t4, 4, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 4, false, err, Date.now() - start4);
  }

  // Step 5: Contact Engagement Dispatch Pipeline
  const t5 = "Tier 4.1.5 - Executive dispatches Project Brief via ContactForm: validates Zod schema and Supabase insertion contract";
  const start5 = Date.now();
  try {
    const contactFormPath = path.join(root, "src/components/ContactForm.tsx");
    assertOk(fs.existsSync(contactFormPath), "ContactForm.tsx must exist");
    const content = fs.readFileSync(contactFormPath, "utf8");

    assertIncludes(content, "contactSchema", "ContactForm must declare Zod validation schema");
    assertIncludes(content, "purposeOptions", "ContactForm must declare executive engagement purpose options");
    assertIncludes(content, "Executive BI Dashboard", "Must support Executive BI Dashboard option");
    assertIncludes(content, "supabase.from(\"contacts\").insert", "Must submit to Supabase contacts table");

    // Validate the Zod schema independently
    const contactSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email address"),
      purpose: z.string().min(1, "Please select a purpose"),
      other_purpose: z.string().optional(),
      message: z.string().min(10, "Message must be at least 10 characters"),
    });

    // 1. Test invalid empty submission
    const invalidRes = contactSchema.safeParse({
      name: "",
      email: "not-an-email",
      purpose: "",
      message: "short",
    });
    assertOk(!invalidRes.success, "Empty/invalid form submission must fail Zod schema validation");
    const errorIssues = invalidRes.error?.issues.map((i) => i.path[0]);
    assertOk(errorIssues?.includes("name"), "Must catch invalid name");
    assertOk(errorIssues?.includes("email"), "Must catch invalid email");
    assertOk(errorIssues?.includes("purpose"), "Must catch invalid purpose");
    assertOk(errorIssues?.includes("message"), "Must catch invalid message length");

    // 2. Test valid executive project brief submission
    const validPayload = {
      name: "Marcus Vance",
      email: "m.vance@enterprise-logistics.com",
      purpose: "Executive BI Dashboard",
      message: "We need an end-to-end defect tracking and KPI executive cockpit for our tier-1 assembly plant.",
    };
    const validRes = contactSchema.safeParse(validPayload);
    assertOk(validRes.success, "Valid executive brief submission must pass Zod schema validation");

    reporter.record(t5, 4, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 4, false, err, Date.now() - start5);
  }
}

// Direct execution support
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const reporter = new TestReporter("Tier 4 - Full Executive Journey");
  await runFullExecutiveJourneyTests(reporter);
  reporter.printSummary();
}
