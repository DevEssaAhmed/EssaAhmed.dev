import ArticlesPage from "@/legacy-pages/ArticlesPage";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

export const metadata = {
  title: "Articles & Insights | Essa Ahmed",
  description: "Thoughts, tutorials, and insights about data science, analytics, and technology",
};

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return <ArticlesPage initialArticles={data || []} />;
}
