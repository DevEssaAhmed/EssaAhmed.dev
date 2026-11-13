import { cache } from "react";
import SeriesDetailPage from "./SeriesDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { calculateReadingTime } from "@/utils/readingTime";

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
};

const getSeriesBySlug = cache(async (slug: string) => {
  const supabase = getSupabaseServer();
  return supabase
    .from("series")
    .select("id,title,slug,description,image_url,featured_image_url,featured,status")
    .eq("slug", slug)
    .maybeSingle();
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const { data: series } = await getSeriesBySlug(slug);

  if (!series) {
    return buildPageMetadata({
      title: "Series Not Found",
      description: "The requested series could not be found.",
      path: `/articles/series/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${series.title} Series`,
    description: series.description || `Read the complete ${series.title} article series.`,
    path: `/articles/series/${slug}`,
  });
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const { data: seriesData } = await getSeriesBySlug(slug);

  if (!seriesData) {
    notFound();
  }

  const supabase = getSupabaseServer();
  const { data: articlesData } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,reading_time,series_order,created_at")
    .eq("series_id", seriesData.id)
    .eq("published", true)
    .eq("unlisted", false)
    .order("series_order", { ascending: true })
    .order("created_at", { ascending: true });

  const initialArticles = (articlesData || []).map(({ content, ...rest }: any) => ({
    ...rest,
    reading_time: rest.reading_time || calculateReadingTime(content || ""),
  }));

  return (
    <SeriesDetailPage
      initialSeries={seriesData}
      initialArticles={initialArticles}
    />
  );
}
