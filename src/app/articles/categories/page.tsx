import CategoriesPage from "./CategoriesPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Article Categories",
  description: "Explore articles organized by topic and subject area.",
  path: "/articles/categories",
});

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("featured", { ascending: false })
    .order("article_count", { ascending: false });

  return <CategoriesPage initialCategories={data || []} />;
}

