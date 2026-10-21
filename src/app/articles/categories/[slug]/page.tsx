import CategoryDetailPage from "./CategoryDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!data) {
    return buildPageMetadata({
      title: "Category Not Found",
      description: "The requested category could not be found.",
      path: `/articles/categories/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${data.name} Articles`,
    description: data.description || `Explore articles in ${data.name}.`,
    path: `/articles/categories/${slug}`,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabaseServer();

  const { data: categoryData } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!categoryData) {
    notFound();
  }

  const { data: articlesData } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("category_id", categoryData.id)
    .eq("published", true)
    .eq("unlisted", false)
    .order("created_at", { ascending: false });

  return (
    <CategoryDetailPage
      initialCategory={categoryData}
      initialArticles={articlesData || []}
    />
  );
}
