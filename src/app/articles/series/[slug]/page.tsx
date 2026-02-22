import SeriesDetailPage from "./SeriesDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { Metadata } from 'next';

export const revalidate = 120; // 2 minutes

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = getSupabaseServer();

  const { data: series } = await supabase
    .from("series")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!series) {
    return { title: 'Series Not Found' };
  }

  return {
    title: `${series.name} | Series`,
    description: series.description || `Read the complete ${series.name} article series.`,
    alternates: {
      canonical: `/articles/series/${slug}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = getSupabaseServer();

  // 1. Fetch series by slug
  const { data: seriesData } = await supabase
    .from("series")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!seriesData) {
    return <SeriesDetailPage />; // Let client handle the 404/redirect
  }

  // 2. Fetch associated published articles ordered by series_order
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
