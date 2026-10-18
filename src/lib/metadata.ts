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
  const titleAlreadyIncludesBrand =
    title === SITE_NAME ||
    title.startsWith(`${SITE_NAME} —`) ||
    title.endsWith(` | ${SITE_NAME}`);
  const absoluteTitle = titleAlreadyIncludesBrand
    ? title
    : `${title} | ${SITE_NAME}`;
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
      images: [{ url: resolvedImage, alt: absoluteTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

