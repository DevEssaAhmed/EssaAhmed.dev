/**
 * Build a tag URL from the canonical slug stored on the tags table.
 * Never derive public URLs from display names: case and punctuation may differ.
 */
export function tagHref(slug) {
  const canonicalSlug = typeof slug === "string" ? slug.trim() : "";
  return canonicalSlug
    ? `/articles/tags/${encodeURIComponent(canonicalSlug)}`
    : "/articles/tags";
}

/**
 * Query by the database's canonical slug. The supplied client keeps this
 * lookup contract testable without a live Supabase connection.
 */
export function findTagByCanonicalSlug(client, slug) {
  return client
    .from("tags")
    .select("id,name,slug")
    .eq("slug", slug)
    .maybeSingle();
}
