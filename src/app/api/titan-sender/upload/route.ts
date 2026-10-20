import { NextResponse } from "next/server";
import { getStorage, isAuthorized, MAX_ATTACHMENT_BYTES } from "@/lib/titan-sender";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized. Check your sender access key." }, { status: 401 });

  try {
    const body = await request.json();
    const fileName = typeof body.fileName === "string" ? body.fileName.slice(0, 180) : "";
    const contentType = typeof body.contentType === "string" ? body.contentType.slice(0, 120) : "application/octet-stream";
    const size = Number(body.size);

    if (!fileName || !Number.isFinite(size) || size <= 0 || size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json({ error: "Choose a file larger than 0 bytes and no larger than 15 MiB." }, { status: 400 });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${crypto.randomUUID()}-${safeName}`;
    const storage = getStorage();
    const { data, error } = await storage.createSignedUploadUrl(path, { upsert: false });
    if (error || !data?.signedUrl || !data?.token) {
      console.error("Titan sender upload URL error:", error?.message);
      return NextResponse.json({ error: "Could not prepare secure attachment upload. Check the private Supabase bucket configuration." }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path, contentType });
  } catch (error) {
    console.error("Titan sender upload setup error:", error);
    return NextResponse.json({ error: "Upload setup failed. Check server environment variables." }, { status: 500 });
  }
}
