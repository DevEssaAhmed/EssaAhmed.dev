import SeriesDetailPage from "./SeriesDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = getSupabaseServer();

  const { data: series } = await supabase
    .from("series")
    .select("title, description")
    .eq("slug", slug)
    .single();

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
  const supabase = getSupabaseServer();

  const { data: seriesData } = await supabase
    .from("series")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!seriesData) {
    return <SeriesDetailPage />;
  }

  const { data: articlesData } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("series_id", seriesData.id)
    .eq("published", true)
    .order("series_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <SeriesDetailPage
      initialSeries={seriesData}
      initialArticles={articlesData || []}
    />
  );
}

