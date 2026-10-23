import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TravelPage from "./TravelPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";
import { normalizeTravelRow } from "@/data/travelData";
import { isPublicTravelHighlight } from "@/data/travelVisibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Travel Highlights",
  description:
    "Field dispatches, architectural studies, and travel essays from around the globe by Essa Ahmed.",
  path: "/travel",
});

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("travel_highlights")
    .select("*")
    .eq("is_published", true)
    .order("year", { ascending: false });

  if (error) {
    console.error("[travel] Failed to load published travel highlights", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Failed to load published travel highlights", {
      cause: error,
    });
  }

  const highlights = (data ?? [])
    .filter(isPublicTravelHighlight)
    .map(normalizeTravelRow);

  if (highlights.length === 0) notFound();

  return <TravelPage initialHighlights={highlights} />;
}
