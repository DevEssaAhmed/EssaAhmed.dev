import ProjectDetailPage from "./ProjectDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ id: string }> };

export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("projects")
    .select("title, description, image_url")
    .eq("id", id)
    .single();

  if (!data) {
    return buildPageMetadata({
      title: "Project Not Found",
      description: "The requested project could not be found.",
      path: `/projects/${id}`,
    });
  }

  return buildPageMetadata({
    title: data.title,
    description: data.description || data.title,
    path: `/projects/${id}`,
    image: data.image_url,
  });
}

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

