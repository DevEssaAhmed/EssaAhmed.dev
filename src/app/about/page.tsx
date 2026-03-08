import AboutPage from "./AboutPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "About",
  description: "Background, writing, and current focus areas for Essa Ahmed.",
  path: "/about",
});

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("profile_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  return <AboutPage initialProfile={data || undefined} />;
}

