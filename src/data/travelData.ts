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

export const DEFAULT_TRAVEL_HIGHLIGHTS: TravelCityHighlight[] = [
  {
    id: "riyadh-sa",
    slug: "riyadh",
    city_name: "Riyadh",
    country_name: "Saudi Arabia",
    country_code: "SA",
    flag: "🇸🇦",
    year: 2025,
    month: "Nov 2025",
    subtitle: "Desert Modernism & Ancient Mud-Brick Architecture",
    lat: 24.7136,
    lng: 46.6753,
    cover_image_url:
      "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=85",
    instagram_highlight_url: "https://www.instagram.com/",
    is_published: true,
    story_slides: [
      {
        id: "riyadh-1",
        image_url:
          "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=85",
        caption: "Kingdom Centre skybridge glowing over Olaya at dusk.",
        timestamp: "20:14 AST",
        exif: "24mm · f/1.8 · ISO 400",
      },
      {
        id: "riyadh-2",
        image_url:
          "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85",
        caption: "Walking the restored Najdi mud-brick alleys of At-Turaif in Diriyah.",
        timestamp: "17:40 AST",
        exif: "35mm · f/2.0 · ISO 160",
      },
      {
        id: "riyadh-3",
        image_url:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
        caption: "Late-night specialty pour-over inside KAFD's crystalline financial canyon.",
        timestamp: "22:05 AST",
        exif: "28mm · f/1.7 · ISO 640",
      },
      {
        id: "riyadh-4",
        image_url:
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=900&q=85",
        caption: "Standing at Jebel Fihrayn — Edge of the World escarpment horizon.",
        timestamp: "16:52 AST",
        exif: "50mm · f/2.8 · ISO 100",
      },
    ],
    essay_title: "Riyadh: Between Ancient Mud-Brick & Hyper-Vertical Glass",
    essay_blocks: [
      {
        id: "b1",
        type: "p",
        content:
          "Walking through Diriyah as dusk settles over Wadi Hanifah, the raw adobe mud-brick of At-Turaif holds the residual warmth of the desert sun. Twenty kilometers north, the faceted titanium-and-glass towers of KAFD rise out of the plateau with quiet algorithmic precision.",
      },
      {
        id: "b2",
        type: "quote",
        content:
          "Every city in rapid transition produces friction; in Riyadh, that friction is rendered in high-definition contrast between earth and steel.",
        author: "Field Note #04 · Diriyah Quarter",
      },
      {
        id: "b3",
        type: "photo_pair",
        images: [
          {
            url: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=80",
            caption: "Olaya Spine at Twilight",
            exif: "24mm · f/1.8",
          },
          {
            url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=900&q=80",
            caption: "Tuwaiq Escarpment Horizon",
            exif: "50mm · f/2.8",
          },
        ],
      },
    ],
  },
  {
    id: "jeddah-sa",
    slug: "jeddah",
    city_name: "Jeddah",
    country_name: "Saudi Arabia",
    country_code: "SA",
    flag: "🇸🇦",
    year: 2025,
    month: "Nov 2025",
    subtitle: "Red Sea Coral Stone & Al-Balad Roshan Balconies",
    lat: 21.4858,
    lng: 39.1925,
    cover_image_url:
      "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=900&q=85",
    instagram_highlight_url: "https://www.instagram.com/",
    is_published: true,
    story_slides: [
      {
        id: "jeddah-1",
        image_url:
          "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=900&q=85",
        caption: "Carved teakwood Roshan lattices catching the Red Sea breeze in Historic Al-Balad.",
        timestamp: "17:15 AST",
        exif: "35mm · f/2.0 · ISO 200",
      },
      {
        id: "jeddah-2",
        image_url:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
        caption: "Sunset walk along the Jeddah Corniche as King Fahd's Fountain lights up.",
        timestamp: "18:30 AST",
        exif: "24mm · f/2.2 · ISO 320",
      },
    ],
    essay_title: "Al-Balad: Coral Masonry & Centuries of Maritime Trade",
    essay_blocks: [
      {
        id: "jb1",
        type: "p",
        content:
          "Unlike the inland desert geometry of Riyadh, Jeddah breathes with the humidity and rhythm of the Red Sea. In Al-Balad, multi-story houses built from marine coral stone use intricate wooden Roshan mashrabiyas to channel coastal airflow naturally.",
      },
    ],
  },
  {
    id: "skardu-pk",
    slug: "skardu",
    city_name: "Skardu",
    country_name: "Pakistan",
    country_code: "PK",
    flag: "🇵🇰",
    year: 2025,
    month: "Aug 2025",
    subtitle: "High-Altitude Cold Desert & Karakoram Granite",
    lat: 35.2971,
    lng: 75.6333,
    cover_image_url:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=85",
    instagram_highlight_url: "https://www.instagram.com/",
    is_published: true,
    story_slides: [
      {
        id: "skardu-1",
        image_url:
          "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=85",
        caption: "Katpana Cold Desert dunes framed by snow-dusted Karakoram walls at 2,226m.",
        timestamp: "06:42 PKT",
        exif: "28mm · f/2.8 · ISO 100",
      },
      {
        id: "skardu-2",
        image_url:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=85",
        caption: "Turquoise glacial meltwater at Upper Kachura Lake.",
        timestamp: "13:18 PKT",
        exif: "24mm · f/4.0 · ISO 80",
      },
      {
        id: "skardu-3",
        image_url:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",
        caption: "Deosai Plains — crossing the second-highest alpine plateau on Earth.",
        timestamp: "16:05 PKT",
        exif: "50mm · f/2.4 · ISO 125",
      },
    ],
    essay_title: "Skardu & Deosai: Where Sand Dunes Meet 8,000-Meter Peaks",
    essay_blocks: [
      {
        id: "sb1",
        type: "p",
        content:
          "Landing in Skardu requires banking between sheer granite walls while the braided Indus River glints silver across the valley floor. Few places on Earth compress sand dunes, glacial lakes, and Karakoram spires into a single horizon.",
      },
      {
        id: "sb2",
        type: "quote",
        content:
          "At 4,100 meters on the Deosai plateau, silence isn't the absence of sound—it's a physical presence.",
        author: "Field Note #11 · Baltistan",
      },
    ],
  },
  {
    id: "hunza-pk",
    slug: "hunza",
    city_name: "Hunza Valley",
    country_name: "Pakistan",
    country_code: "PK",
    flag: "🇵🇰",
    year: 2025,
    month: "Aug 2025",
    subtitle: "Passu Cones, Attabad Lake & Karakoram Highway",
    lat: 36.3167,
    lng: 74.65,
    cover_image_url:
      "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=900&q=85",
    instagram_highlight_url: "https://www.instagram.com/",
    is_published: true,
    story_slides: [
      {
        id: "hunza-1",
        image_url:
          "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=900&q=85",
        caption: "Cathedral ridge of the Passu Cones at golden hour along the KKH.",
        timestamp: "18:12 PKT",
        exif: "35mm · f/2.8 · ISO 100",
      },
      {
        id: "hunza-2",
        image_url:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85",
        caption: "First light hitting Rakaposhi (7,788m) from Eagle's Nest.",
        timestamp: "05:38 PKT",
        exif: "70mm · f/4.0 · ISO 160",
      },
    ],
    essay_title: "Hunza: Serrated Ridges Along the Old Silk Route",
    essay_blocks: [
      {
        id: "hb1",
        type: "p",
        content:
          "Looking north from Karimabad toward Ultar Sar and the serrated teeth of Tupopdan (Passu Cones), the scale of the Karakoram recalibrates your sense of distance.",
      },
    ],
  },
  {
    id: "istanbul-tr",
    slug: "istanbul",
    city_name: "Istanbul",
    country_name: "Turkey",
    country_code: "TR",
    flag: "🇹🇷",
    year: 2024,
    month: "Oct 2024",
    subtitle: "Bosphorus Ferries, Byzantine Stone & Karaköy Espresso",
    lat: 41.0082,
    lng: 28.9784,
    cover_image_url:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=85",
    instagram_highlight_url: "https://www.instagram.com/",
    is_published: true,
    story_slides: [
      {
        id: "ist-1",
        image_url:
          "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=85",
        caption: "Crossing from Eminönü to Kadıköy on the evening vapur with simit and çay.",
        timestamp: "18:04 TRT",
        exif: "35mm · f/1.8 · ISO 250",
      },
      {
        id: "ist-2",
        image_url:
          "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=900&q=85",
        caption: "Blue hour over Galata Tower and the Golden Horn.",
        timestamp: "19:22 TRT",
        exif: "24mm · f/2.0 · ISO 500",
      },
    ],
    essay_title: "Istanbul: Two Continents Connected by Ferry Wakes",
    essay_blocks: [
      {
        id: "ib1",
        type: "p",
        content:
          "Istanbul is best understood from the deck of a commuter ferry cutting across the Bosphorus at sunset, watching domes and minarets silhouette against a copper sky.",
      },
    ],
  },
  {
    id: "dubai-ae",
    slug: "dubai",
    city_name: "Dubai",
    country_name: "United Arab Emirates",
    country_code: "AE",
    flag: "🇦🇪",
    year: 2024,
    month: "Dec 2024",
    subtitle: "DIFC Logistics Hubs, Alserkal Avenue & Creek Abra Crossings",
    lat: 25.2048,
    lng: 55.2708,
    cover_image_url:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
    instagram_highlight_url: "https://www.instagram.com/",
    is_published: true,
    story_slides: [
      {
        id: "dxb-1",
        image_url:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
        caption: "Downtown skyline viewed from Dubai Design District after rain.",
        timestamp: "21:10 GST",
        exif: "24mm · f/1.8 · ISO 400",
      },
    ],
    essay_title: "Dubai: From Wooden Creek Abras to Global Supply Chain Nodes",
    essay_blocks: [
      {
        id: "db1",
        type: "p",
        content:
          "Between the industrial warehouses of Alserkal Avenue and the wooden abras still ferrying traders across Dubai Creek for one dirham, the city operates like a high-throughput logistics router.",
      },
    ],
  },
];

const STORAGE_KEY = "essa_portfolio_travel_highlights_v2";

export function normalizeTravelRow(row: any): TravelCityHighlight {
  const cityName = row.city_name || row.city || "Untitled City";
  const countryName = row.country || row.country_name || "Country";
  const visitedAt = row.visited_at || row.month || String(row.year || 2025);
  const coverUrl = row.cover_url || row.cover_image_url || "";
  const instagramUrl =
    row.instagram_url || row.instagram_highlight_url || "https://www.instagram.com/";
  const rawBlocks = Array.isArray(row.essay_blocks) ? row.essay_blocks : [];

  return {
    id: row.id || row.slug || "city-id",
    slug: row.slug || row.id || "city",
    city_name: cityName,
    city: cityName,
    country_name: countryName,
    country: countryName,
    country_code: row.country_code || countryName.slice(0, 2).toUpperCase(),
    flag: row.flag || "🌍",
    year: Number(row.year || 2025),
    month: visitedAt,
    visited_at: visitedAt,
    subtitle: row.subtitle || "",
    lat: Number(row.lat ?? 24.7136),
    lng: Number(row.lng ?? 46.6753),
    cover_image_url: coverUrl,
    cover_url: coverUrl,
    instagram_highlight_url: instagramUrl,
    instagram_url: instagramUrl,
    is_published: row.is_published !== undefined ? Boolean(row.is_published) : true,
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
  if (typeof window === "undefined") {
    return DEFAULT_TRAVEL_HIGHLIGHTS.map(normalizeTravelRow);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_TRAVEL_HIGHLIGHTS.map(normalizeTravelRow);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeTravelRow);
    }
  } catch {
    // ignore
  }
  return DEFAULT_TRAVEL_HIGHLIGHTS.map(normalizeTravelRow);
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

