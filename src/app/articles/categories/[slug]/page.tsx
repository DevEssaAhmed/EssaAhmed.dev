import { cache } from "react";
import CategoryDetailPage from "./CategoryDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";
import { PUBLIC_LISTED_ARTICLE_FILTERS } from "@/lib/public-content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 120;

const getCategoryBySlug = cache(async (slug: string) => {
  const supabase = getSupabaseServer();
  return supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getCategoryBySlug(slug);

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
  const { data: categoryData } = await getCategoryBySlug(slug);

  if (!categoryData) {
    notFound();
  }

  const supabase = getSupabaseServer();
  const { data: articlesData } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("category_id", categoryData.id)
    .eq("published", PUBLIC_LISTED_ARTICLE_FILTERS.published)
    .eq("unlisted", PUBLIC_LISTED_ARTICLE_FILTERS.unlisted)
    .order("created_at", { ascending: false });

  return (
    <CategoryDetailPage
      initialCategory={categoryData}
      initialArticles={articlesData || []}
    />
  );
}
