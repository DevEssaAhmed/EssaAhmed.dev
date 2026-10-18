/**
 * Strips raw Markdown syntax (images, links, headings, bold/italic markers, dividers)
 * so markdown-formatted project descriptions render as clean, readable plain text in card previews.
 */
export function cleanMarkdownExcerpt(markdown: string | null | undefined, maxLength = 220): string {
  if (!markdown) return "";

  const cleaned = markdown
    // Remove markdown images: ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    // Replace markdown links [label](url) with label
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Remove bare URLs
    .replace(/https?:\/\/[^\s)]+/g, "")
    // Remove horizontal rules (---, ***, ___)
    .replace(/^\s*([-*_]){3,}\s*$/gm, "")
    // Remove generic section headers like "Project Overview", "Overview", "Background"
    .replace(/^#{1,6}\s*(?:[^\w\s]\s*)?(?:Project Overview|Overview|Background|Project Objective|The Challenge|The Solution)\s*$/gim, "")
    // Remove remaining markdown heading hashes
    .replace(/^#{1,6}\s*/gm, "")
    // Remove bold/italic markers
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove leading "Project: ... Overview" boilerplate
    .replace(/^Project:\s*[^\n]+\n+/i, "")
    .replace(/^Overview\s+/i, "")
    // Collapse whitespace and newlines into single spaces
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}
