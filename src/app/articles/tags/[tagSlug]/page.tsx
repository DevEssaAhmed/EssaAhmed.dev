import { cache } from "react";
import TagDetailPage from "./TagDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { resolveTagByParam } from "@/lib/tag-slug";

export const revalidate = 120;

type Props = {
  params: Promise<{ tagSlug: string }>;
};

const getTagByParam = cache(async (tagSlug: string) => {
  const supabase = getSupabaseServer();
  return resolveTagByParam(supabase, tagSlug);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: tagData } = await getTagByParam(resolvedParams.tagSlug);

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
    path: `/articles/tags/${tagData.slug || resolvedParams.tagSlug}`,
  });
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { data: tagData } = await getTagByParam(resolvedParams.tagSlug);

  if (!tagData) {
    notFound();
  }

  const supabase = getSupabaseServer();
  const { data: blogPostTagData } = await supabase
    .from("blog_post_tags")
    .select(
      "blog_post_id, blog_posts!inner(id,title,slug,excerpt,image_url,tags,created_at,published,unlisted)"
    )
    .eq("tag_id", tagData.id)
    .eq("blog_posts.published", true)
    .eq("blog_posts.unlisted", false);
  const blogPosts = blogPostTagData?.map((item: any) => item.blog_posts).filter(Boolean).flat() || [];

  const publicPostIds = (blogPostTagData || []).map((item: any) => item.blog_post_id);
  const { data: relatedTagLinks } = publicPostIds.length > 0
    ? await supabase
        .from("blog_post_tags")
        .select("tags(name, slug)")
        .in("blog_post_id", publicPostIds)
        .neq("tag_id", tagData.id)
    : { data: [] };

  const relatedTagMap = (relatedTagLinks || []).reduce(
    (acc: Map<string, { name: string; slug: string | null; count: number }>, link: any) => {
      const relatedTag = Array.isArray(link.tags) ? link.tags[0] : link.tags;
      if (relatedTag?.name) {
        const existing = acc.get(relatedTag.name);
        if (existing) {
          existing.count += 1;
        } else {
          acc.set(relatedTag.name, {
            name: relatedTag.name,
            slug: relatedTag.slug ?? null,
            count: 1,
          });
        }
      }
      return acc;
    },
    new Map<string, { name: string; slug: string | null; count: number }>()
  );
  const relatedTags = Array.from(relatedTagMap.values()).sort(
    (a, b) => b.count - a.count
  );

  return (
    <TagDetailPage
      initialTagName={tagData.name}
      initialBlogPosts={blogPosts}
      initialRelatedTags={relatedTags}
    />
  );
}
