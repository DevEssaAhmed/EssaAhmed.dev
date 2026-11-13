export function tryConvertJsonToMarkdown(content: string): string {
  if (!content) return "";
  try {
    const json = JSON.parse(content);
    if (!json || typeof json !== "object") return content;
    if (Array.isArray(json)) {
      return json
        .map((block: any) => {
          const text = Array.isArray(block.content)
            ? block.content.map((c: any) => c.text || "").join("")
            : typeof block.content === "string"
            ? block.content
            : "";
          switch (block.type) {
            case "heading":
              return `${"#".repeat(block.props?.level || 1)} ${text}`;
            case "bulletListItem":
              return `- ${text}`;
            case "numberedListItem":
              return `1. ${text}`;
            case "codeBlock":
              return `\`\`\`${block.props?.language || ""}\n${text}\n\`\`\``;
            case "image":
              return `![${block.props?.caption || ""}](${block.props?.url || ""})`;
            default:
              return text;
          }
        })
        .join("\n\n");
    }
    return content;
  } catch {
    return content;
  }
}

export const getImageBasename = (url?: string | null): string => {
  if (!url || typeof url !== "string") return "";
  return (
    url.split("?")[0].split("#")[0].split("/").pop()?.trim().toLowerCase() || ""
  );
};

export function getUniqueProjectImages(project: {
  image_url?: string | null;
  additional_images?: unknown;
} | null | undefined): string[] {
  const list: string[] = [];
  const seen = new Set<string>();

  const addImage = (rawUrl?: string | null) => {
    if (!rawUrl || typeof rawUrl !== "string") return;
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.includes("placeholder")) return;
    const basename = getImageBasename(trimmed) || trimmed;
    if (!seen.has(basename)) {
      seen.add(basename);
      list.push(trimmed);
    }
  };

  addImage(project?.image_url);
  if (Array.isArray(project?.additional_images)) {
    for (const img of project.additional_images) {
      addImage(typeof img === "string" ? img : null);
    }
  }
  return list;
}

export function getProjectBodyMarkdown(
  project: {
    description_jsonb?: unknown;
    description?: string | null;
  } | null | undefined,
  uniqueImages: string[] = []
): string {
  const longForm = project?.description_jsonb;
  if (Array.isArray(longForm) && longForm.length > 0) {
    let blocks = longForm;
    const firstBlock = blocks[0];
    if (firstBlock?.type === "image" && firstBlock?.props?.url) {
      const firstBasename = getImageBasename(firstBlock.props.url);
      const isDuplicate = uniqueImages.some(
        (img) => getImageBasename(img) === firstBasename
      );
      if (isDuplicate) {
        blocks = blocks.slice(1);
      }
    }
    return tryConvertJsonToMarkdown(JSON.stringify(blocks));
  }
  if (typeof longForm === "string" && longForm.trim()) {
    return tryConvertJsonToMarkdown(longForm);
  }
  return tryConvertJsonToMarkdown(project?.description || "");
}

export function getCleanProjectMarkdown(
  project: {
    image_url?: string | null;
    additional_images?: unknown;
    description_jsonb?: unknown;
    description?: string | null;
  } | null | undefined,
  uniqueImages: string[] = getUniqueProjectImages(project)
): string {
  let raw = getProjectBodyMarkdown(project, uniqueImages);
  if (!raw) return "";

  const leadingImageMatch = raw.match(
    /^\s*(?:!\[[^\]]*\]\(([^)]+)\)|<img[^>]+src=["']([^"']+)["'][^>]*>)\s*/i
  );
  if (leadingImageMatch) {
    const matchedUrl = leadingImageMatch[1] || leadingImageMatch[2];
    const matchedBasename = getImageBasename(matchedUrl);
    const isDuplicate = uniqueImages.some(
      (img) => getImageBasename(img) === matchedBasename
    );
    if (isDuplicate) {
      raw = raw.slice(leadingImageMatch[0].length);
    }
  }
  return raw.trim();
}
