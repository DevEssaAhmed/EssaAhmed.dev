import SeriesPage from "./SeriesPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Article Series",
  description: "Dive into structured article series and long-form learning paths.",
  path: "/articles/series",
});

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("series")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  return <SeriesPage initialSeries={data || []} />;
}

