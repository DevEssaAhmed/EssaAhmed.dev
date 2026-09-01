import SeriesPage from "./SeriesPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Article Series",
  description: "Dive into structured article series and long-form learning paths.",
  path: "/articles/series",
});

export default async function Page() {
  const supabase = getSupabaseServer();
  const [{ data: series }, { data: publicPosts }] = await Promise.all([
    supabase
      .from("series")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("blog_posts")
      .select("series_id")
      .eq("published", true)
      .eq("unlisted", false),
  ]);

  const countsBySeries = (publicPosts || []).reduce((counts: Map<string, number>, post: any) => {
    if (post.series_id) counts.set(post.series_id, (counts.get(post.series_id) || 0) + 1);
    return counts;
  }, new Map<string, number>());

  const seriesWithPublicCounts = (series || []).map((seriesItem: any) => ({
    ...seriesItem,
    article_count: countsBySeries.get(seriesItem.id) || 0,
  }));

  return <SeriesPage initialSeries={seriesWithPublicCounts} />;
}

