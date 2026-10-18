import { getSupabaseServer } from "@/lib/supabase-server";
import type { MetadataRoute } from "next";

const SITE_URL = "https://essaahmed.dev";

export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = getSupabaseServer();

    // Avoid claiming static pages changed on every sitemap regeneration.
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL },
        { url: `${SITE_URL}/projects` },
        { url: `${SITE_URL}/articles` },
        { url: `${SITE_URL}/articles/categories` },
        { url: `${SITE_URL}/articles/series` },
        { url: `${SITE_URL}/articles/tags` },
        { url: `${SITE_URL}/about` },
        { url: `${SITE_URL}/diary` },
    ];

    // Dynamic article pages
    const { data: articles } = await supabase
        .from("blog_posts")
        .select("id, slug, updated_at, created_at")
        .eq("published", true)
        .eq("unlisted", false)
        .order("created_at", { ascending: false });

    const articlePages: MetadataRoute.Sitemap = (articles || []).map(
        (article: any) => ({
            url: `${SITE_URL}/articles/${article.slug || article.id}`,
            lastModified: new Date(article.updated_at || article.created_at),
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
        })
    );

    return [...staticPages, ...articlePages, ...projectPages];
}
