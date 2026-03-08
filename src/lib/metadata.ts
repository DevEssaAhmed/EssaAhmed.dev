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
};

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
}: BuildPageMetadataInput): Metadata {
  const absoluteTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const resolvedImage = image || DEFAULT_IMAGE;

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
      images: resolvedImage ? [{ url: resolvedImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

