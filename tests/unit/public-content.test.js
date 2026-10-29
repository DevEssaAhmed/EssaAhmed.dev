import assert from "node:assert/strict";
import test from "node:test";
import {
  isPublicListedArticle,
  PUBLIC_LISTED_ARTICLE_FILTERS,
} from "../../src/lib/public-content.js";

test("the public discovery rule is published and not unlisted", () => {
  assert.deepEqual(PUBLIC_LISTED_ARTICLE_FILTERS, {
    published: true,
    unlisted: false,
  });
  assert.equal(isPublicListedArticle({ published: true, unlisted: false }), true);
});

test("draft, unlisted, missing, and null visibility values are not listed publicly", () => {
  assert.equal(isPublicListedArticle({ published: false, unlisted: false }), false);
  assert.equal(isPublicListedArticle({ published: true, unlisted: true }), false);
  assert.equal(isPublicListedArticle({ published: null, unlisted: false }), false);
  assert.equal(isPublicListedArticle({ published: true, unlisted: null }), false);
  assert.equal(isPublicListedArticle({ published: true }), false);
  assert.equal(isPublicListedArticle(null), false);
  assert.equal(isPublicListedArticle(undefined), false);
});
