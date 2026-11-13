import type { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";

export type BlockNoteContent = Block[];

function parseInlineContent(text: string): any[] {
  if (!text) return [];

  const result: any[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Match bold **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)([^*_]+)\1/);
    if (boldMatch) {
      result.push({ type: "text", text: boldMatch[2], styles: { bold: true } });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Match italic *text* or _text_ (single)
    const italicMatch = remaining.match(/^(\*|_)([^*_]+)\1/);
    if (italicMatch) {
      result.push({ type: "text", text: italicMatch[2], styles: { italic: true } });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Match inline code `text`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      result.push({ type: "text", text: codeMatch[1], styles: { code: true } });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Match links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      result.push({
        type: "link",
        content: [{ type: "text", text: linkMatch[1], styles: {} }],
        href: linkMatch[2],
      });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Find next special character
    const nextSpecial = remaining.search(/(\*\*|__|[*_`]|\[)/);
    if (nextSpecial === -1) {
      if (remaining) result.push({ type: "text", text: remaining, styles: {} });
      break;
    } else if (nextSpecial === 0) {
      result.push({ type: "text", text: remaining[0], styles: {} });
      remaining = remaining.slice(1);
    } else {
      result.push({
        type: "text",
        text: remaining.slice(0, nextSpecial),
        styles: {},
      });
      remaining = remaining.slice(nextSpecial);
    }
  }

  return result.length > 0 ? result : [{ type: "text", text, styles: {} }];
}

// Convert markdown to blocks with proper inline formatting
export function markdownToBlocks(markdown: string): PartialBlock[] {
  if (!markdown || !markdown.trim()) {
    return [{ type: "paragraph", content: "" }];
  }

  const lines = markdown.split("\n");
  const blocks: PartialBlock[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({
          type: "codeBlock",
          props: { language: codeLanguage || "plaintext" },
          content: codeContent.join("\n"),
        });
        codeContent = [];
        codeLanguage = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Handle headings
    if (line.startsWith("### ")) {
      blocks.push({
        type: "heading",
        props: { level: 3 },
        content: parseInlineContent(line.slice(4)),
      });
    } else if (line.startsWith("## ")) {
      blocks.push({
        type: "heading",
        props: { level: 2 },
        content: parseInlineContent(line.slice(3)),
      });
    } else if (line.startsWith("# ")) {
      blocks.push({
        type: "heading",
        props: { level: 1 },
        content: parseInlineContent(line.slice(2)),
      });
    }
    // Handle bullet lists
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      blocks.push({
        type: "bulletListItem",
        content: parseInlineContent(line.slice(2)),
      });
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line)) {
      blocks.push({
        type: "numberedListItem",
        content: parseInlineContent(line.replace(/^\d+\.\s/, "")),
      });
    }
    // Handle blockquotes — rendered as a proper quote paragraph with styling
    else if (line.startsWith("> ")) {
      blocks.push({
        type: "paragraph",
        props: { textColor: "gray", backgroundColor: "gray" },
        content: parseInlineContent(line.slice(2)),
      });
    }
    // Handle images
    else if (line.match(/^!\[.*?\]\((.+?)\)$/)) {
      const match = line.match(/^!\[.*?\]\((.+?)\)$/);
      if (match) {
        blocks.push({ type: "image", props: { url: match[1] } });
      }
    }
    // Handle videos (custom syntax !video[...](...))
    else if (line.match(/^!video\[.*?\]\((.+?)\)$/)) {
      const match = line.match(/^!video\[.*?\]\((.+?)\)$/);
      if (match) {
        blocks.push({ type: "video", props: { url: match[1] } });
      }
    }
    // Handle horizontal rules — render as an empty paragraph (BlockNote has no HR)
    else if (line === "---" || line === "***") {
      blocks.push({ type: "paragraph", content: "" });
    }
    // Handle paragraphs with inline formatting
    else if (line.trim()) {
      blocks.push({
        type: "paragraph",
        content: parseInlineContent(line),
      });
    }
  }

  return blocks.length > 0 ? blocks : [{ type: "paragraph", content: "" }];
}

// Convert blocks to markdown
export async function blocksToMarkdown(editor: BlockNoteEditor): Promise<string> {
  try {
    let markdown = "";
    const blocks = editor.document;

    for (const block of blocks) {
      if (block.type === "video") {
        const url = (block.props as { url?: string }).url || "";
        if (url) {
          markdown += `\n!video[${url}](${url})\n\n`;
        }
      } else {
        const blockMd = await editor.blocksToMarkdownLossy([block]);
        markdown += blockMd + "\n";
      }
    }

    return markdown.trim();
  } catch (error) {
    console.error("Error converting to markdown:", error);
    return "";
  }
}
