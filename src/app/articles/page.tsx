import ArticlesPage from "./ArticlesPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Articles & Insights",
  description: "Thoughts, tutorials, and insights about data science, analytics, and technology.",
  path: "/articles",
});

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return <ArticlesPage initialArticles={data || []} />;
}

