import ProjectDetailPage from "./ProjectDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

  if (!data) return { title: "Project Not Found" };

  return {
    title: `${data.title} | Essa Ahmed`,
    description: data.description || data.title,
    openGraph: {
      title: data.title,
      description: data.description || data.title,
      type: "article",
      images: data.image_url ? [{ url: data.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description || data.title,
      images: data.image_url ? [data.image_url] : undefined,
    },
  };
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
