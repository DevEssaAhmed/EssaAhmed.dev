import Index from "./Index";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: "Essa Ahmed — Workflow Automation, Supply Chain S&OP & Analytics",
  description:
    "Portfolio of Essa Ahmed — engineering workflow automation pipelines, supply chain demand planning (S&OP) models, and executive analytics systems.",
  path: "/",
});

export default async function Page() {
  const supabase = getSupabaseServer();

  const [
    { data: projectsData },
    { data: categoriesData },
    { data: articlesData },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,title,description,image_url,featured,demo_url,github_url,created_at,categories(name),project_tags(tags(name))"
      )
      .order("featured", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("name").order("name"),
    supabase
      .from("blog_posts")
      .select(
        "id,title,slug,excerpt,created_at,reading_time,image_url,is_external,external_url,platform,pillar,video_type,video_url"
      )
      .eq("published", true)
      .eq("unlisted", false)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const formattedProjects = (projectsData || []).map((project: any) => ({
    ...project,
    tags: (project.project_tags || []).map((pt: any) => pt.tags?.name).filter(Boolean),
  }));

  const formattedCategories = (categoriesData || []).map((cat: any) => cat.name);

  return (
    <Index
      initialProjects={formattedProjects}
      initialProjectCategories={formattedCategories}
      initialArticles={articlesData || []}
    />
  );
}
