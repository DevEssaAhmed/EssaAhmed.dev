import Index from "./Index";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Essa Ahmed",
  description:
    "Industrial engineering, manufacturing quality improvement, data analytics, and automation work by Essa Ahmed.",
  path: "/",
});

export default async function Page() {
  const supabase = getSupabaseServer();

  // Read the project table directly. Tags are stored on projects.tags and the
  // category lookup is resolved separately so an optional relationship cannot
  // make the entire project list disappear.
  const [projectsResult, categoriesResult] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,title,description,image_url,tags,category_id,featured,views,likes,comments,demo_url,github_url,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("id,name").order("name"),
  ]);

  if (projectsResult.error) {
    console.error("[home] Failed to load projects from Supabase", {
      code: projectsResult.error.code,
      message: projectsResult.error.message,
      hint: projectsResult.error.hint,
    });
  }

  if (categoriesResult.error) {
    console.warn("[home] Project categories could not be loaded", {
      code: categoriesResult.error.code,
      message: categoriesResult.error.message,
    });
  }

  const categoryNames = new Map(
    (categoriesResult.data ?? []).map((category) => [category.id, category.name])
  );

  const initialProjects = (projectsResult.data ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    image: project.image_url || "/placeholder.svg",
    tags: Array.isArray(project.tags) ? project.tags : [],
    category: categoryNames.get(project.category_id ?? "") ?? "Uncategorized",
    demoUrl: project.demo_url ?? undefined,
    githubUrl: project.github_url ?? undefined,
    views: project.views ?? 0,
    likes: project.likes ?? 0,
    comments: project.comments ?? 0,
    featured: project.featured ?? false,
  }));

  return (
    <Index
      initialProjects={initialProjects}
      projectsLoadError={Boolean(projectsResult.error)}
    />
  );
}
