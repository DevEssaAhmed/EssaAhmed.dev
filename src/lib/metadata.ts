import type { Metadata } from "next";

const SITE_NAME = "Essa Ahmed";
const SITE_DESCRIPTION =
  "Design-forward portfolio, writing, and analytics-driven work.";
const DEFAULT_IMAGE = "/og-image.png";

type BuildPageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  badge?: string;
};

export function buildDynamicOgUrl(params: {
  title: string;
  subtitle?: string;
  badge?: string;
}): string {
  const qs = new URLSearchParams();
  qs.set("title", params.title);
  if (params.subtitle) qs.set("subtitle", params.subtitle);
  if (params.badge) qs.set("badge", params.badge);
  return `/api/og?${qs.toString()}`;
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    path,
    image,
    type = "website",
    badge,
  } = input;
  const absoluteTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const isCustomImage =
    typeof image === "string" &&
    image.trim().length > 0 &&
    !image.includes("placeholder.svg");
  const resolvedImage = isCustomImage
    ? image
    : path === "/"
      ? DEFAULT_IMAGE
      : buildDynamicOgUrl({
          title,
          subtitle: description,
          badge: badge || (type === "article" ? "Article" : "Portfolio"),
        });

  return {
    title: absoluteTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: absoluteTitle,
      description,
      url: canonical,
      type,
      images: resolvedImage ? [{ url: resolvedImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

