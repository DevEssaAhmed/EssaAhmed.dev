import ArticleDetailPageEnhanced from "@/legacy-pages/ArticleDetailPageEnhanced";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 120;

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
