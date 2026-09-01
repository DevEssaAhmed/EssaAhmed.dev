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
  const { data } = await supabase
    .from("tags")
    .select("name, blog_post_tags(blog_posts(published, unlisted))");

  const tagInfoArray = (data || [])
    .map((tag: any) => {
      const articleCount = (tag.blog_post_tags || []).reduce((count: number, link: any) => {
        const post = Array.isArray(link.blog_posts) ? link.blog_posts[0] : link.blog_posts;
        return count + (post?.published && !post?.unlisted ? 1 : 0);
      }, 0);

      return {
        name: tag.name,
        slug: tag.name.toLowerCase().replace(/\s+/g, "-"),
        count: articleCount,
        articleCount,
        trending: articleCount >= 3,
      };
    })
    .filter((tag: any) => tag.articleCount > 0)
    .sort((a: any, b: any) => b.count - a.count);

  return <TagsPage initialTags={tagInfoArray} />;
}

