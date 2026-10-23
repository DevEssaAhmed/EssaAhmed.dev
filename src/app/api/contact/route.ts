import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isContactRateLimited } from "@/lib/contact-rate-limit";
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

export async function POST(req: NextRequest) {
  try {
    if (isContactRateLimited(req)) {
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

    const supabase = getSupabaseAdmin();
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
