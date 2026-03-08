import TagsPage from "./TagsPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Article Tags",
  description: "Browse all article tags and trending topics across the site.",
  path: "/articles/tags",
});

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase.rpc("get_all_tags_with_counts");

  const tagInfoArray = (data || [])
    .map((tag: any) => ({
      name: tag.name,
      slug: tag.name.toLowerCase().replace(/\s+/g, "-"),
      count: tag.article_count,
      articleCount: tag.article_count,
      trending: tag.article_count >= 3,
    }))
    .filter((tag: any) => tag.articleCount > 0)
    .sort((a: any, b: any) => b.count - a.count);

  return <TagsPage initialTags={tagInfoArray} />;
}

