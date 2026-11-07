export type SafeVideoEmbed = {
  type: "youtube" | "vimeo" | "video";
  src: string;
};

export function parseSafeVideoUrl(
  rawUrl: string
): { type: "youtube" | "vimeo" | "video"; src: string } | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase();

    // YouTube: youtube.com, www.youtube.com, m.youtube.com, youtu.be
    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtu.be"
    ) {
      let id: string | null = null;
      if (hostname === "youtu.be") {
        const parts = parsed.pathname.split("/").filter(Boolean);
        id = parts[0] || null;
      } else {
        const v = parsed.searchParams.get("v");
        if (v) {
          id = v;
        } else {
          const parts = parsed.pathname.split("/").filter(Boolean);
          if (parts[0] === "embed" || parts[0] === "v" || parts[0] === "shorts") {
            id = parts[1] || null;
          }
        }
      }

      if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
        return {
          type: "youtube",
          src: `https://www.youtube.com/embed/${id}`,
        };
      }

      return null;
    }

    // Vimeo: vimeo.com, www.vimeo.com, player.vimeo.com
    if (
      hostname === "vimeo.com" ||
      hostname === "www.vimeo.com" ||
      hostname === "player.vimeo.com"
    ) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const candidate = parts[parts.length - 1];
      if (candidate && /^\d+$/.test(candidate)) {
        return {
          type: "vimeo",
          src: `https://player.vimeo.com/video/${candidate}`,
        };
      }

      return null;
    }

    // Otherwise if protocol === "https:", return generic video
    if (parsed.protocol === "https:") {
      return {
        type: "video",
        src: parsed.toString(),
      };
    }

    return null;
  } catch {
    return null;
  }
}
