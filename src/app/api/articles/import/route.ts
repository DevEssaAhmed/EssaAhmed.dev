import { lookup } from "node:dns/promises";
import * as http from "node:http";
import * as https from "node:https";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 8_000;

class UnsafeTargetError extends Error {}

function isPublicIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => octet < 0 || octet > 255)) {
    return false;
  }

  const [a, b, c] = octets;
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  );
}

function parseIpv6Words(address: string): number[] | null {
  let normalized = address.toLowerCase().split("%")[0];

  if (normalized.includes(".")) {
    const lastColon = normalized.lastIndexOf(":");
    const ipv4 = normalized.slice(lastColon + 1);
    if (isIP(ipv4) !== 4) return null;
    const octets = ipv4.split(".").map(Number);
    const firstWord = ((octets[0] << 8) | octets[1]).toString(16);
    const secondWord = ((octets[2] << 8) | octets[3]).toString(16);
    normalized = `${normalized.slice(0, lastColon)}:${firstWord}:${secondWord}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) {
    return null;
  }

  const words = [...left, ...Array(Math.max(0, missing)).fill("0"), ...right];
  if (words.length !== 8 || words.some((word) => !/^[\da-f]{1,4}$/.test(word))) {
    return null;
  }

  return words.map((word) => Number.parseInt(word, 16));
}

function isPublicIpv6(address: string): boolean {
  const words = parseIpv6Words(address);
  if (!words) return false;

  // IPv4-mapped IPv6 addresses inherit the IPv4 address's reachability.
  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
    const mappedIpv4 = [
      words[6] >> 8,
      words[6] & 0xff,
      words[7] >> 8,
      words[7] & 0xff,
    ].join(".");
    return isPublicIpv4(mappedIpv4);
  }

  // Allow only global unicast (2000::/3), excluding special-use ranges.
  if ((words[0] & 0xe000) !== 0x2000) return false;
  if (words[0] === 0x2001 && words[1] <= 0x01ff) return false;
  if (words[0] === 0x2001 && words[1] === 0x0db8) return false;
  if (words[0] === 0x2002) return false;
  if (words[0] === 0x0064 && words[1] === 0xff9b) return false;
  if (words[0] === 0x3fff && words[1] <= 0x0fff) return false;
  return true;
}

function validateExternalUrl(url: URL): URL {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeTargetError("Only HTTP and HTTPS article URLs are allowed.");
  }
  if (url.username || url.password) {
    throw new UnsafeTargetError("URLs containing credentials are not allowed.");
  }

  const expectedPort = url.protocol === "https:" ? 443 : 80;
  if (url.port && Number(url.port) !== expectedPort) {
    throw new UnsafeTargetError("Custom URL ports are not allowed.");
  }

  return url;
}

async function resolvePublicAddress(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (!host || host === "localhost" || /\.(localhost|local|internal)$/.test(host)) {
    throw new UnsafeTargetError("Local and internal hosts are not allowed.");
  }

  const family = isIP(host);
  const addresses = family
    ? [{ address: host, family }]
    : await lookup(host, { all: true, verbatim: true });

  if (
    addresses.length === 0 ||
    addresses.some(({ address, family: addressFamily }) =>
      addressFamily === 4 ? !isPublicIpv4(address) : !isPublicIpv6(address)
    )
  ) {
    throw new UnsafeTargetError("The URL host must resolve only to public IP addresses.");
  }

  const first = addresses[0];
  return { address: first.address, family: first.family as 4 | 6 };
}

function requestWithPinnedAddress(url: URL, address: { address: string; family: 4 | 6 }) {
  const requestModule = url.protocol === "https:" ? https : http;
  const pinnedLookup = ((_hostname: string, options: any, callback: any) => {
    if (options && typeof options === "object" && options.all) {
      callback(null, [address]);
    } else {
      callback(null, address.address, address.family);
    }
  }) as any;

  return new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }>(
    (resolve, reject) => {
      let settled = false;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const rejectOnce = (error: Error) => {
        if (!settled) {
          settled = true;
          if (timeout) clearTimeout(timeout);
          reject(error);
        }
      };

      const request = requestModule.request(
        url,
        {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; EssaPortfolioBot/2.0; +https://essaahmed.dev)",
            Accept: "text/html,application/xhtml+xml",
            "Accept-Encoding": "identity",
            Connection: "close",
          },
          lookup: pinnedLookup,
        },
        (response) => {
          const statusCode = response.statusCode ?? 502;
          const contentLength = Number(response.headers["content-length"]);
          if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
            response.destroy();
            rejectOnce(new Error("The remote response exceeds the size limit."));
            return;
          }

          const chunks: Buffer[] = [];
          let bytes = 0;
          response.on("data", (chunk: Buffer | string) => {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            bytes += buffer.length;
            if (bytes > MAX_RESPONSE_BYTES) {
              response.destroy();
              rejectOnce(new Error("The remote response exceeds the size limit."));
              return;
            }
            chunks.push(buffer);
          });
          response.on("error", rejectOnce);
          response.on("end", () => {
            if (!settled) {
              settled = true;
              if (timeout) clearTimeout(timeout);
              resolve({
                statusCode,
                headers: response.headers,
                body: Buffer.concat(chunks).toString("utf8"),
              });
            }
          });
        }
      );

      timeout = setTimeout(() => {
        request.destroy(new Error("The remote request timed out."));
      }, REQUEST_TIMEOUT_MS);
      request.setTimeout(REQUEST_TIMEOUT_MS, () => {
        request.destroy(new Error("The remote request timed out."));
      });
      request.on("error", rejectOnce);
      request.end();
    }
  );
}

async function fetchExternalHtml(initialUrl: URL): Promise<string> {
  let currentUrl = validateExternalUrl(initialUrl);

  for (let redirects = 0; ; redirects += 1) {
    const address = await resolvePublicAddress(currentUrl.hostname);
    const response = await requestWithPinnedAddress(currentUrl, address);
    const location = response.headers.location;

    if ([301, 302, 303, 307, 308].includes(response.statusCode) && location) {
      if (redirects >= MAX_REDIRECTS) {
        throw new UnsafeTargetError("The URL redirected too many times.");
      }
      currentUrl = validateExternalUrl(new URL(location, currentUrl));
      continue;
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(`The remote site returned HTTP ${response.statusCode}.`);
    }

    const contentType = response.headers["content-type"];
    if (contentType && !/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error("The URL did not return an HTML document.");
    }

    return response.body;
  }
}

function extractMeta(html: string, patterns: RegExp[]): string {
  for (const regex of patterns) {
    const match = html.match(regex);
    if (match && match[1]) {
      return match[1]
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
    }
  }
  return "";
}

function detectPlatform(urlStr: string, siteName: string): string {
  const lower = urlStr.toLowerCase();
  if (lower.includes("medium.com")) return "Medium";
  if (lower.includes("dev.to")) return "dev.to";
  if (lower.includes("freecodecamp.org")) return "freeCodeCamp";
  if (lower.includes("substack.com")) return "Substack";
  if (lower.includes("hashnode.")) return "Hashnode";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (siteName) return siteName;
  try {
    const host = new URL(urlStr).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return "External";
  }
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i)?.[1];
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const { data: { user }, error: authError } = await getSupabaseServer().auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: "Your session is invalid or expired." }, { status: 401 });
    }
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const rawUrl =
      body && typeof body === "object" && "url" in body && typeof body.url === "string"
        ? body.url.trim()
        : "";
    if (!rawUrl || rawUrl.length > 2048) {
      return NextResponse.json({ error: "Please provide a valid article URL." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = validateExternalUrl(new URL(rawUrl));
    } catch (error) {
      if (error instanceof UnsafeTargetError || error instanceof TypeError) {
        return NextResponse.json({ error: error.message || "Invalid URL format." }, { status: 400 });
      }
      throw error;
    }

    let html: string;
    try {
      html = await fetchExternalHtml(parsedUrl);
    } catch (error) {
      if (error instanceof UnsafeTargetError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Could not fetch article metadata from that URL." },
        { status: 422 }
      );
    }

    const title =
      extractMeta(html, [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
        /<title[^>]*>([^<]+)<\/title>/i,
      ]) || "Imported External Article";

    const excerpt =
      extractMeta(html, [
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
      ]) || "";

    const image_url =
      extractMeta(html, [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      ]) || "";

    const siteName = extractMeta(html, [
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i,
    ]);

    const publishedTime = extractMeta(html, [
      /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']pubdate["'][^>]+content=["']([^"']+)["']/i,
    ]);

    const strippedText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = Math.max(200, Math.min(6000, strippedText.split(" ").length));
    const reading_time = Math.max(3, Math.min(25, Math.round(wordCount / 220)));

    const platform = detectPlatform(parsedUrl.toString(), siteName);
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 75) +
      "-" +
      Math.random().toString(36).slice(2, 6);

    return NextResponse.json({
      title,
      slug,
      excerpt: excerpt.slice(0, 320),
      image_url,
      external_url: parsedUrl.toString(),
      platform,
      is_external: true,
      reading_time,
      published_at: publishedTime || new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Article metadata import failed.", err);
    return NextResponse.json(
      { error: "Could not extract metadata from URL." },
      { status: 500 }
    );
  }
}
