import test from "node:test";
import assert from "node:assert/strict";

import {
  extractIsoYear,
  formatDateUTC,
  parseDateUTC,
} from "../../src/lib/date.ts";
import {
  DIARY_PAGE_SIZE,
  dedupeById,
  mergeSortedYearsDesc,
} from "../../src/lib/diary.ts";
import {
  findMatchingTag,
  generateTagSlug,
  getTagHref,
  getTagSlug,
  resolveTagByParam,
} from "../../src/lib/tag-slug.ts";
import {
  resolveProjectPillar,
  computeContentHealthReport,
  filterAndSortArticles,
  filterAndSortProjects,
  filterAndSortTravel,
  filterAndSortDiary,
  buildRecentActivityFeed,
} from "../../src/lib/admin-helpers.ts";

test("parseDateUTC anchors YYYY-MM-DD dates to UTC midnight and handles invalid inputs", () => {
  const dateOnly = parseDateUTC("2025-03-01");
  assert.ok(dateOnly instanceof Date);
  assert.equal(dateOnly.toISOString(), "2025-03-01T00:00:00.000Z");

  const timestamp = parseDateUTC("2025-01-01T02:30:00Z");
  assert.equal(timestamp?.toISOString(), "2025-01-01T02:30:00.000Z");

  assert.equal(parseDateUTC(null), null);
  assert.equal(parseDateUTC(undefined), null);
  assert.equal(parseDateUTC("   "), null);
  assert.equal(parseDateUTC("not-a-date"), null);
  assert.equal(parseDateUTC(new Date("invalid")), null);
});

test("formatDateUTC uses deterministic en-US UTC formatting and fallback", () => {
  assert.equal(
    formatDateUTC("2025-03-01", { month: "short", day: "numeric", year: "numeric" }),
    "Mar 1, 2025"
  );
  assert.equal(
    formatDateUTC("2025-01-01T02:00:00Z", { month: "long", year: "numeric" }),
    "January 2025"
  );
  assert.equal(formatDateUTC(null, undefined, "Recent"), "Recent");
  assert.equal(formatDateUTC("invalid", undefined, "Fallback"), "Fallback");
});

test("extractIsoYear reads calendar year without timezone rollover", () => {
  assert.equal(extractIsoYear("2024-01-01"), 2024);
  assert.equal(extractIsoYear("2024-12-31T23:59:59Z"), 2024);
  assert.equal(extractIsoYear(new Date("2023-06-15T12:00:00Z")), 2023);
  assert.equal(extractIsoYear(null), null);
});

test("tag slug helpers normalize multi-word, punctuated, and hyphenated tags consistently", () => {
  assert.equal(generateTagSlug("Power BI"), "power-bi");
  assert.equal(generateTagSlug("Next.js"), "next-js");
  assert.equal(generateTagSlug("S&OP"), "s-op");
  assert.equal(generateTagSlug("real-time"), "real-time");
  assert.equal(generateTagSlug("  AI / ML  "), "ai-ml");

  assert.equal(getTagSlug({ name: "Power BI", slug: "power-bi" }), "power-bi");
  assert.equal(getTagSlug({ name: "Next.js", slug: null }), "next-js");
  assert.equal(getTagHref({ name: "Power BI", slug: "power-bi" }), "/articles/tags/power-bi");
});

test("findMatchingTag resolves canonical slugs, capitalized params, encoded spaces, and hyphens", () => {
  const tags = [
    { id: "1", name: "Power BI", slug: "power-bi" },
    { id: "2", name: "Next.js", slug: null },
    { id: "3", name: "real-time", slug: "real-time" },
    { id: "4", name: "S&OP", slug: "s-op" },
  ];

  assert.equal(findMatchingTag(tags, "power-bi")?.id, "1");
  assert.equal(findMatchingTag(tags, "Power%20BI")?.id, "1");
  assert.equal(findMatchingTag(tags, "Power BI")?.id, "1");
  assert.equal(findMatchingTag(tags, "next-js")?.id, "2");
  assert.equal(findMatchingTag(tags, "real-time")?.id, "3");
  assert.equal(findMatchingTag(tags, "s-op")?.id, "4");
  assert.equal(findMatchingTag(tags, "S%26OP")?.id, "4");
  assert.equal(findMatchingTag(tags, "does-not-exist"), null);
});

test("resolveTagByParam uses slug fast-path and falls back to full scan for legacy URLs", async () => {
  let fallbackScanCount = 0;

  const fastPathClient = {
    from() {
      return {
        select() {
          return {
            in(_col, values) {
              assert.ok(values.includes("power-bi"));
              return {
                limit() {
                  return Promise.resolve({
                    data: [{ id: "1", name: "Power BI", slug: "power-bi" }],
                    error: null,
                  });
                },
              };
            },
            then() {
              fallbackScanCount += 1;
              return Promise.resolve({ data: [], error: null });
            },
          };
        },
      };
    },
  };

  const fastResult = await resolveTagByParam(fastPathClient, "Power%20BI");
  assert.equal(fastResult.error, null);
  assert.equal(fastResult.data?.name, "Power BI");
  assert.equal(fallbackScanCount, 0);

  const fallbackClient = {
    from() {
      return {
        select() {
          return {
            in() {
              return {
                limit() {
                  return Promise.resolve({ data: [], error: null });
                },
              };
            },
            then(resolve, reject) {
              fallbackScanCount += 1;
              return Promise.resolve({
                data: [{ id: "4", name: "S&OP", slug: "s-op" }],
                error: null,
              }).then(resolve, reject);
            },
          };
        },
      };
    },
  };

  const fallbackResult = await resolveTagByParam(fallbackClient, "S%26OP");
  assert.equal(fallbackResult.error, null);
  assert.equal(fallbackResult.data?.id, "4");
  assert.equal(fallbackScanCount, 1);

  const emptyResult = await resolveTagByParam(fastPathClient, "   ");
  assert.deepEqual(emptyResult, { data: null, error: null });
});

test("diary helpers keep page size at 10, dedupe overlapping fetches, and sort years desc", () => {
  assert.equal(DIARY_PAGE_SIZE, 10);

  const initial = [{ id: "a" }, { id: "b" }];
  const sameRef = dedupeById(initial, [{ id: "b" }]);
  assert.equal(sameRef, initial);

  const merged = dedupeById(initial, [{ id: "b" }, { id: "c" }]);
  assert.deepEqual(
    merged.map((x) => x.id),
    ["a", "b", "c"]
  );

  assert.deepEqual(
    mergeSortedYearsDesc([2023, 2025], [2024, 2025, null, undefined, Number.NaN]),
    [2025, 2024, 2023]
  );
});


test("resolveProjectPillar prioritizes persisted category name before text heuristics", () => {
  const categoryMap = new Map([
    ["cat-sc", "Supply Chain & Demand Planning"],
    ["cat-bi", "Analytics & Decision Systems"],
    ["cat-auto", "Workflow Automation"],
  ]);

  assert.equal(
    resolveProjectPillar(
      {
        title: "Automated Dashboard Bot",
        category_id: "cat-sc",
        tags: ["automation"],
      },
      categoryMap
    ),
    "Supply Chain & Demand Planning"
  );

  assert.equal(
    resolveProjectPillar({
      title: "Workflow Bot",
      categories: { name: "Business Intelligence & KPI Systems" },
    }),
    "Analytics & Decision Systems"
  );

  assert.equal(
    resolveProjectPillar({
      title: "Supply Chain Control Tower",
      description: "Demand forecasting and S&OP planning model",
    }),
    "Supply Chain & Demand Planning"
  );
});

test("computeContentHealthReport computes KPIs, audit warnings, and healthScore", () => {
  const categoryMap = new Map([["c1", "Workflow Automation"]]);
  const report = computeContentHealthReport({
    blogPosts: [
      {
        id: "b1",
        title: "Healthy Post",
        published: true,
        unlisted: false,
        image_url: "https://example.com/cover.png",
        excerpt: "Short summary here.",
        is_external: false,
      },
      {
        id: "b2",
        title: "Published No Image",
        published: true,
        unlisted: true,
        image_url: "",
        excerpt: "",
        is_external: true,
        external_url: "",
      },
    ],
    projects: [
      {
        id: "p1",
        title: "Incomplete Project",
        category_id: "c1",
        featured: true,
        views: 100,
        likes: 12,
        image_url: "",
        description: "Too short",
        tags: [],
      },
    ],
    travelHighlights: [
      {
        id: "t1",
        city_name: "Tokyo",
        country_name: "Japan",
        is_published: true,
        lat: 35.67,
        lng: 139.65,
        cover_image_url: "",
        story_slides: [],
      },
    ],
    diaryEntries: [
      { id: "d1", title: "Live Note", is_published: true },
      { id: "d2", title: "Draft Note", is_published: false },
    ],
    categoryMap,
    orphanTagsCount: 2,
    orphanCategoriesCount: 1,
  });

  assert.equal(report.kpis.blogs.total, 2);
  assert.equal(report.kpis.blogs.published, 1);
  assert.equal(report.kpis.blogs.unlisted, 1);
  assert.equal(report.kpis.projects.featured, 1);
  assert.equal(report.kpis.projects.byPillar["Workflow Automation"], 1);
  assert.equal(report.kpis.travel.published, 1);
  assert.equal(report.kpis.diary.drafts, 1);

  const warningIds = new Set(report.warnings.map((w) => w.id));
  assert.ok(warningIds.has("blog-cover-b2"));
  assert.ok(warningIds.has("blog-excerpt-b2"));
  assert.ok(warningIds.has("project-cover-p1"));
  assert.ok(warningIds.has("project-desc-p1"));
  assert.ok(warningIds.has("project-tags-p1"));
  assert.ok(warningIds.has("travel-incomplete-t1"));
  assert.ok(warningIds.has("travel-slides-t1"));
  assert.ok(warningIds.has("taxonomy-orphans"));
  assert.ok(report.healthScore < 100 && report.healthScore >= 0);
});

test("filterAndSort helpers filter and sort articles, projects, travel, and diary deterministically", () => {
  const articles = filterAndSortArticles(
    [
      {
        id: "1",
        title: "Zulu",
        published: true,
        unlisted: false,
        category_id: "c1",
        views: 10,
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        title: "Alpha",
        published: true,
        unlisted: false,
        category_id: "c1",
        views: 99,
        video_type: "external:Medium|analytics",
        video_url: "https://medium.com/p/alpha",
        created_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "3",
        title: "Beta Draft",
        published: false,
        unlisted: false,
        category_id: "c2",
        views: 500,
        created_at: "2026-01-01T00:00:00Z",
      },
    ],
    { statusFilter: "published", sourceFilter: "external", sortBy: "views" }
  );
  assert.deepEqual(
    articles.map((a) => a.id),
    ["2"]
  );

  const projects = filterAndSortProjects(
    [
      { id: "p1", title: "A", featured: false, tags: ["Python"], views: 5 },
      { id: "p2", title: "B", featured: true, tags: ["n8n", "SQL"], views: 50 },
    ],
    { featuredOnly: true, searchQuery: "n8n", sortBy: "views" }
  );
  assert.deepEqual(
    projects.map((p) => p.id),
    ["p2"]
  );

  const cities = filterAndSortTravel(
    [
      { city_name: "Kyoto", country_name: "Japan", is_published: true, year: 2023, story_slides: [{}] },
      { city_name: "Alula", country_name: "Saudi Arabia", is_published: true, year: 2025, story_slides: [{}, {}] },
      { city_name: "Draft City", country_name: "Nowhere", is_published: false, year: 2026 },
    ],
    { statusFilter: "published", sortBy: "slides_desc" }
  );
  assert.deepEqual(
    cities.map((c) => c.city_name),
    ["Alula", "Kyoto"]
  );

  const diary = filterAndSortDiary(
    [
      { id: "d1", title: "Second", entry_date: "2025-02-01", is_published: true, topic_tag: "Notes" },
      { id: "d2", title: "First", entry_date: "2025-01-15", is_published: true, topic_tag: "Notes" },
      { id: "d3", title: "Old", entry_date: "2024-12-01", is_published: false, topic_tag: "Archive" },
    ],
    { selectedYear: "2025", topicFilter: "Notes", sortBy: "date_asc" }
  );
  assert.deepEqual(
    diary.map((d) => d.id),
    ["d2", "d1"]
  );
});

test("buildRecentActivityFeed merges across collections in reverse chronological order", () => {
  const feed = buildRecentActivityFeed({
    blogPosts: [{ id: "b1", title: "Article A", published: true, created_at: "2025-01-01T00:00:00Z" }],
    projects: [{ id: "p1", title: "Project B", featured: true, updated_at: "2026-03-01T00:00:00Z" }],
    travelHighlights: [{ id: "t1", city_name: "Doha", country_name: "Qatar", is_published: false, year: 2024 }],
    diaryEntries: [{ id: "d1", title: "Entry C", entry_date: "2026-02-01", is_published: true }],
    limit: 3,
  });

  assert.equal(feed.length, 3);
  assert.equal(feed[0].id, "project-p1");
  assert.equal(feed[1].id, "diary-d1");
  assert.equal(feed[2].id, "blog-b1");
});
