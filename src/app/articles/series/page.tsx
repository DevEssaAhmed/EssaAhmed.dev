import SeriesPage from "@/legacy-pages/SeriesPage";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("series")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  return <SeriesPage initialSeries={data || []} />;
}
