const ALLOWED_CAMPAIGN_PARAMETERS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
];

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

/**
 * Return a path plus approved campaign parameters only.
 * Arbitrary query parameters (which may include emails, tokens, or other
 * personal information) are deliberately excluded from analytics events.
 */
export function sanitizeAnalyticsUrl(pathname, search = "") {
  const candidatePath =
    typeof pathname === "string" ? pathname.split(/[?#]/, 1)[0] : "";
  const safePath =
    candidatePath.startsWith("/") &&
    !candidatePath.startsWith("//") &&
    !CONTROL_CHARACTERS.test(candidatePath)
      ? candidatePath
      : "/";

  const rawSearch =
    typeof search === "string" ? search.replace(/^\?/, "") : "";
  const inputParameters = new URLSearchParams(rawSearch);
  const safeParameters = new URLSearchParams();

  for (const name of ALLOWED_CAMPAIGN_PARAMETERS) {
    const value = inputParameters.get(name)?.trim();
    if (!value) continue;

    const cleanedValue = value.replace(CONTROL_CHARACTERS, "").slice(0, 100);
    if (cleanedValue) safeParameters.set(name, cleanedValue);
  }

  const query = safeParameters.toString();
  return query ? `${safePath}?${query}` : safePath;
}
