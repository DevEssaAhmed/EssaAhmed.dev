import { unstable_cache } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";
import { isPublicTravelHighlight } from "@/data/travelVisibility";
import type { ContentAvailabilitySnapshot } from "@/types/content-availability";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasValidTravelMetadata(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  const cityName = text(row.city_name);
  const countryName = text(row.country_name);
  const latitude = Number(row.lat);
  const longitude = Number(row.lng);

  return Boolean(
    cityName &&
      countryName &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180 &&
      !(latitude === 0 && longitude === 0)
  );
}

async function loadContentAvailability(): Promise<ContentAvailabilitySnapshot> {
  const supabase = getSupabaseServer();
  const [projectsResult, articlesResult, travelResult] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .eq("unlisted", false),
    supabase
      .from("travel_highlights")
      .select("id,city_name,country_name,lat,lng,cover_image_url,is_published")
      .eq("is_published", true),
  ]);

  for (const [label, result] of [
    ["projects", projectsResult],
    ["articles", articlesResult],
    ["travel highlights", travelResult],
  ] as const) {
    if (result.error) throw new Error(`Failed to load ${label} availability: ${result.error.message}`);
  }

  const travelRows = travelResult.data ?? [];
  const visibleWithCover = travelRows.filter((row) => isPublicTravelHighlight(row));
  const missingCoverCandidates = travelRows.filter(
    (row) => !text(row.cover_image_url) && hasValidTravelMetadata(row)
  );

  let travelCount = visibleWithCover.length;
  if (missingCoverCandidates.length > 0) {
    const candidateIds = missingCoverCandidates.map((row) => row.id);
    const { data: slideRows, error: slideError } = await supabase
      .from("travel_highlights")
      .select("id,story_slides")
      .in("id", candidateIds);

    if (slideError) throw new Error(`Failed to load travel story-image availability: ${slideError.message}`);
    const slidesById = new Map((slideRows ?? []).map((row) => [row.id, row.story_slides]));

    travelCount += missingCoverCandidates.filter((row) =>
      isPublicTravelHighlight({ ...row, story_slides: slidesById.get(row.id) ?? [] })
    ).length;
  }

  const projectsCount = projectsResult.count ?? 0;
  const articlesCount = articlesResult.count ?? 0;
  return {
    hasProjects: projectsCount > 0,
    hasArticles: articlesCount > 0,
    hasTravel: travelCount > 0,
    projectsCount,
    articlesCount,
    travelCount,
  };
}

const getCachedContentAvailability = unstable_cache(
  loadContentAvailability,
  ["portfolio-content-availability-v1"],
  { revalidate: 120, tags: ["content-availability"] }
);

export function getContentAvailability(): Promise<ContentAvailabilitySnapshot> {
  return getCachedContentAvailability();
}
