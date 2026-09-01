import TagDetailPage from "./TagDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

type Props = {
  params: Promise<{ tagSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedTag = decodeURIComponent(resolvedParams.tagSlug.replace(/-/g, " "));
  const supabase = getSupabaseServer();

  const { data: tagData } = await supabase
    .from("tags")
    .select("name")
    .eq("name", decodedTag)
    .single();

  if (!tagData) {
    return buildPageMetadata({
      title: "Tag Not Found",
      description: "The requested tag could not be found.",
      path: `/articles/tags/${resolvedParams.tagSlug}`,
    });
  }

  return buildPageMetadata({
    title: `#${tagData.name}`,
    description: `Explore all articles and projects tagged with #${tagData.name}.`,
    path: `/articles/tags/${resolvedParams.tagSlug}`,
  });
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const decodedTag = decodeURIComponent(resolvedParams.tagSlug.replace(/-/g, " "));
  const supabase = getSupabaseServer();

  const { data: tagData } = await supabase
    .from("tags")
    .select("id, name")
    .eq("name", decodedTag)
    .single();

  if (!tagData) {
    return <TagDetailPage />;
  }

  const { data: blogPostTagData } = await supabase
    .from("blog_post_tags")
    .select("blog_post_id, blog_posts!inner(*)")
    .eq("tag_id", tagData.id)
    .eq("blog_posts.published", true)
    .eq("blog_posts.unlisted", false);
  const blogPosts = blogPostTagData?.map((item: any) => item.blog_posts).filter(Boolean).flat() || [];

  const publicPostIds = (blogPostTagData || []).map((item: any) => item.blog_post_id);
  const { data: relatedTagLinks } = publicPostIds.length > 0
    ? await supabase
        .from("blog_post_tags")
        .select("tags(name)")
        .in("blog_post_id", publicPostIds)
        .neq("tag_id", tagData.id)
    : { data: [] };

  const relatedTagCounts = (relatedTagLinks || []).reduce((counts: Map<string, number>, link: any) => {
    const relatedTag = Array.isArray(link.tags) ? link.tags[0] : link.tags;
    if (relatedTag?.name) counts.set(relatedTag.name, (counts.get(relatedTag.name) || 0) + 1);
    return counts;
  }, new Map<string, number>());
  const relatedTags = Array.from(relatedTagCounts, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <TagDetailPage
      initialTagName={decodedTag}
      initialBlogPosts={blogPosts}
      initialRelatedTags={relatedTags}
    />
  );
}

