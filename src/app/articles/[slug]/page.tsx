import ArticleDetailPageEnhanced from "./ArticleDetailPageEnhanced";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, image_url, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) {
    return buildPageMetadata({
      title: "Article Not Found",
      description: "The requested article could not be found.",
      path: `/articles/${slug}`,
    });
  }

  return {
    ...buildPageMetadata({
      title: data.title,
      description: data.excerpt || data.title,
      path: `/articles/${slug}`,
      image: data.image_url,
      type: "article",
    }),
    openGraph: {
      title: data.title,
      description: data.excerpt || data.title,
      type: "article",
      url: `/articles/${slug}`,
      publishedTime: data.created_at,
      images: data.image_url ? [{ url: data.image_url }] : undefined,
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

