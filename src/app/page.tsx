import Index from "./Index";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Essa Ahmed",
  description:
    "Design-forward portfolio and journal showcasing selected work, writing, and analytics systems.",
  path: "/",
});

export default async function Page() {
  const supabase = getSupabaseServer();

  const [{ data: projectsData }, { data: categoriesData }, { data: articlesData }] = await Promise.all([
    supabase
      .from("projects")
      .select("id,title,description,image_url,featured,views,likes,demo_url,github_url,created_at,categories(name),project_tags(tags(name))")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("name").order("name"),
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false }),
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

