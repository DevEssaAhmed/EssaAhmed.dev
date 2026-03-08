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
    .select("blog_posts(*)")
    .eq("tag_id", tagData.id);
  const blogPosts = blogPostTagData?.map((item: any) => item.blog_posts).filter(Boolean).flat() || [];

  const { data: relatedTags } = await supabase
    .rpc("get_related_tags", { p_tag_name: decodedTag });

  return (
    <TagDetailPage
      initialTagName={decodedTag}
      initialBlogPosts={blogPosts}
      initialRelatedTags={relatedTags || []}
    />
  );
}

