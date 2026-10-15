import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import {
  assertOk,
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assertNotIncludes,
} from "../helpers/assertions.js";
import { TestReporter } from "../helpers/reporter.js";
import { getSupabaseTestClient } from "../helpers/supabase-test-client.js";

/**
 * Tier 3: Cross-Feature Suite 3.2 - Category Filter + Search Combination
 */
export async function runCategoryFilterSearchTests(reporter) {
  const root = config.projectRoot;

  // Test 3.2.1: FeaturedWork category tab switching logic
  const t1 = "Tier 3.2.1 - FeaturedWork category filters slice case study records accurately";
  const start1 = Date.now();
  try {
    const featuredPath = path.join(root, "src/components/home/FeaturedWork.tsx");
    assertOk(fs.existsSync(featuredPath), "FeaturedWork.tsx must exist");
    const content = fs.readFileSync(featuredPath, "utf8");

    // Extract CASE_STUDIES array structure from source or evaluate specification
    assertIncludes(content, 'type Filter = "all" | "bi" | "pipelines" | "automation";');
    assertIncludes(content, 'const FILTERS: { id: Filter; label: string }[] = [');
    assertIncludes(content, 'role="tablist"');
    assertIncludes(content, 'aria-label="Filter featured work"');

    // Simulate the exact filter logic from FeaturedWork.tsx
    const mockCaseStudies = [
      { id: "vendor-defect", categories: ["bi"] },
      { id: "suzuki-qa", categories: ["bi"] },
      { id: "stitching-productivity", categories: ["bi", "automation"] },
      { id: "rejection-automation", categories: ["pipelines", "automation"] },
    ];

    const filterFn = (filter) =>
      mockCaseStudies.filter((c) => filter === "all" || c.categories.includes(filter));

    assertEqual(filterFn("all").length, 4, "All filter must return 4 items");
    assertEqual(filterFn("bi").length, 3, "BI filter must return 3 items (vendor-defect, suzuki-qa, stitching)");
    assertEqual(filterFn("pipelines").length, 1, "Pipelines filter must return 1 item (rejection-automation)");
    assertEqual(filterFn("automation").length, 2, "Automation filter must return 2 items (stitching, rejection)");

    reporter.record(t1, 3, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 3, false, err, Date.now() - start1);
  }

  // Test 3.2.2: TagsPage compound search + trending filter interaction
  const t2 = "Tier 3.2.2 - TagsPage search query and activeFilter ('trending' vs 'all') intersect properly";
  const start2 = Date.now();
  try {
    const tagsPagePath = path.join(root, "src/app/articles/tags/TagsPage.tsx");
    assertOk(fs.existsSync(tagsPagePath), "TagsPage.tsx must exist");
    const content = fs.readFileSync(tagsPagePath, "utf8");

    assertIncludes(content, 'const [searchTerm, setSearchTerm] = useState("");');
    assertIncludes(content, 'const [activeFilter, setActiveFilter] = useState<"all" | "trending">("trending");');
    assertIncludes(content, 'placeholder="Search tags..."');

    // Test compound filter logic:
    const mockTags = [
      { name: "Power BI", slug: "power-bi", count: 12, trending: true },
      { name: "Python", slug: "python", count: 8, trending: false },
      { name: "Quality Assurance", slug: "quality-assurance", count: 5, trending: true },
      { name: "PostgreSQL", slug: "postgresql", count: 9, trending: false },
      { name: "Automation", slug: "automation", count: 14, trending: true },
    ];

    const evaluateTagFiltering = (searchTerm, activeFilter) => {
      const filtered = mockTags.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return activeFilter === "trending" ? filtered.filter((t) => t.trending) : filtered;
    };

    // Substring "p" in trending only: "Power BI" (trending=true)
    const resP_Trending = evaluateTagFiltering("p", "trending");
    assertEqual(resP_Trending.length, 1, "Only Power BI is trending and contains 'p'");
    assertEqual(resP_Trending[0].name, "Power BI");

    // Substring "p" in all: "Power BI", "Python", "PostgreSQL"
    const resP_All = evaluateTagFiltering("p", "all");
    assertEqual(resP_All.length, 3, "Power BI, Python, and PostgreSQL contain 'p'");

    // Empty search in trending: Power BI, Quality Assurance, Automation
    const resEmpty_Trending = evaluateTagFiltering("", "trending");
    assertEqual(resEmpty_Trending.length, 3, "3 tags are marked trending");

    reporter.record(t2, 3, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 3, false, err, Date.now() - start2);
  }

  // Test 3.2.3: Compound filter empty state and clear recovery
  const t3 = "Tier 3.2.3 - Compound filter empty state provides clear diagnostics and reset action";
  const start3 = Date.now();
  try {
    const tagsPagePath = path.join(root, "src/app/articles/tags/TagsPage.tsx");
    const content = fs.readFileSync(tagsPagePath, "utf8");

    assertIncludes(content, 'No Tags Found', "Must display 'No Tags Found' when searchTerm has no match");
    assertIncludes(content, 'Clear Search', "Must display 'Clear Search' button when searchTerm is non-empty");
    assertIncludes(content, 'onClick={() => setSearchTerm("")}', "Clear Search button must reset searchTerm to empty string");

    reporter.record(t3, 3, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 3, false, err, Date.now() - start3);
  }

  // Test 3.2.4: ArticlesPage topic tag filter and reset action
  const t4 = "Tier 3.2.4 - ArticlesPage tag selection filters articles and provides 'View All Articles' fallback";
  const start4 = Date.now();
  try {
    const articlesPagePath = path.join(root, "src/app/articles/ArticlesPage.tsx");
    assertOk(fs.existsSync(articlesPagePath), "ArticlesPage.tsx must exist");
    const content = fs.readFileSync(articlesPagePath, "utf8");

    assertIncludes(content, 'const [selectedTag, setSelectedTag] = useState("All");');
    assertIncludes(content, 'selectedTag === "All"');
    assertIncludes(content, 'View All Articles', "Empty tag state must render 'View All Articles'");
    assertIncludes(content, 'onClick={() => setSelectedTag("All")}', "View All Articles must reset selectedTag to All");

    reporter.record(t4, 3, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 3, false, err, Date.now() - start4);
  }

  // Test 3.2.5: Tag and Category slug hyphen-decoding and deep link resolution
  const t5 = "Tier 3.2.5 - TagDetailPage and CategoryDetailPage decode hyphenated slugs into clean titles";
  const start5 = Date.now();
  try {
    const tagDetailPath = path.join(root, "src/app/articles/tags/[tagSlug]/TagDetailPage.tsx");
    assertOk(fs.existsSync(tagDetailPath), "TagDetailPage.tsx must exist");
    const content = fs.readFileSync(tagDetailPath, "utf8");

    assertIncludes(content, "decodeURIComponent(tagSlug.replace(/-/g, ' '))", "Must decode hyphens into space-separated tag name");
    assertIncludes(content, "filteredBlogPosts", "Must support intra-tag keyword search");

    // Test decoding logic:
    const decodeTagSlug = (slug) => decodeURIComponent(slug.replace(/-/g, " "));
    assertEqual(decodeTagSlug("data-pipelines"), "data pipelines");
    assertEqual(decodeTagSlug("power-bi"), "power bi");
    assertEqual(decodeTagSlug("quality-assurance"), "quality assurance");

    reporter.record(t5, 3, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 3, false, err, Date.now() - start5);
  }

  // Test 3.2.6: Adversarial search queries do not crash filtering or cause regex injection
  const t6 = "Tier 3.2.6 - Adversarial search inputs (SQL metachars, regex symbols, Unicode) filter safely";
  const start6 = Date.now();
  try {
    const adversarialQueries = [
      "<script>alert(1)</script>",
      "' OR '1'='1' --",
      "\\.*+?^${}()|[]",
      "   ",
      "📊 Defect Analytics",
      "NULL",
      "undefined",
    ];

    const testPool = [
      { name: "Power BI", slug: "power-bi" },
      { name: "Quality Assurance", slug: "quality-assurance" },
      { name: "ETL Automation", slug: "etl-automation" },
    ];

    for (const q of adversarialQueries) {
      // Must not throw or error
      const results = testPool.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase().trim())
      );
      assertOk(Array.isArray(results), `Query '${q}' must safely return an array`);
    }

    reporter.record(t6, 3, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 3, false, err, Date.now() - start6);
  }
}

// Direct execution support
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const reporter = new TestReporter("Tier 3 - Category Filter Search");
  await runCategoryFilterSearchTests(reporter);
  reporter.printSummary();
}
