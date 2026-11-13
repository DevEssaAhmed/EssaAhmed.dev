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
