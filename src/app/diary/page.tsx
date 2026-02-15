import type { Metadata } from "next";
import DiaryPage from "@/legacy-pages/DiaryPage";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Diary | Essa Ahmed",
  description:
    "A public online diary timeline with personal notes, experiments, and life updates.",
  alternates: {
    canonical: "/diary",
  },
};

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("is_published", true)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, 19);

  return <DiaryPage initialEntries={data || []} />;
}
