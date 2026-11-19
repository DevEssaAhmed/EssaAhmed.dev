import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { extractArticleExternalMeta } from "@/data/externalArticlesStore";

export const revalidate = 120;

export interface SearchIndexItem {
  id: string;
  type: "article" | "project";
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
  badge?: string;
}

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const [articlesRes, projectsRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select(
          "id,slug,title,excerpt,is_external,external_url,platform,video_type,video_url"
        )
        .eq("published", true)
        .eq("unlisted", false)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("projects")
        .select("id,title,description,tags")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const items: SearchIndexItem[] = [];

    for (const post of articlesRes.data ?? []) {
      const meta = extractArticleExternalMeta(post);
      const isExternal = meta.isExternal && Boolean(meta.externalUrl);
      items.push({
        id: `article-${post.id}`,
        type: "article",
        title: post.title,
        subtitle: post.excerpt || (isExternal ? meta.externalUrl : "Article"),
        href: isExternal
          ? meta.externalUrl
          : `/articles/${encodeURIComponent(post.slug || post.id)}`,
        external: isExternal,
        badge: isExternal ? meta.platform || "External" : "Article",
      });
    }

    for (const project of projectsRes.data ?? []) {
      const tags = Array.isArray(project.tags) ? project.tags.slice(0, 3).join(" · ") : "";
      items.push({
        id: `project-${project.id}`,
        type: "project",
        title: project.title,
        subtitle: tags || (project.description ? project.description.slice(0, 100) : "Case Study"),
        href: `/projects/${project.id}`,
        badge: "Project",
      });
    }

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[api/search] Failed building search index:", error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
