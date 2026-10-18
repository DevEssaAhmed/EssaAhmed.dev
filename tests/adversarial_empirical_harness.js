#!/usr/bin/env node

/**
 * Adversarial Empirical Verification & Stress Harness
 * Executed by Challenger 1 (Adversarial Empirical Verifier)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function record(name, passed, error = null) {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } else {
    failedTests++;
    failures.push({ name, error: error ? (error.stack || error.message || String(error)) : "Unknown failure" });
    console.error(`  [FAIL] ${name} - ${error?.message || error}`);
  }
}

async function fetchRoute(routePath) {
  const url = new URL(routePath, BASE_URL).toString();
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Adversarial-Challenger/1.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, headers: res.headers, body: text, url: res.url };
}

// --------------------------------------------------------------------------
// SUITE 1: Search Filter & Corner Case Input Stress (Whitebox Oracle)
// --------------------------------------------------------------------------
function testSearchInputsAndMalformedData() {
  console.log("\n=======================================================");
  console.log("  SUITE 1: Search Inputs & Malformed Data Stress");
  console.log("=======================================================");

  // Simulating ProjectsPage filter logic directly
  function filterProjects(projects, searchQuery, selectedCategory = "All") {
    return projects.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      if (!searchQuery || !searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = p.title?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const tagMatch = p.tags?.some((t) => t?.toLowerCase().includes(q));
      const catMatch = p.category?.toLowerCase().includes(q);

      return Boolean(titleMatch || descMatch || tagMatch || catMatch);
    });
  }

  const adversarialInputs = [
    "",
    "   ",
    "\t\n\r  ",
    "<script>alert('xss')</script>",
    "'; DROP TABLE projects; --",
    "\\0",
    "\\\\\\\\\\\\",
    "[.*+?^${}()|[\\]\\\\]",
    "(((((((.*)*)*)*)*)*)*)", // ReDoS attempt
    "🚀🔥💻📊✨",
    "البيانات الهندسية", // Arabic
    "测试数据工程", // CJK
    "A".repeat(5000), // Very long string
    "   mixed   spaces   and   caps   ",
    "null",
    "undefined",
    "NaN",
    "true",
    "false",
    "Object.prototype",
    "__proto__",
    "constructor",
  ];

  const testDataset = [
    {
      id: "p1",
      title: "Automated Rejection Analytics",
      description: "Automated defect and rejection classification system using statistical process control.",
      category: "Automation",
      tags: ["Python", "Streamlit", "PostgreSQL"],
    },
    {
      id: "p2",
      title: "Vendor Quality Benchmarking",
      description: "Multi-facility supplier quality metrics.",
      category: "Data Pipelines",
      tags: ["SQL", "dbt", "Snowflake"],
    },
    // Malformed corner cases
    {
      id: "p3",
      title: "Empty Tag Project",
      description: "Project with empty tags array.",
      category: "Analytics",
      tags: [],
    },
    {
      id: "p4",
      title: "Null Tag Project",
      description: "Project with null tags.",
      category: "Analytics",
      tags: null,
    },
    {
      id: "p5",
      title: "Null Fields Project",
      description: null,
      category: null,
      tags: null,
    },
    {
      id: "p6",
      title: null,
      description: "Missing title",
      category: "Automation",
      tags: [null, undefined, "", "SpecialTag"],
    },
  ];

  for (const input of adversarialInputs) {
    try {
      const displayInput = input.length > 25 ? input.slice(0, 25) + "..." : input;
      const res = filterProjects(testDataset, input);
      record(`Search input handling: "${displayInput.replace(/[\n\r\t]/g, " ")}"`, Array.isArray(res));
    } catch (err) {
      record(`Search input handling: "${input}"`, false, err);
    }
  }

  // TagsPage filter logic test
  function filterTags(tags, searchTerm) {
    return tags.filter((tag) =>
      tag?.name ? tag.name.toLowerCase().includes((searchTerm || "").toLowerCase()) : false
    );
  }

  const tagDataset = [
    { name: "Python", slug: "python", count: 12, articleCount: 12, trending: true },
    { name: "Data Engineering", slug: "data-engineering", count: 8, articleCount: 8, trending: true },
    { name: "dbt", slug: "dbt", count: 4, articleCount: 4, trending: false },
    { name: "", slug: "empty", count: 0, articleCount: 0 },
  ];

  for (const input of adversarialInputs.slice(0, 10)) {
    try {
      const res = filterTags(tagDataset, input);
      record(`Tag search input: "${input.replace(/[\n\r\t]/g, " ")}"`, Array.isArray(res));
    } catch (err) {
      record(`Tag search input: "${input}"`, false, err);
    }
  }
}

// --------------------------------------------------------------------------
// SUITE 2: Live HTTP 404 Routing & Non-Existent Identifier Verification
// --------------------------------------------------------------------------
async function testLive404Handling() {
  console.log("\n=======================================================");
  console.log("  SUITE 2: Live HTTP 404 Routing & Error Boundaries");
  console.log("=======================================================");

  // 1. Non-existent Project UUID
  try {
    const res = await fetchRoute("/projects/00000000-0000-0000-0000-000000000000");
    const is404 = res.status === 404 || res.body.includes("404") || res.body.includes("not found") || res.body.includes("Page Not Found");
    record("Non-existent Project UUID (/projects/00000000-...) triggers 404 boundary without 500 crash", is404 && res.status !== 500);
  } catch (err) {
    record("Non-existent Project UUID", false, err);
  }

  // 2. Malformed non-UUID project ID
  try {
    const res = await fetchRoute("/projects/invalid-malformed-slug-1234");
    const is404 = res.status === 404 || res.body.includes("404") || res.body.includes("not found");
    record("Malformed Project Slug (/projects/invalid-slug) handles gracefully without 500 crash", is404 && res.status !== 500);
  } catch (err) {
    record("Malformed Project Slug", false, err);
  }

  // 3. Non-existent Article Slug
  try {
    const res = await fetchRoute("/articles/non-existent-article-slug-xyz-12345");
    const is404 = res.status === 404 || res.body.includes("404") || res.body.includes("not found");
    record("Non-existent Article Slug (/articles/non-existent-slug) triggers 404 boundary without 500 crash", is404 && res.status !== 500);
  } catch (err) {
    record("Non-existent Article Slug", false, err);
  }

  // 4. Non-existent Category Slug
  try {
    const res = await fetchRoute("/articles/categories/non-existent-category-slug-xyz");
    record("Non-existent Category Slug handles gracefully without 500 crash", res.status !== 500);
  } catch (err) {
    record("Non-existent Category Slug", false, err);
  }

  // 5. Non-existent Tag Slug
  try {
    const res = await fetchRoute("/articles/tags/non-existent-tag-slug-xyz");
    const handlesGracefully =
      res.status !== 500 &&
      (res.status === 404 ||
        res.body.includes("Tag Not Found") ||
        res.body.includes("No Articles Found") ||
        res.body.includes("not found") ||
        res.body.includes("404"));
    record("Non-existent Tag Slug handles gracefully without 500 crash", handlesGracefully);
  } catch (err) {
    record("Non-existent Tag Slug", false, err);
  }

  // 6. Generic non-existent route
  try {
    const res = await fetchRoute("/adversarial-completely-random-route-xyz-404");
    const is404 = res.status === 404 || res.body.includes("404") || res.body.includes("Page Not Found");
    record("Arbitrary unknown path triggers 404 page without 500 crash", is404 && res.status !== 500);
  } catch (err) {
    record("Arbitrary unknown path", false, err);
  }
}

// --------------------------------------------------------------------------
// SUITE 3: Mobile Viewport, Touch Locks & Responsive Layout Geometry
// --------------------------------------------------------------------------
function testMobileGeometryAndTouchLocks() {
  console.log("\n=======================================================");
  console.log("  SUITE 3: Mobile Geometry, Drawer Touch Locks & Breakpoints");
  console.log("=======================================================");

  const navPath = path.join(projectRoot, "src/components/Navigation.tsx");
  const navContent = fs.readFileSync(navPath, "utf8");

  // 1. Drawer width max-w-[85vw] for ultra-narrow 320px screens
  const hasNarrowViewportConstraint =
    navContent.includes("w-[320px]") && navContent.includes("max-w-[85vw]");
  record(
    "Mobile Drawer defines w-[320px] with max-w-[85vw] safeguard for ultra-narrow viewports (320px)",
    hasNarrowViewportConstraint
  );

  // 2. Touch lock backdrop
  const hasTouchLock = navContent.includes("touch-none");
  record("Mobile backdrop enforces 'touch-none' to prevent mobile background scroll bleed", hasTouchLock);

  // 3. Document body overflow lock
  const hasOverflowLock =
    navContent.includes("document.body.style.overflow = 'hidden'") &&
    navContent.includes("document.body.style.overflow = ''");
  record(
    "Navigation lifecycle locks document.body.style.overflow = 'hidden' when open and resets on close/unmount",
    hasOverflowLock
  );

  // 4. 64px (h-16) mobile header specification
  const hasMobileHeaderHeight =
    navContent.includes("h-16") && navContent.includes("md:h-20");
  record("Navigation declares h-16 (64px) mobile header and md:h-20 desktop header", hasMobileHeaderHeight);

  // 5. Escape key listener for keyboard accessibility
  const hasEscapeHandler = navContent.includes("Escape") && navContent.includes("keydown");
  record("Mobile Navigation binds keydown listener for Escape key dismissal", hasEscapeHandler);

  // 6. Window resize listener to auto-close drawer above 768px
  const hasResizeHandler =
    navContent.includes("resize") && navContent.includes("768");
  record(
    "Mobile Navigation auto-collapses drawer on viewport resize to desktop (>= 768px)",
    hasResizeHandler
  );

  // 7. Test ProjectsPage and FeaturedWork responsive grid layout
  const projectsPagePath = path.join(projectRoot, "src/app/projects/ProjectsPage.tsx");
  const ppContent = fs.readFileSync(projectsPagePath, "utf8");
  const hasResponsiveGrid =
    ppContent.includes("grid-cols-1") &&
    (ppContent.includes("sm:grid-cols-2") || ppContent.includes("md:grid-cols-2")) &&
    ppContent.includes("lg:grid-cols-3");
  record(
    "ProjectsPage uses mobile-first responsive grid (grid-cols-1 -> sm:grid-cols-2 -> lg:grid-cols-3)",
    hasResponsiveGrid
  );

  // 8. Test ProjectCard aspect ratio & text containment
  const cardPath = path.join(projectRoot, "src/components/ProjectCard.tsx");
  const cardContent = fs.readFileSync(cardPath, "utf8");
  const hasCardSafeguards =
    cardContent.includes("line-clamp-2") &&
    cardContent.includes("line-clamp-3") &&
    cardContent.includes("aspect-[16/10]") &&
    cardContent.includes("flex-wrap");
  record(
    "ProjectCard enforces text clamps (line-clamp-2/3), aspect-[16/10], and flex-wrap tag container",
    hasCardSafeguards
  );
}

// --------------------------------------------------------------------------
// SUITE 4: Live Core Route Latency & Hydration Health
// --------------------------------------------------------------------------
async function testLiveCoreRouteLatency() {
  console.log("\n=======================================================");
  console.log("  SUITE 4: Live Core Route Latency & Hydration Health");
  console.log("=======================================================");

  const routes = [
    "/",
    "/projects",
    "/articles",
    "/about",
    "/diary",
    "/articles/tags",
    "/articles/categories",
  ];

  for (const r of routes) {
    const start = Date.now();
    try {
      const res = await fetchRoute(r);
      const latency = Date.now() - start;
      const ok = res.status === 200 && res.body.length > 500 && latency < 15000;
      record(`Route ${r} responded with 200 OK (${latency}ms, ${res.body.length} bytes)`, ok);
    } catch (err) {
      record(`Route ${r} failed to respond`, false, err);
    }
  }
}

// --------------------------------------------------------------------------
// MAIN RUNNER
// --------------------------------------------------------------------------
async function main() {
  console.log("=======================================================");
  console.log("  CHALLENGER 1: ADVERSARIAL EMPIRICAL STRESS HARNESS");
  console.log(`  Target: ${BASE_URL}`);
  console.log("=======================================================");

  testSearchInputsAndMalformedData();
  testMobileGeometryAndTouchLocks();
  await testLive404Handling();
  await testLiveCoreRouteLatency();

  console.log("\n=======================================================");
  console.log(`  HARNESS COMPLETE: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log("=======================================================");

  if (failedTests > 0) {
    console.error("\nFAILURES:");
    failures.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log("\nALL ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY ✔");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("FATAL: Harness crashed:", err);
  process.exit(1);
});
