import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profile"> & { [key: string]: any };

export function createDefaultProfile(): Profile {
  const now = new Date().toISOString();

  return {
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
    skills: ["Python", "SQL", "dbt", "Power BI", "Snowflake", "Airflow", "S&OP Modeling", "Next.js"],
    stats: {},
    about_markdown: null,
    about_content_jsonb: null,
    created_at: now,
    updated_at: now,
  } as Profile;
}

export function normalizeProfile(raw: Profile | null | undefined): Profile {
  const fallback = createDefaultProfile();
  if (!raw) return fallback;

  return {
    ...raw,
    title:
      !raw.title || raw.title === "BI Analyst"
        ? fallback.title
        : raw.title,
    stats:
      raw.stats && typeof raw.stats === "object" && !Array.isArray(raw.stats)
        ? raw.stats
        : fallback.stats,
  } as Profile;
}
