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
  const { data, error } = await supabase
    .from("projects")
    .select("title,description,image_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[project detail] Failed to load metadata", {
      code: error.code,
      message: error.message,
    });
  }

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

  // Read the project without relationship embedding. An absent category/tag
  // relation must not cause an otherwise valid project route to 404.
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (projectError) {
    console.error("[project detail] Failed to load project", {
      code: projectError.code,
      message: projectError.message,
      hint: projectError.hint,
    });
  }

  if (!project) notFound();

  const [categoryResult, tagResult] = await Promise.all([
    project.category_id
      ? supabase
          .from("categories")
          .select("id,name,slug")
          .eq("id", project.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("project_tags").select("tags(id,name)").eq("project_id", id),
  ]);

  if (categoryResult.error) {
    console.warn("[project detail] Category lookup failed", {
      code: categoryResult.error.code,
      message: categoryResult.error.message,
    });
  }
  if (tagResult.error) {
    console.warn("[project detail] Related tags lookup failed", {
      code: tagResult.error.code,
      message: tagResult.error.message,
    });
  }

  const directTags = Array.isArray(project.tags)
    ? project.tags.filter(Boolean).map((name: string) => ({ id: name, name }))
    : [];
  const relatedTags = (tagResult.data ?? [])
    .map((row: any) => row.tags)
    .filter(Boolean)
    .map((tag: any) => ({ id: tag.id, name: tag.name }));
  const initialProjectTags = directTags.length ? directTags : relatedTags;

  return (
    <ProjectDetailPage
      initialProject={{ ...project, categories: categoryResult.data ?? null }}
      initialProjectTags={initialProjectTags}
    />
  );
}
