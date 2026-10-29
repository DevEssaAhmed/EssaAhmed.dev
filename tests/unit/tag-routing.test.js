import assert from "node:assert/strict";
import test from "node:test";
import { findTagByCanonicalSlug, tagHref } from "../../src/lib/tag-routing.js";

const tags = [
  { id: "1", name: "Power BI", slug: "power-bi" },
  { id: "2", name: "Lean Six Sigma", slug: "lean-six-sigma" },
  { id: "3", name: "C++ & SQL", slug: "c-sql" },
  { id: "4", name: "R&D / Analytics", slug: "r-d-analytics" },
];

function mockSupabaseTagClient(records, calls) {
  return {
    from(table) {
      calls.table = table;
      return {
        select(columns) {
          calls.columns = columns;
          return {
            eq(column, value) {
              calls.filter = { column, value };
              return {
                async maybeSingle() {
                  return { data: records.find((tag) => tag.slug === value) ?? null, error: null };
                },
              };
            },
          };
        },
      };
    },
  };
}

test("tag links use canonical slugs, not display-name transformations", () => {
  assert.equal(tagHref(tags[0].slug), "/articles/tags/power-bi");
  assert.equal(tagHref(tags[1].slug), "/articles/tags/lean-six-sigma");
  assert.equal(tagHref(tags[2].slug), "/articles/tags/c-sql");
  assert.equal(tagHref(tags[3].slug), "/articles/tags/r-d-analytics");
});

test("tag lookup matches canonical slug exactly and preserves display-name casing", async () => {
  for (const expectedTag of tags) {
    const calls = {};
    const client = mockSupabaseTagClient(tags, calls);
    const { data, error } = await findTagByCanonicalSlug(client, expectedTag.slug);
    assert.equal(error, null);
    assert.equal(calls.table, "tags");
    assert.equal(calls.columns, "id,name,slug");
    assert.deepEqual(calls.filter, { column: "slug", value: expectedTag.slug });
    assert.equal(data?.name, expectedTag.name);
  }
});

test("empty slugs do not generate malformed detail URLs", () => {
  assert.equal(tagHref(""), "/articles/tags");
  assert.equal(tagHref("   "), "/articles/tags");
});
