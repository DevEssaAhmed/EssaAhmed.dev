import CategoriesPage from "@/legacy-pages/CategoriesPage";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("featured", { ascending: false })
    .order("article_count", { ascending: false });

  return <CategoriesPage initialCategories={data || []} />;
}
