import assert from "node:assert/strict";

/**
 * Asserts a condition is truthy with a descriptive message.
 */
export function assertOk(value, message) {
  assert.ok(value, message);
}

/**
 * Asserts strict equality.
 */
export function assertEqual(actual, expected, message) {
  assert.equal(actual, expected, message);
}

/**
 * Asserts deep equality.
 */
export function assertDeepEqual(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
}

/**
 * Asserts that a string or array includes the expected target.
 */
export function assertIncludes(haystack, needle, message) {
  const msg = message || `Expected "${haystack}" to include "${needle}"`;
  assert.ok(haystack && haystack.includes(needle), msg);
}

/**
 * Asserts that a string or array does NOT include the target.
 */
export function assertNotIncludes(haystack, needle, message) {
  const msg = message || `Expected "${haystack}" not to include "${needle}"`;
  assert.ok(!haystack || !haystack.includes(needle), msg);
}

/**
 * Asserts that a string matches a RegExp.
 */
export function assertMatch(value, regex, message) {
  const msg = message || `Expected "${value}" to match pattern ${regex}`;
  assert.match(String(value), regex, msg);
}

/**
 * Asserts that a number is >= minimum.
 */
export function assertGte(actual, min, message) {
  const msg = message || `Expected ${actual} to be >= ${min}`;
  assert.ok(actual >= min, msg);
}

/**
 * Asserts that a numeric value is within [min, max] inclusive.
 */
export function assertInRange(actual, min, max, message) {
  const msg = message || `Expected ${actual} to be within [${min}, ${max}]`;
  assert.ok(actual >= min && actual <= max, msg);
}
