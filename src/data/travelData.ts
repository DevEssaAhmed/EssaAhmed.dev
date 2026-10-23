import { supabase } from "@/integrations/supabase/client";

export interface TravelStorySlide {
  id: string;
  image_url: string;
  caption: string;
  timestamp: string;
  exif?: string;
}

export interface TravelEssayBlock {
  id?: string;
  type: "h3" | "p" | "quote" | "photo_pair";
  content?: string;
  text?: string;
  author?: string;
  images?: { url: string; caption: string; exif?: string; meta?: string }[];
}

export interface TravelCityHighlight {
  id: string;
  slug: string;
  city_name: string;
  city?: string;
  country_name: string;
  country?: string;
  country_code: string;
  flag: string;
  year: number;
  month: string;
  visited_at?: string;
  subtitle: string;
  lat: number;
  lng: number;
  cover_image_url: string;
  cover_url?: string;
  instagram_highlight_url: string;
  instagram_url?: string;
  is_published: boolean;
  story_slides: TravelStorySlide[];
  essay_title: string;
  essay_blocks: TravelEssayBlock[];
}

const STORAGE_KEY = "essa_portfolio_travel_highlights_v2";

export function normalizeTravelRow(row: any): TravelCityHighlight {
  const cityName = row.city_name || row.city || "";
  const countryName = row.country || row.country_name || "";
  const visitedAt = row.visited_at || row.month || (row.year ? String(row.year) : "");
  const coverUrl = row.cover_url || row.cover_image_url || "";
  const instagramUrl = row.instagram_url || row.instagram_highlight_url || "";
  const rawBlocks = Array.isArray(row.essay_blocks) ? row.essay_blocks : [];

  return {
    id: row.id || row.slug || "city-id",
    slug: row.slug || row.id || "city",
    city_name: cityName,
    city: cityName,
    country_name: countryName,
    country: countryName,
    country_code: row.country_code || "",
    flag: row.flag || "",
    year: Number(row.year || 0),
    month: visitedAt,
    visited_at: visitedAt,
    subtitle: row.subtitle || "",
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    cover_image_url: coverUrl,
    cover_url: coverUrl,
    instagram_highlight_url: instagramUrl,
    instagram_url: instagramUrl,
    is_published: row.is_published === true,
    story_slides: Array.isArray(row.story_slides) ? row.story_slides : [],
    essay_title: row.essay_title || cityName,
    essay_blocks: rawBlocks.map((b: any, idx: number) => ({
      id: b.id || `block-${idx}`,
      type: b.type || "p",
      content: b.content || b.text || "",
      text: b.text || b.content || "",
      author: b.author,
      images: Array.isArray(b.images)
        ? b.images.map((img: any) => ({
            url: img.url || "",
            caption: img.caption || "",
            exif: img.exif || img.meta || "",
            meta: img.meta || img.exif || "",
          }))
        : undefined,
    })),
  };
}

export function loadTravelHighlightsLocal(): TravelCityHighlight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeTravelRow);
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveTravelHighlightsLocal(items: TravelCityHighlight[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(normalizeTravelRow)));
  } catch {
    // ignore
  }
}

export async function fetchTravelHighlightsFromSupabase(): Promise<TravelCityHighlight[]> {
  try {
    const { data, error } = await supabase
      .from("travel_highlights")
      .select("*")
      .order("year", { ascending: false });

    if (!error && Array.isArray(data)) {
      const mapped: TravelCityHighlight[] = data.map(normalizeTravelRow);
      saveTravelHighlightsLocal(mapped);
      return mapped;
    }
  } catch {
    // Fallback to local
  }
  return loadTravelHighlightsLocal();
}

export async function upsertTravelHighlightInSupabase(
  item: TravelCityHighlight
): Promise<void> {
  const normalized = normalizeTravelRow(item);
  const { error } = await (supabase as any).from("travel_highlights").upsert(
    {
      id: normalized.id,
      slug: normalized.slug,
      city_name: normalized.city_name,
      country_name: normalized.country_name,
      country_code: normalized.country_code,
      flag: normalized.flag,
      month: normalized.month,
      year: normalized.year,
      lat: normalized.lat,
      lng: normalized.lng,
      subtitle: normalized.subtitle,
      cover_image_url: normalized.cover_image_url,
      instagram_highlight_url: normalized.instagram_highlight_url,
      is_published: normalized.is_published,
      story_slides: normalized.story_slides as any,
      essay_title: normalized.essay_title,
      essay_blocks: normalized.essay_blocks as any,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }
}

export async function deleteTravelHighlightFromSupabase(id: string): Promise<void> {
  const { error } = await (supabase as any).from("travel_highlights").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

