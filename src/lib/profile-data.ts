import { unstable_cache } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";
import { normalizeProfile, type Profile } from "@/lib/profile-utils";

const PROFILE_COLUMNS =
  "id,name,username,title,bio,email,avatar_url,github_url,linkedin_url,website_url,location,skills,stats,created_at,updated_at,about_markdown,about_content_jsonb";

async function loadProfile(): Promise<Profile> {
  const { data, error } = await getSupabaseServer()
    .from("profile")
    .select(PROFILE_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return normalizeProfile((data?.[0] as Profile | undefined) ?? null);
}

const getCachedProfile = unstable_cache(
  loadProfile,
  ["portfolio-profile-v1"],
  { revalidate: 120, tags: ["profile"] }
);

/** Shared server snapshot used by the root provider and About metadata. */
export function getProfile(): Promise<Profile> {
  return getCachedProfile();
}
