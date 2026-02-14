import ProjectDetailPage from "@/legacy-pages/ProjectDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export const revalidate = 120;

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const supabase = getSupabaseServer();

  const [{ data: project }, { data: tagRows }] = await Promise.all([
    supabase.from("projects").select("*, categories ( id, name, slug )").eq("id", id).single(),
    supabase.from("project_tags").select("tags(id,name)").eq("project_id", id),
  ]);

  if (!project) notFound();

  const initialProjectTags = (tagRows || [])
    .map((row: any) => row.tags)
    .filter(Boolean)
    .map((tag: any) => ({ id: tag.id, name: tag.name }));

  return <ProjectDetailPage initialProject={project} initialProjectTags={initialProjectTags} />;
}
