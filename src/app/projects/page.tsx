import ProjectsPage from "./ProjectsPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Projects",
  description: "Browse analytics, dashboard, and data application projects by Essa Ahmed.",
  path: "/projects",
});

export default async function Page() {
  const supabase = getSupabaseServer();

  // Keep the core query independent of PostgREST relationship embedding. The
  // projects table already contains its tags array and category_id.
  const [projectsResult, categoriesResult] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,title,description,image_url,tags,category_id,demo_url,github_url,views,likes,comments,featured,created_at"
      )
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id,name").order("name"),
  ]);

  if (projectsResult.error) {
    console.error("[projects] Failed to load projects from Supabase", {
      code: projectsResult.error.code,
      message: projectsResult.error.message,
      hint: projectsResult.error.hint,
    });
  }

  if (categoriesResult.error) {
    console.warn("[projects] Category names could not be loaded", {
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
  }));

  return (
    <ProjectsPage
      initialProjects={initialProjects}
      projectsLoadError={Boolean(projectsResult.error)}
    />
  );
}
