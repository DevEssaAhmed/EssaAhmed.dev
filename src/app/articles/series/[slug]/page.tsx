import { cache } from "react";
import SeriesDetailPage from "./SeriesDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { PUBLIC_LISTED_ARTICLE_FILTERS } from "@/lib/public-content";

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
};

const getSeriesBySlug = cache(async (slug: string) => {
  const supabase = getSupabaseServer();
  return supabase
    .from("series")
    .select("*")
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
    .select("*")
    .eq("series_id", seriesData.id)
    .eq("published", PUBLIC_LISTED_ARTICLE_FILTERS.published)
    .eq("unlisted", PUBLIC_LISTED_ARTICLE_FILTERS.unlisted)
    .order("series_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <SeriesDetailPage
      initialSeries={seriesData}
      initialArticles={articlesData || []}
    />
  );
}
