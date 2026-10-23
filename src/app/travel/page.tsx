import type { Metadata } from "next";
import TravelPage from "./TravelPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";
import {
  DEFAULT_TRAVEL_HIGHLIGHTS,
  normalizeTravelRow,
  type TravelCityHighlight,
} from "@/data/travelData";

export const revalidate = 120;

export const metadata: Metadata = buildPageMetadata({
  title: "Travel Highlights",
  description:
    "Field dispatches, architectural studies, and travel essays from around the globe by Essa Ahmed.",
  path: "/travel",
});

export default async function Page() {
  let highlights: TravelCityHighlight[] = DEFAULT_TRAVEL_HIGHLIGHTS;
  let initialLoadSucceeded = false;

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("travel_highlights")
      .select("*")
      .eq("is_published", true)
      .order("year", { ascending: false });

    if (!error && data && data.length > 0) {
      highlights = data.map(normalizeTravelRow);
      initialLoadSucceeded = true;
    }
  } catch (err) {
    console.error("[travel] Failed to load travel highlights server-side", err);
  }

  return (
    <TravelPage
      initialHighlights={highlights}
      initialLoadSucceeded={initialLoadSucceeded}
    />
  );
}
