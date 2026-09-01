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
  const [{ data: categories }, { data: publicPosts }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("featured", { ascending: false })
      .order("article_count", { ascending: false }),
    supabase
      .from("blog_posts")
      .select("category_id")
      .eq("published", true)
      .eq("unlisted", false),
  ]);

  const countsByCategory = (publicPosts || []).reduce((counts: Map<string, number>, post: any) => {
    if (post.category_id) counts.set(post.category_id, (counts.get(post.category_id) || 0) + 1);
    return counts;
  }, new Map<string, number>());

  const categoriesWithPublicCounts = (categories || []).map((category: any) => ({
    ...category,
    article_count: countsByCategory.get(category.id) || 0,
  }));

  return <CategoriesPage initialCategories={categoriesWithPublicCounts} />;
}

