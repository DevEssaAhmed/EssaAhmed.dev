import type { Tables } from "@/integrations/supabase/types";

export const PUBLIC_PROFILE_COLUMNS =
  "id,name,username,title,bio,email,avatar_url,github_url,linkedin_url,website_url,location,skills,stats,created_at,updated_at" as const;

export const FULL_PROFILE_COLUMNS =
  "id,name,username,title,bio,email,avatar_url,github_url,linkedin_url,website_url,location,skills,stats,created_at,updated_at,about_markdown,about_content_jsonb" as const;

export type PublicProfile = Tables<"profile"> & { [key: string]: any };

export interface AvailabilityCounts {
  projectsCount: number;
  articlesCount: number;
  travelCount: number;
}

export const DEFAULT_PUBLIC_PROFILE: PublicProfile = {
  id: "default",
  name: "Essa Ahmed",
  username: "essaahmed",
  title: "Workflow Automation, Supply Chain S&OP & Analytics",
  bio: "Bridging supply chain operations, end-to-end process automation, and decision analytics—turning complex operational data into self-running workflows and clear forecasts.",
  email: "essaahmedsiddiqui@gmail.com",
  avatar_url: "/placeholder.svg",
  github_url: "https://github.com/DevEssaAhmed",
  linkedin_url: "https://www.linkedin.com/in/essa-ahmed",
  website_url: "https://essaahmed.dev",
  location: "Karachi, Pakistan",
  skills: [
    "Python",
    "SQL",
    "dbt",
    "Power BI",
    "Snowflake",
    "Airflow",
    "S&OP Modeling",
    "Next.js",
  ],
  stats: {},
  about_markdown: null,
  about_content_jsonb: null,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
} as any;

export const DEFAULT_CONTENT_AVAILABILITY_COUNTS: AvailabilityCounts = {
  projectsCount: 5,
  articlesCount: 1,
  travelCount: 0,
};

export function normalizePublicProfile(raw: any): PublicProfile {
  if (!raw) return DEFAULT_PUBLIC_PROFILE;
  return {
    ...DEFAULT_PUBLIC_PROFILE,
    ...raw,
    title:
      !raw.title || raw.title === "BI Analyst"
        ? DEFAULT_PUBLIC_PROFILE.title
        : raw.title,
    stats:
      raw.stats && typeof raw.stats === "object" && !Array.isArray(raw.stats)
        ? raw.stats
        : DEFAULT_PUBLIC_PROFILE.stats,
  };
}
