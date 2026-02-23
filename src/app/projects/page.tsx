import ProjectsPage from "./ProjectsPage";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("projects")
    .select("*, categories(name), project_tags(tags(name))")
    .order("created_at", { ascending: false });

  const initialProjects = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image_url || "/placeholder.svg",
    tags: (p.project_tags || []).map((pt: any) => pt.tags?.name).filter(Boolean),
    category: p.categories?.name || "Uncategorized",
    demoUrl: p.demo_url,
    githubUrl: p.github_url,
    views: p.views || 0,
    likes: p.likes || 0,
    comments: p.comments || 0,
  }));

  return <ProjectsPage initialProjects={initialProjects} />;
}
