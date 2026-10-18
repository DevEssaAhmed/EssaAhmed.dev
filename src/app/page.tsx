import Index from "./Index";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Essa Ahmed",
  description:
    "Explore industrial engineering, quality improvement, Power BI dashboards, data analytics, and automation projects by Essa Ahmed.",
  path: "/",
});

export default async function Page() {
  const supabase = getSupabaseServer();

  // Keep the primary project query independent of optional relationship
  // embedding. Tags already live on projects.tags in the current database.
  const [
    { data: projectsData, error: projectsError },
    { data: categoriesData, error: categoriesError },
    { data: articlesData, error: articlesError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,title,description,image_url,featured,views,likes,comments,demo_url,github_url,created_at,tags,category_id"
      )
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("id,name").order("name"),
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .eq("unlisted", false)
      .order("created_at", { ascending: false }),
  ]);

  if (projectsError) {
    console.error("[home] Failed to load projects from Supabase", {
      code: projectsError.code,
      message: projectsError.message,
      hint: projectsError.hint,
    });
  }
  if (categoriesError) {
    console.warn("[home] Failed to load project categories", {
      code: categoriesError.code,
      message: categoriesError.message,
    });
  }
  if (articlesError) {
    console.warn("[home] Failed to load articles", {
      code: articlesError.code,
      message: articlesError.message,
    });
  }

  const categoryNames = new Map(
    (categoriesData ?? []).map((category) => [category.id, category.name])
  );

  const formattedProjects = (projectsData ?? []).map((project) => ({
    ...project,
    category:
      categoryNames.get(project.category_id ?? "") ?? "Uncategorized",
    tags: Array.isArray(project.tags) ? project.tags : [],
  }));

  const formattedCategories = (categoriesData ?? []).map((category) => category.name);

  return (
    <Index
      initialProjects={formattedProjects}
      initialProjectCategories={formattedCategories}
      initialArticles={articlesData ?? []}
    />
  );
}
