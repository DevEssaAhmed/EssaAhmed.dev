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

  // Avoid embedding categories -> project_tags -> tags in the core read.
  // The projects table's own tags array is the current source of truth.
  const [
    { data: projectsData, error: projectsError },
    { data: categoriesData, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,title,description,image_url,tags,category_id,demo_url,github_url,demo_video_url,views,likes,comments,featured,created_at"
      )
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id,name").order("name"),
  ]);

  if (projectsError) {
    console.error("[projects] Failed to load projects from Supabase", {
      code: projectsError.code,
      message: projectsError.message,
      hint: projectsError.hint,
    });
  }
  if (categoriesError) {
    console.warn("[projects] Failed to load project categories", {
      code: categoriesError.code,
      message: categoriesError.message,
    });
  }

  const categoryNames = new Map(
    (categoriesData ?? []).map((category) => [category.id, category.name])
  );

  const initialProjects = (projectsData ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    image: project.image_url || "/placeholder.svg",
    tags: Array.isArray(project.tags) ? project.tags : [],
    category:
      categoryNames.get(project.category_id ?? "") ?? "Uncategorized",
    demoUrl: project.demo_url ?? undefined,
    githubUrl: project.github_url ?? undefined,
    demoVideoUrl: project.demo_video_url ?? undefined,
    views: project.views ?? 0,
    likes: project.likes ?? 0,
    comments: project.comments ?? 0,
  }));

  return <ProjectsPage initialProjects={initialProjects} />;
}
