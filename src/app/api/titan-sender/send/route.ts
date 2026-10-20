import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getRequiredEnv, getStorage, isAuthorized, MAX_ATTACHMENT_BYTES } from "@/lib/titan-sender";

export const runtime = "nodejs";
export const maxDuration = 30;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized. Check your sender access key." }, { status: 401 });

  try {
    const body = await request.json();
    const to = typeof body.to === "string" ? body.to.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
    const text = typeof body.text === "string" ? body.text.slice(0, 20000) : "";
    const attachmentPath = typeof body.attachmentPath === "string" ? body.attachmentPath : "";

    if (!emailPattern.test(to)) return NextResponse.json({ error: "Enter a valid recipient email address." }, { status: 400 });
    if (!subject) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    if (attachmentPath && (attachmentPath.includes("..") || attachmentPath.startsWith("/") || attachmentPath.includes("\\"))) {
      return NextResponse.json({ error: "Invalid attachment reference." }, { status: 400 });
    }

    let attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];
    if (attachmentPath) {
      const storage = getStorage();
      const { data, error } = await storage.download(attachmentPath);
      if (error || !data) return NextResponse.json({ error: "Attachment not found. Upload it again and retry." }, { status: 400 });
      if (data.size > MAX_ATTACHMENT_BYTES) return NextResponse.json({ error: "Attachment exceeds 15 MiB." }, { status: 413 });
      const filename = attachmentPath.split("/").pop()?.replace(/^[0-9a-f-]{36}-/i, "") || "attachment";
      attachments = [{ filename, content: Buffer.from(await data.arrayBuffer()), contentType: data.type || "application/octet-stream" }];
    }

    const host = process.env.TITAN_SMTP_HOST || "smtp.titan.email";
    const port = Number(process.env.TITAN_SMTP_PORT || "465");
    const secure = port === 465;
    const user = getRequiredEnv("TITAN_EMAIL_USER");
    const pass = getRequiredEnv("TITAN_EMAIL_PASSWORD");
    const from = process.env.TITAN_EMAIL_FROM || user;

    const transporter = nodemailer.createTransport({
      host, port, secure,
      auth: { user, pass },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 20000,
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      attachments,
    });
    await transporter.close();

    return NextResponse.json({
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (error) {
    console.error("Titan sender failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: error instanceof Error ? error.message.slice(0, 300) : "Email sending failed. Check SMTP settings." }, { status: 500 });
  }
}
