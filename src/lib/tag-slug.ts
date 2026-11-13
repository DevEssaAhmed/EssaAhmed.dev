import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface TagSlugRecord {
  id?: string;
  name: string;
  slug?: string | null;
}

export interface ResolvedTag {
  id: string;
  name: string;
  slug: string;
}

/**
 * Generates the canonical URL slug matching the database `tags.slug` convention.
 */
export function generateTagSlug(text: string): string {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) return normalized;
  return text.toLowerCase().trim().replace(/\s+/g, "-");
}

/**
 * Returns the persisted slug when available, otherwise deriving one from `name`.
 */
export function getTagSlug(
  tag: string | { name?: string | null; slug?: string | null }
): string {
  if (typeof tag === "string") {
    return generateTagSlug(tag);
  }
  const existingSlug = tag.slug?.trim();
  if (existingSlug) return existingSlug;
  return generateTagSlug(tag.name || "");
}

/**
 * Builds a canonical `/articles/tags/...` href for a tag record or raw name.
 */
export function getTagHref(
  tag: string | { name?: string | null; slug?: string | null }
): string {
  return `/articles/tags/${encodeURIComponent(getTagSlug(tag))}`;
}

export function safeDecodeTagParam(rawParam: string): string {
  try {
    return decodeURIComponent(rawParam).trim();
  } catch {
    return rawParam.trim();
  }
}

/**
 * Matches a route `[tagSlug]` parameter against canonical slugs and legacy
 * case/hyphen/space variations so multi-word, hyphenated, and capitalized tags resolve.
 */
export function findMatchingTag<T extends TagSlugRecord>(
  tags: T[],
  rawParam: string
): T | null {
  const decoded = safeDecodeTagParam(rawParam);
  if (!decoded) return null;

  const lowered = decoded.toLowerCase();
  const spaceDecoded = lowered.replace(/-/g, " ");
  const normalizedSlug = generateTagSlug(decoded);

  return (
    tags.find((tag) => tag.slug?.trim().toLowerCase() === lowered) ??
    tags.find((tag) => tag.name.trim().toLowerCase() === lowered) ??
    tags.find((tag) => getTagSlug(tag).toLowerCase() === normalizedSlug) ??
    tags.find(
      (tag) => tag.name.trim().toLowerCase().replace(/\s+/g, "-") === lowered
    ) ??
    tags.find((tag) => tag.name.trim().toLowerCase() === spaceDecoded) ??
    null
  );
}

/**
 * Resolves a route `[tagSlug]` parameter against Supabase `tags` via canonical
 * slug fast-path first, falling back to full matching for legacy tag URLs.
 */
export async function resolveTagByParam(
  supabaseClient: SupabaseClient<Database>,
  rawParam: string
): Promise<{ data: ResolvedTag | null; error: { message: string } | null }> {
  const decoded = safeDecodeTagParam(rawParam);
  if (!decoded) return { data: null, error: null };

  const candidateSlugs = Array.from(
    new Set([decoded.toLowerCase(), generateTagSlug(decoded)].filter(Boolean))
  );

  const { data: exactMatches, error: exactError } = await supabaseClient
    .from("tags")
    .select("id, name, slug")
    .in("slug", candidateSlugs)
    .limit(1);

  if (exactError) {
    return { data: null, error: exactError };
  }

  if (exactMatches && exactMatches.length > 0) {
    return { data: exactMatches[0], error: null };
  }

  const { data: allTags, error: listError } = await supabaseClient
    .from("tags")
    .select("id, name, slug");

  if (listError) {
    return { data: null, error: listError };
  }

  return {
    data: findMatchingTag(allTags || [], rawParam),
    error: null,
  };
}
