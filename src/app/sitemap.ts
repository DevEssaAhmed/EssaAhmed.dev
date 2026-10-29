import { getSupabaseServer } from "@/lib/supabase-server";
import type { MetadataRoute } from "next";
import { getContentAvailability } from "@/lib/content-availability";
import { DEFAULT_CONTENT_AVAILABILITY } from "@/types/content-availability";
import {
  isPublicListedArticle,
  PUBLIC_LISTED_ARTICLE_FILTERS,
} from "@/lib/public-content";

const SITE_URL = "https://essaahmed.dev";

export const revalidate = 120;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseServer();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL + "/",
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: SITE_URL + "/projects",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: SITE_URL + "/articles",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: SITE_URL + "/articles/categories",
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: SITE_URL + "/articles/series",
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: SITE_URL + "/articles/tags",
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: SITE_URL + "/about",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: SITE_URL + "/talks",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: SITE_URL + "/diary",
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const [
    { data: articlesData },
    { data: projectsData },
    { data: categoriesData },
    { data: seriesData },
    { data: tagsData },
  ] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("slug, updated_at, created_at, category_id, series_id")
      .eq("published", PUBLIC_LISTED_ARTICLE_FILTERS.published)
      .eq("unlisted", PUBLIC_LISTED_ARTICLE_FILTERS.unlisted)
      .order("created_at", { ascending: false }),
    supabase
      // All project rows are public in the current schema: there is no
      // published/unlisted/status field. Keep this aligned with the public
      // projects listing and detail route unless a visibility field is added.
      .from("projects")
      .select("id, updated_at, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, slug"),
    supabase.from("series").select("id, slug"),
    // A tag is discoverable only when linked to a published, listed article.
    supabase
      .from("tags")
      .select("id, name, slug, blog_post_tags(blog_posts(published, unlisted))"),
  ]);

  const articles = articlesData || [];
  const projects = projectsData || [];
  const publicCategoryIds = new Set(
    articles.map((article: any) => article.category_id).filter(Boolean)
  );
  const publicSeriesIds = new Set(
    articles.map((article: any) => article.series_id).filter(Boolean)
  );

  const articlePages: MetadataRoute.Sitemap = articles
    .filter((article: any) => Boolean(article.slug))
    .map((article: any) => ({
      url: SITE_URL + "/articles/" + article.slug,
      ...(article.updated_at || article.created_at
        ? { lastModified: new Date(article.updated_at || article.created_at) }
        : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const projectPages: MetadataRoute.Sitemap = projects
    .filter((project: any) => Boolean(project.id))
    .map((project: any) => ({
      url: SITE_URL + "/projects/" + project.id,
      ...(project.updated_at || project.created_at
        ? { lastModified: new Date(project.updated_at || project.created_at) }
        : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const categoryPages: MetadataRoute.Sitemap = (categoriesData || [])
    .filter(
      (category: any) =>
        category.slug && publicCategoryIds.has(category.id)
    )
    .map((category: any) => ({
      url: SITE_URL + "/articles/categories/" + category.slug,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const seriesPages: MetadataRoute.Sitemap = (seriesData || [])
    .filter(
      (item: any) => item.slug && publicSeriesIds.has(item.id)
    )
    .map((item: any) => ({
      url: SITE_URL + "/articles/series/" + item.slug,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const tagPages: MetadataRoute.Sitemap = (tagsData || [])
    .filter((tag: any) => {
      if (!tag?.slug) return false;
      return (tag.blog_post_tags || []).some((link: any) => {
        const linkedPosts = Array.isArray(link.blog_posts)
          ? link.blog_posts
          : link.blog_posts
            ? [link.blog_posts]
            : [];
        return linkedPosts.some(isPublicListedArticle);
      });
    })
    .map((tag: any) => ({
      url: SITE_URL + "/articles/tags/" + encodeURIComponent(tag.slug),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const availability = await getContentAvailability().catch((error) => {
    console.error("[sitemap] Failed to load content availability", error);
    return DEFAULT_CONTENT_AVAILABILITY;
  });

  const travelPages: MetadataRoute.Sitemap = availability.hasTravel
    ? [
        {
          url: SITE_URL + "/travel",
          changeFrequency: "monthly",
          priority: 0.7,
        },
      ]
    : [];

  return [
    ...staticPages,
    ...travelPages,
    ...articlePages,
    ...projectPages,
    ...categoryPages,
    ...seriesPages,
    ...tagPages,
  ];
}
