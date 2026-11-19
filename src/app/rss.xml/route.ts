import { getSupabaseServer } from "@/lib/supabase-server";
import { extractArticleExternalMeta } from "@/data/externalArticlesStore";

export const revalidate = 300;

const SITE_URL = "https://essaahmed.dev";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = getSupabaseServer();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select(
      "id,title,slug,excerpt,created_at,updated_at,is_external,external_url,platform,video_type,video_url"
    )
    .eq("published", true)
    .eq("unlisted", false)
    .order("created_at", { ascending: false })
    .limit(50);

  const itemsXml = (posts ?? [])
    .map((post) => {
      const meta = extractArticleExternalMeta(post);
      const isExternal = meta.isExternal && Boolean(meta.externalUrl);
      const link = isExternal
        ? meta.externalUrl
        : `${SITE_URL}/articles/${encodeURIComponent(post.slug || post.id)}`;
      const pubDate = new Date(
        post.created_at || post.updated_at || Date.now()
      ).toUTCString();
      const description = post.excerpt || post.title;

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Essa Ahmed — Articles &amp; Insights</title>
    <link>${SITE_URL}/articles</link>
    <description>Notes on workflow automation, supply chain demand planning, and analytics systems by Essa Ahmed.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
