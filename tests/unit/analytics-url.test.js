import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeAnalyticsUrl } from "../../src/lib/analytics-url.js";

test("analytics URLs exclude unapproved query parameters", () => {
  assert.equal(
    sanitizeAnalyticsUrl(
      "/articles/supply-chain",
      "utm_source=linkedin&email=essa%40example.com&token=secret&session_id=123"
    ),
    "/articles/supply-chain?utm_source=linkedin"
  );
});

test("analytics URLs preserve approved campaign tags and encode values", () => {
  const actual = sanitizeAnalyticsUrl(
    "/projects/forecasting",
    "?utm_source=linkedin&utm_medium=social&utm_campaign=Supply%20Chain%20Q4&other=private"
  );
  const parsed = new URL(actual, "https://essaahmed.dev");

  assert.equal(parsed.pathname, "/projects/forecasting");
  assert.equal(parsed.searchParams.get("utm_source"), "linkedin");
  assert.equal(parsed.searchParams.get("utm_medium"), "social");
  assert.equal(parsed.searchParams.get("utm_campaign"), "Supply Chain Q4");
  assert.equal([...parsed.searchParams.keys()].length, 3);
});

test("analytics URLs do not accept unsafe paths or unbounded campaign values", () => {
  assert.equal(sanitizeAnalyticsUrl("//external.example/path", "utm_source=google"), "/?utm_source=google");

  const actual = sanitizeAnalyticsUrl("/home", `utm_campaign=${"x".repeat(180)}`);
  const parsed = new URL(actual, "https://essaahmed.dev");
  assert.equal(parsed.searchParams.get("utm_campaign").length, 100);
});

test("analytics URLs omit empty and unapproved campaign parameters", () => {
  assert.equal(
    sanitizeAnalyticsUrl("/home", "utm_source=&utm_medium=&email=private"),
    "/home"
  );
});
