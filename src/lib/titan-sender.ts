import { createClient } from "@supabase/supabase-js";

export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
export const MAX_SENDS_PER_RUN = 10;

export function isAuthorized(request: Request) {
  const expected = process.env.EMAIL_SENDER_ACCESS_KEY;
  const supplied = request.headers.get("x-sender-key");
  return Boolean(expected && supplied && supplied.length === expected.length && supplied === expected);
}

export function getStorage() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase storage environment variables are not configured.");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage.from(process.env.EMAIL_ATTACHMENT_BUCKET || "titan-email-temp");
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
