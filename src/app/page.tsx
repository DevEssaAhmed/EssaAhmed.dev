import Index from "./Index";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120; // 2 minutes

export default async function Page() {
  const supabase = getSupabaseServer();

  // 1. Fetch featured projects (up to 6)
  const [{ data: projectsData }, { data: categoriesData }, { data: articlesData }] = await Promise.all([
    supabase
      .from("projects")
      .select("id,title,description,image_url,featured,views,likes,demo_url,github_url,created_at,categories(name),project_tags(tags(name))")
      .order("created_at", { ascending: false })
      .limit(6),

    // 2. Fetch project categories
    supabase.from("categories").select("name").order("name"),

    // 3. Fetch recent articles
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
  ]);

  // Format the projects to include the nested tags appropriately
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
