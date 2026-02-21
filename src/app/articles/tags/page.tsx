import TagsPage from "@/legacy-pages/TagsPage";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase.rpc("get_all_tags_with_counts");

  const tagInfoArray = (data || [])
    .map((tag: any) => ({
      name: tag.name,
      slug: tag.name.toLowerCase().replace(/\s+/g, "-"),
      count: tag.article_count, // Use article_count as the definitive count
      articleCount: tag.article_count,
      trending: tag.article_count >= 3,
    }))
    .filter((tag: any) => tag.articleCount > 0) // Only show tags with articles
    .sort((a: any, b: any) => b.count - a.count);

  return <TagsPage initialTags={tagInfoArray} />;
}
