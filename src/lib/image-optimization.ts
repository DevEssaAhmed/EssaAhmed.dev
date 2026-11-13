/**
 * Determines whether an image URL should go through Next.js Image Optimization
 * (`/_next/image`) based on `next.config.mjs` `images.remotePatterns` and safe
 * file-type rules (excluding SVGs, data URLs, and unconfigured hosts).
 */
export function isOptimizableImageSrc(rawSrc: string): boolean {
  const src = rawSrc.trim();
  if (!src) return false;

  if (
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("//")
  ) {
    return false;
  }

  if (src.startsWith("/")) {
    const pathname = src.split(/[?#]/, 1)[0].toLowerCase();
    return !pathname.endsWith(".svg");
  }

  try {
    const parsed = new URL(src);
    if (parsed.protocol !== "https:") return false;
    if (parsed.pathname.toLowerCase().endsWith(".svg")) return false;

    const host = parsed.hostname.toLowerCase();
    if (
      (host === "supabase.co" || host.endsWith(".supabase.co")) &&
      parsed.pathname.startsWith("/storage/")
    ) {
      return true;
    }

    if (host === "images.unsplash.com") {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
