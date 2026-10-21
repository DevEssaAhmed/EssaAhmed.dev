export type ArticlePlatform =
  | "Medium"
  | "dev.to"
  | "freeCodeCamp"
  | "Substack"
  | "Hashnode"
  | "LinkedIn"
  | "External";

export interface ArticleExternalMeta {
  isExternal: boolean;
  externalUrl: string;
  platform: string | null;
  pillar?: string | null;
}

export function extractArticleExternalMeta(post: any): ArticleExternalMeta {
  if (!post) {
    return {
      isExternal: false,
      externalUrl: "",
      platform: null,
      pillar: null,
    };
  }

  // Native columns on blog_posts
  if (post.is_external && post.external_url) {
    const rawPlat = post.platform && post.platform !== "On Site" ? post.platform : null;
    return {
      isExternal: true,
      externalUrl: post.external_url,
      platform: rawPlat || detectPlatformFromUrl(post.external_url),
      pillar: null,
    };
  }

  // Fallback: stored in blog_posts.video_type = "external:<Platform>" and blog_posts.video_url = "<external_url>"
  if (typeof post.video_type === "string" && post.video_type.startsWith("external:")) {
    const rawMeta = post.video_type.slice("external:".length);
    const [platformPart] = rawMeta.split("|");
    const externalUrl = post.video_url || "";
    const cleanPlat = platformPart && platformPart !== "On Site" ? platformPart : null;
    return {
      isExternal: Boolean(externalUrl),
      externalUrl,
      platform: cleanPlat || detectPlatformFromUrl(externalUrl),
      pillar: null,
    };
  }

  // Internal post: no platform badge, no pillar
  return {
    isExternal: false,
    externalUrl: "",
    platform: null,
    pillar: null,
  };
}

export function encodeArticleExternalMeta(meta: {
  isExternal: boolean;
  externalUrl?: string | null;
  platform?: string | null;
  pillar?: string | null;
}): {
  is_external: boolean;
  external_url: string | null;
  platform: string | null;
  pillar: string | null;
} {
  if (meta.isExternal && meta.externalUrl?.trim()) {
    const cleanPlat =
      meta.platform && meta.platform !== "On Site"
        ? meta.platform
        : detectPlatformFromUrl(meta.externalUrl);
    return {
      is_external: true,
      external_url: meta.externalUrl.trim(),
      platform: cleanPlat,
      pillar: null,
    };
  }

  return {
    is_external: false,
    external_url: null,
    platform: null,
    pillar: null,
  };
}

export function detectPlatformFromUrl(urlStr: string): string {
  const lower = (urlStr || "").toLowerCase();
  if (lower.includes("medium.com")) return "Medium";
  if (lower.includes("dev.to")) return "dev.to";
  if (lower.includes("freecodecamp.org")) return "freeCodeCamp";
  if (lower.includes("substack.com")) return "Substack";
  if (lower.includes("hashnode.")) return "Hashnode";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "");
  } catch {
    return "External";
  }
}

// Deprecated: articles do not have domain pillars
export function inferPillarFromPost(_post: any): string | null {
  return null;
}
