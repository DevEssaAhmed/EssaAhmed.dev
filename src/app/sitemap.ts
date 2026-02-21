import { getSupabaseServer } from "@/lib/supabase-server";
import type { MetadataRoute } from "next";

const SITE_URL = "https://essaahmed.dev";

export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = getSupabaseServer();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/projects`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/articles`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/articles/categories`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/articles/series`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/articles/tags`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
    ];

    // Dynamic article pages
    const { data: articles } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

    const articlePages: MetadataRoute.Sitemap = (articles || []).map(
        (article: any) => ({
            url: `${SITE_URL}/articles/${article.slug}`,
            lastModified: new Date(article.updated_at || article.created_at),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })
    );

    // Dynamic project pages
    const { data: projects } = await supabase
        .from("projects")
        .select("id, updated_at, created_at")
        .order("created_at", { ascending: false });

    const projectPages: MetadataRoute.Sitemap = (projects || []).map(
        (project: any) => ({
            url: `${SITE_URL}/projects/${project.id}`,
            lastModified: new Date(project.updated_at || project.created_at),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        })
    );

    return [...staticPages, ...articlePages, ...projectPages];
}
