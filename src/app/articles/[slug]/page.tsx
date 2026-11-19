import { cache } from "react";
import ArticleDetailPageEnhanced from "./ArticleDetailPageEnhanced";
import ServerMarkdownRenderer from "@/components/markdown/ServerMarkdownRenderer";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildDynamicOgUrl, buildPageMetadata } from "@/lib/metadata";
import { calculateReadingTime } from "@/utils/readingTime";

type PageProps = { params: Promise<{ slug: string }> };

const UUID_ROUTE_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ARTICLE_DETAIL_SELECT =
  "id,title,slug,excerpt,content,image_url,tags,reading_time,published,unlisted,created_at,updated_at,video_url,video_type";

const getPublishedArticle = cache(async (routeKey: string): Promise<any> => {
  const supabase = getSupabaseServer();
  const bySlug = await supabase
    .from("blog_posts")
    .select(ARTICLE_DETAIL_SELECT)
    .eq("slug", routeKey)
    .eq("published", true)
    .maybeSingle();

  if (bySlug.data || !UUID_ROUTE_KEY.test(routeKey)) return bySlug.data;

  const byId = await supabase
    .from("blog_posts")
    .select(ARTICLE_DETAIL_SELECT)
    .eq("id", routeKey)
    .eq("published", true)
    .maybeSingle();

  return byId.data;
});

export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedArticle(slug);

  if (!data) {
    return buildPageMetadata({
      title: "Article Not Found",
      description: "The requested article could not be found.",
      path: `/articles/${slug}`,
    });
  }

  const ogImage =
    data.image_url && !String(data.image_url).includes("placeholder.svg")
      ? data.image_url
      : buildDynamicOgUrl({
          title: data.title,
          subtitle: data.excerpt || data.title,
          badge: "Article",
        });

  return {
    ...buildPageMetadata({
      title: data.title,
      description: data.excerpt || data.title,
      path: `/articles/${data.slug || slug}`,
      image: ogImage,
      type: "article",
    }),
    openGraph: {
      title: data.title,
      description: data.excerpt || data.title,
      type: "article",
      url: `/articles/${data.slug || slug}`,
      publishedTime: data.created_at,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${data.title} | Essa Ahmed`,
      }],
    },
    robots: data.unlisted ? { index: false, follow: false } : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPublishedArticle(slug);

  if (!data) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    description: data.excerpt || data.title,
    datePublished: data.created_at,
    dateModified: data.updated_at || data.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://essaahmed.dev/articles/${data.slug || slug}`,
    },
    author: {
      "@type": "Person",
      name: "Essa Ahmed",
      url: "https://essaahmed.dev",
    },
    image: data.image_url ? [data.image_url] : ["https://essaahmed.dev/og-image.png"],
  };

  const { content, ...serializableArticle } = data;
  const resolvedReadingTime =
    data.reading_time || calculateReadingTime(content || "");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ArticleDetailPageEnhanced
        initialArticle={{
          ...serializableArticle,
          reading_time: resolvedReadingTime,
          slug: data.slug || data.id,
        } as any}
        renderedContent={<ServerMarkdownRenderer content={content || ""} />}
      />
    </>
  );
}
