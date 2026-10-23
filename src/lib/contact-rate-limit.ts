import { isIP } from "node:net";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_IDENTIFIERS = 2_048;
const requestHistory = new Map<string, number[]>();

function getClientIp(request: Request): string | null {
  // Use only a single address supplied by the hosting proxy. Do not parse an
  // X-Forwarded-For chain, whose leftmost value may be provided by the caller.
  const value = request.headers.get("x-real-ip")?.trim();
  if (!value || value.includes(",") || isIP(value) === 0) return null;
  return value;
}

function pruneExpiredEntries(now: number) {
  for (const [ip, timestamps] of requestHistory) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) requestHistory.delete(ip);
    else requestHistory.set(ip, recent);
  }
}

export function isContactRateLimited(request: Request): boolean {
  const now = Date.now();
  // If the proxy omits x-real-ip, share one conservative bucket instead of
  // trusting a caller-controlled forwarded-address header or skipping limits.
  const identifier = getClientIp(request) ?? "unknown-client";
  const recent = (requestHistory.get(identifier) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestHistory.set(identifier, recent);
    return true;
  }

  if (!requestHistory.has(identifier) && requestHistory.size >= MAX_IDENTIFIERS) {
    pruneExpiredEntries(now);

    // Keep the process-local fallback bounded. New addresses are temporarily
    // rejected when every slot is occupied by a still-active window.
    if (requestHistory.size >= MAX_IDENTIFIERS) return true;
  }

  recent.push(now);
  requestHistory.set(identifier, recent);
  return false;
}
