import AboutPage from "./AboutPage";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

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
