import type { TravelCityHighlight } from "@/data/travelData";

export function isPublicTravelHighlight(value: unknown): value is TravelCityHighlight {
  if (typeof value !== "object" || value === null) return false;

  const row = value as Record<string, unknown>;
  const cityName = text(row.city_name) || text(row.city);
  const countryName = text(row.country_name) || text(row.country);
  const latitude = Number(row.lat);
  const longitude = Number(row.lng);
  const slides = Array.isArray(row.story_slides) ? row.story_slides : [];
  const hasCoverImage = Boolean(text(row.cover_image_url) || text(row.cover_url));
  const hasStoryImage = slides.some(
    (slide) =>
      typeof slide === "object" &&
      slide !== null &&
      "image_url" in slide &&
      typeof slide.image_url === "string" &&
      slide.image_url.trim().length > 0
  );

  return (
    row.is_published === true &&
    cityName.length > 0 &&
    countryName.length > 0 &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0) &&
    (hasCoverImage || hasStoryImage)
  );
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
