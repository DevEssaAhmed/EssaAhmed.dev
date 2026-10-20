import { NextResponse } from "next/server";
import { getStorage, isAuthorized } from "@/lib/titan-sender";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path : "";
    if (!path || path.includes("..") || path.startsWith("/") || path.includes("\\")) {
      return NextResponse.json({ error: "Invalid attachment reference." }, { status: 400 });
    }
    const { error } = await getStorage().remove([path]);
    if (error) {
      console.error("Titan sender cleanup error:", error.message);
      return NextResponse.json({ error: "Email run finished, but temporary attachment cleanup failed. Remove it from the storage bucket manually." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Cleanup failed. Remove the temporary object from Supabase Storage." }, { status: 500 });
  }
}
