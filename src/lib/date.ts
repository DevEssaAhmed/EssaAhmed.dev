const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses an ISO timestamp or YYYY-MM-DD string safely, anchoring date-only
 * values to UTC midnight so server and client render the same calendar date.
 */
export function parseDateUTC(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = ISO_DATE_ONLY_PATTERN.test(trimmed)
    ? `${trimmed}T00:00:00Z`
    : trimmed;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a date using an explicit en-US locale and UTC timezone so SSR and
 * hydrated client markup never diverge across environments.
 */
export function formatDateUTC(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  fallback = ""
): string {
  const parsed = parseDateUTC(value);
  if (!parsed) return fallback;

  return parsed.toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
}

/**
 * Extracts a 4-digit year from an ISO date/timestamp string without shifting
 * calendar days in local timezones.
 */
export function extractIsoYear(value: string | Date | null | undefined): number | null {
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{4})/);
    if (match) return Number(match[1]);
  }

  const parsed = parseDateUTC(value);
  return parsed ? parsed.getUTCFullYear() : null;
}
