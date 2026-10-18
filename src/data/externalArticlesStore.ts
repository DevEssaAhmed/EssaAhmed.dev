export type ArticlePlatform =
  | "On Site"
  | "Medium"
  | "dev.to"
  | "freeCodeCamp"
  | "Substack"
  | "Hashnode";

export interface ArticleExternalMeta {
  isExternal: boolean;
  externalUrl: string;
  platform: string;
  pillar: string;
}

export function extractArticleExternalMeta(post: any): ArticleExternalMeta {
  if (!post) {
    return {
      isExternal: false,
      externalUrl: "",
      platform: "On Site",
      pillar: "Analytics & Decision Systems",
    };
  }

  // Native columns on blog_posts (added in portfolio_v2_travel_external_articles_and_pillars migration)
  if (post.is_external && post.external_url) {
    return {
      isExternal: true,
      externalUrl: post.external_url,
      platform: post.platform || detectPlatformFromUrl(post.external_url),
      pillar: post.pillar || inferPillarFromPost(post),
    };
  }

  // Fallback: stored in blog_posts.video_type = "external:<Platform>|<Pillar>" and blog_posts.video_url = "<external_url>"
  if (typeof post.video_type === "string" && post.video_type.startsWith("external:")) {
    const rawMeta = post.video_type.slice("external:".length);
    const [platformPart, pillarPart] = rawMeta.split("|");
    const externalUrl = post.video_url || "";
    return {
      isExternal: Boolean(externalUrl),
      externalUrl,
      platform: platformPart || detectPlatformFromUrl(externalUrl),
      pillar: pillarPart || post.pillar || inferPillarFromPost(post),
    };
  }

  // Internal post with optional pillar stored in post.pillar or video_type = "internal|<Pillar>"
  if (typeof post.video_type === "string" && post.video_type.startsWith("internal|")) {
    const [, pillarPart] = post.video_type.split("|");
    return {
      isExternal: false,
      externalUrl: "",
      platform: "On Site",
      pillar: post.pillar || pillarPart || inferPillarFromPost(post),
    };
  }

  return {
    isExternal: false,
    externalUrl: "",
    platform: post.platform || "On Site",
    pillar: post.pillar || inferPillarFromPost(post),
  };
}

export function encodeArticleExternalMeta(meta: {
  isExternal: boolean;
  externalUrl: string;
  platform: string;
  pillar: string;
}): {
  is_external: boolean;
  external_url: string | null;
  platform: string;
  pillar: string;
} {
  const pillar = meta.pillar || "Analytics & Decision Systems";

  if (meta.isExternal && meta.externalUrl.trim()) {
    const platform =
      meta.platform && meta.platform !== "On Site"
        ? meta.platform
        : detectPlatformFromUrl(meta.externalUrl);
    return {
      is_external: true,
      external_url: meta.externalUrl.trim(),
      platform,
      pillar,
    };
  }

  return {
    is_external: false,
    external_url: null,
    platform: "On Site",
    pillar,
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

export function inferPillarFromPost(post: any): string {
  const text = `${post?.title || ""} ${post?.excerpt || ""} ${(post?.tags || []).join(" ")}`.toLowerCase();
  if (
    text.includes("s&op") ||
    text.includes("supply chain") ||
    text.includes("demand") ||
    text.includes("inventory") ||
    text.includes("vendor") ||
    text.includes("procurement")
  ) {
    return "Supply Chain & Demand Planning";
  }
  if (
    text.includes("automat") ||
    text.includes("pipeline") ||
    text.includes("etl") ||
    text.includes("airflow") ||
    text.includes("workflow") ||
    text.includes("webhook")
  ) {
    return "Workflow Automation";
  }
  return "Analytics & Decision Systems";
}
