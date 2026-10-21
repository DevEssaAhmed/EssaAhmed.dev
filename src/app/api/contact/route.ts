import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

export const runtime = "nodejs";

const contactPayloadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email is too long"),
  purpose: z.string().trim().min(1, "Please select a purpose").max(120),
  other_purpose: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(4000, "Message exceeds 4,000 characters"),
  honeypot: z.string().optional().nullable(),
});

// Simple in-memory rate limiter per IP: max 5 requests per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestHistory = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestHistory.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(ip, recent);
    return true;
  }

  recent.push(now);
  ipRequestHistory.set(ip, recent);

  // Periodic cleanup if map grows too large
  if (ipRequestHistory.size > 2000) {
    for (const [key, times] of ipRequestHistory.entries()) {
      const valid = times.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) {
        ipRequestHistory.delete(key);
      } else {
        ipRequestHistory.set(key, valid);
      }
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown-ip";

    if (ip !== "unknown-ip" && isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many contact submissions. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const parseResult = contactPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || "Invalid contact form submission.";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const { name, email, purpose, other_purpose, message, honeypot } = parseResult.data;

    // Honeypot check - reject spam bots silently
    if (honeypot && honeypot.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Message received." }, { status: 200 });
    }

    const resolvedPurpose = purpose === "other" ? (other_purpose?.trim() || "Other") : purpose;

    const supabase = getSupabaseServer();
    const { error: insertError } = await supabase.from("contacts").insert([
      {
        name,
        email,
        purpose: resolvedPurpose,
        message,
      },
    ]);

    if (insertError) {
      console.error("[api/contact] Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Could not save your message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("[api/contact] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
