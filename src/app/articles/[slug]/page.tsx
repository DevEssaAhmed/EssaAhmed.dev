import ArticleDetailPageEnhanced from "./ArticleDetailPageEnhanced";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, image_url, created_at, tags")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) return { title: "Article Not Found" };

  return {
    title: `${data.title} | Essa Ahmed`,
    description: data.excerpt || data.title,
    openGraph: {
      title: data.title,
      description: data.excerpt || data.title,
      type: "article",
      publishedTime: data.created_at,
      images: data.image_url ? [{ url: data.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.excerpt || data.title,
      images: data.image_url ? [data.image_url] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabaseServer();

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) notFound();

  return <ArticleDetailPageEnhanced initialArticle={data} />;
}
