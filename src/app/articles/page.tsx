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
    .select(
      "id,title,slug,excerpt,created_at,reading_time,is_external,external_url,platform,pillar,video_type,video_url"
    )
    .eq("published", true)
    .eq("unlisted", false)
    .order("created_at", { ascending: false });

  return <ArticlesPage initialArticles={data || []} />;
}

