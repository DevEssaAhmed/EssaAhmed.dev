import CategoryDetailPage from "./CategoryDetailPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 120;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!data) {
    return buildPageMetadata({
      title: "Category Not Found",
      description: "The requested category could not be found.",
      path: `/articles/categories/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${data.name} Category`,
    description: data.description || `Explore articles in ${data.name}.`,
    path: `/articles/categories/${slug}`,
  });
}

export default function Page() {
  return <CategoryDetailPage />;
}

