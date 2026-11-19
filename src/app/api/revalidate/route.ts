import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const DEFAULT_REVALIDATE_PATHS = [
  "/",
  "/about",
  "/articles",
  "/articles/categories",
  "/articles/series",
  "/articles/tags",
  "/projects",
  "/diary",
  "/travel",
  "/sitemap.xml",
  "/rss.xml",
];

const DEFAULT_REVALIDATE_TAGS = ["site-shell"];

function isSafePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    value.length <= 256 &&
    !value.includes("..")
  );
}

function isSafeTag(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-z0-9:_-]{1,64}$/i.test(value)
  );
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = (req.headers.get("authorization") ?? "").match(
      /^Bearer\s+(.+)$/i
    )?.[1];
    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication is required." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await getSupabaseServer().auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Your session is invalid or expired." },
        { status: 401 }
      );
    }

    let body: { paths?: unknown; tags?: unknown } = {};
    try {
      const parsed = await req.json();
      if (parsed && typeof parsed === "object") {
        body = parsed as { paths?: unknown; tags?: unknown };
      }
    } catch {
      // Empty body is valid — falls back to default full-site revalidation
    }

    const requestedPaths = Array.isArray(body.paths)
      ? body.paths.filter(isSafePath)
      : [];
    const requestedTags = Array.isArray(body.tags)
      ? body.tags.filter(isSafeTag)
      : [];

    const paths = Array.from(
      new Set(
        requestedPaths.length > 0
          ? [...requestedPaths, "/sitemap.xml"]
          : DEFAULT_REVALIDATE_PATHS
      )
    );
    const tags = Array.from(
      new Set(
        requestedTags.length > 0 ? requestedTags : DEFAULT_REVALIDATE_TAGS
      )
    );

    for (const tag of tags) {
      revalidateTag(tag);
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      tags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/revalidate] Failed to revalidate cache:", error);
    return NextResponse.json(
      { error: "Failed to revalidate cached routes." },
      { status: 500 }
    );
  }
}
