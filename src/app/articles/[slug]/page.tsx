import ArticleDetailPageEnhanced from "./ArticleDetailPageEnhanced";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

const UUID_ROUTE_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getPublishedArticle(supabase: ReturnType<typeof getSupabaseServer>, routeKey: string, includeContent = false): Promise<any> {
  const fields = includeContent
    ? "*"
    : "id,title,slug,excerpt,image_url,created_at,unlisted";
  const bySlug = await supabase
    .from("blog_posts")
    .select(fields as any)
    .eq("slug", routeKey)
    .eq("published", true)
    .maybeSingle();

  if (bySlug.data || !UUID_ROUTE_KEY.test(routeKey)) return bySlug.data;

  const byId = await supabase
    .from("blog_posts")
    .select(fields as any)
    .eq("id", routeKey)
    .eq("published", true)
    .maybeSingle();

  return byId.data;
}

export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServer();
  const data = await getPublishedArticle(supabase, slug);

  if (!data) {
    return buildPageMetadata({
      title: "Article Not Found",
      description: "The requested article could not be found.",
      path: `/articles/${slug}`,
    });
  }

  return {
    ...buildPageMetadata({
      title: data.title,
      description: data.excerpt || data.title,
      path: `/articles/${data.slug || slug}`,
      image: data.image_url,
      type: "article",
    }),
    openGraph: {
      title: data.title,
      description: data.excerpt || data.title,
      type: "article",
      url: `/articles/${data.slug || slug}`,
      publishedTime: data.created_at,
      images: [{
        url: data.image_url || "/og-image.png",
        alt: `${data.title} | Essa Ahmed`,
      }],
    },
    robots: data.unlisted ? { index: false, follow: false } : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabaseServer();
  const data = await getPublishedArticle(supabase, slug, true);

  if (!data) notFound();

  return (
    <ArticleDetailPageEnhanced
      initialArticle={{ ...data, slug: data.slug || data.id } as any}
    />
  );
}

