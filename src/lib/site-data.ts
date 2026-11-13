import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";
import { isPublicTravelHighlight } from "@/data/travelVisibility";
import {
  DEFAULT_CONTENT_AVAILABILITY_COUNTS,
  DEFAULT_PUBLIC_PROFILE,
  normalizePublicProfile,
  PUBLIC_PROFILE_COLUMNS,
  type AvailabilityCounts,
  type PublicProfile,
} from "@/lib/profile-defaults";

export interface PublicSiteShellData {
  profile: PublicProfile;
  availability: AvailabilityCounts;
}

const fetchPublicSiteShellDataUncached = async (): Promise<PublicSiteShellData> => {
  try {
    const supabase = getSupabaseServer();
    const [profileRes, projectsRes, blogsRes, travelRes] = await Promise.all([
      supabase
        .from("profile")
        .select(PUBLIC_PROFILE_COLUMNS)
        .order("updated_at", { ascending: false })
        .limit(1),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("published", true)
        .eq("unlisted", false),
      supabase
        .from("travel_highlights")
        .select(
          "city_name,country_name,lat,lng,cover_image_url,story_slides,is_published"
        )
        .eq("is_published", true),
    ]);

    const rawProfile =
      !profileRes.error && profileRes.data && profileRes.data.length > 0
        ? profileRes.data[0]
        : null;

    return {
      profile: normalizePublicProfile(rawProfile),
      availability: {
        projectsCount: projectsRes.error
          ? DEFAULT_CONTENT_AVAILABILITY_COUNTS.projectsCount
          : projectsRes.count ?? 0,
        articlesCount: blogsRes.error
          ? DEFAULT_CONTENT_AVAILABILITY_COUNTS.articlesCount
          : blogsRes.count ?? 0,
        travelCount: travelRes.error
          ? DEFAULT_CONTENT_AVAILABILITY_COUNTS.travelCount
          : (travelRes.data ?? []).filter(isPublicTravelHighlight).length,
      },
    };
  } catch {
    return {
      profile: DEFAULT_PUBLIC_PROFILE,
      availability: { ...DEFAULT_CONTENT_AVAILABILITY_COUNTS },
    };
  }
};

const getCachedPublicSiteShellData = unstable_cache(
  fetchPublicSiteShellDataUncached,
  ["public-site-shell"],
  { revalidate: 120, tags: ["site-shell"] }
);

export const getPublicSiteShellData = cache(async (): Promise<PublicSiteShellData> => {
  return getCachedPublicSiteShellData();
});
