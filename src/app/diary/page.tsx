import type { Metadata } from "next";
import DiaryPage from "./DiaryPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata: Metadata = buildPageMetadata({
  title: "Diary",
  description:
    "A public online diary timeline with personal notes, experiments, and life updates.",
  path: "/diary",
});

type SearchParamValue = string | string[] | undefined;

type DiaryPageRouteProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

const firstParam = (value: SearchParamValue) =>
  Array.isArray(value) ? value[0] : value;

const parseYear = (value: SearchParamValue): number | null => {
  const raw = firstParam(value);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) return null;
  return parsed;
};

const parseViewMode = (value: SearchParamValue): "year" | "timeline" => {
  const raw = firstParam(value);
  return raw === "timeline" ? "timeline" : "year";
};

export default async function Page({ searchParams }: DiaryPageRouteProps) {
  const resolvedSearchParams: Record<string, SearchParamValue> =
    await (searchParams ?? Promise.resolve({} as Record<string, SearchParamValue>));
  const initialYear = parseYear(resolvedSearchParams.year);
  const initialViewMode = parseViewMode(resolvedSearchParams.view);

  const supabase = getSupabaseServer();
  let query = supabase
    .from("diary_entries")
    .select("*")
    .eq("is_published", true)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (initialYear) {
    query = query
      .gte("entry_date", `${initialYear}-01-01`)
      .lte("entry_date", `${initialYear}-12-31`);
  }

  const { data } = await query.range(0, 19);

  return (
    <DiaryPage
      initialEntries={data || []}
      initialViewMode={initialViewMode}
      initialYear={initialYear}
    />
  );
}

