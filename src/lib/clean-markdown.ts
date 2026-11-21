const ACRONYM_OR_BRAND_MAP: Record<string, string> = {
  bi: "BI",
  "power bi": "Power BI",
  "power-bi": "Power BI",
  powerbi: "Power BI",
  dax: "DAX",
  etl: "ETL",
  sql: "SQL",
  kpi: "KPI",
  erp: "ERP",
  "s&op": "S&OP",
  sop: "S&OP",
  otif: "OTIF",
  api: "API",
  ai: "AI",
  ml: "ML",
  dbt: "dbt",
  n8n: "n8n",
  "next.js": "Next.js",
  nextjs: "Next.js",
  fastapi: "FastAPI",
  postgresql: "PostgreSQL",
  "data-analytics": "Data Analytics",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strips raw Markdown syntax (images, links, headings, emojis, bold/italic markers, dividers)
 * and optional redundant title/overview preambles so project descriptions read cleanly in cards.
 */
export function cleanMarkdownExcerpt(
  markdown: string | null | undefined,
  maxLength = 220,
  titleToStrip?: string
): string {
  if (!markdown) return "";

  let cleaned = markdown
    // Remove markdown images: ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    // Replace markdown links [label](url) with label
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Remove bare URLs
    .replace(/https?:\/\/[^\s)]+/g, "")
    // Remove horizontal rules (---, ***, ___)
    .replace(/^\s*([-*_]){3,}\s*$/gm, "")
    // Remove emojis/pictographs and variation selectors/ZWJ
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
    // Remove leading H1 title line (cards already render the title)
    .replace(/^\s*#\s+[^\n]+(?:\n+|$)/, "")
    // Remove standalone generic section heading lines (with optional hashes, bold/italic, or colon)
    .replace(
      /^\s*(?:#{1,6}\s*)?(?:[*_]{1,3})?\s*(?:Project\s+Overview|Overview|Background|Project\s+Objective|Executive\s+Summary|The\s+Challenge|The\s+Solution|Problem\s+Statement|Introduction)\s*:?\s*(?:[*_]{1,3})?\s*$/gim,
      ""
    )
    // Remove remaining markdown heading hashes
    .replace(/^#{1,6}\s*/gm, "")
    // Remove blockquote markers and list bullets
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    // Remove bold/italic markers
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove leading "Project: ... Overview" boilerplate
    .replace(/^Project:\s*[^\n]+\n+/i, "")
    // Collapse whitespace and newlines into single spaces
    .replace(/\s+/g, " ")
    .trim();

  if (titleToStrip) {
    const normalizedTitle = titleToStrip
      .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

    if (normalizedTitle) {
      const titlePattern = new RegExp(
        `^${escapeRegExp(normalizedTitle)}(?:\\s*[:\\-–—]\\s*|\\s+|$)`,
        "i"
      );
      cleaned = cleaned.replace(titlePattern, "").trim();
    }
  }

  // Strip any remaining inline generic preamble such as "Project Overview ..."
  cleaned = cleaned
    .replace(
      /^(?:Project\s+Overview|Overview|Executive\s+Summary|Background|Project\s+Objective)\s*[:\-–—]?\s+/i,
      ""
    )
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}

/**
 * Normalizes project tag casing and acronyms for consistent card badge rendering.
 */
export function formatDisplayTag(tag: string): string {
  const trimmed = String(tag ?? "").trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (ACRONYM_OR_BRAND_MAP[lower]) {
    return ACRONYM_OR_BRAND_MAP[lower];
  }

  if (trimmed.includes("-") || trimmed === lower) {
    return trimmed
      .replace(/-/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => {
        const wordLower = word.toLowerCase();
        if (ACRONYM_OR_BRAND_MAP[wordLower]) {
          return ACRONYM_OR_BRAND_MAP[wordLower];
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  return trimmed;
}
