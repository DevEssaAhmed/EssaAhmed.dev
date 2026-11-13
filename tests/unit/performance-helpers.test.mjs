import test from "node:test";
import assert from "node:assert/strict";

import { isOptimizableImageSrc } from "../../src/lib/image-optimization.ts";
import {
  getCleanProjectMarkdown,
  getProjectBodyMarkdown,
  getUniqueProjectImages,
} from "../../src/lib/project-markdown.ts";
import { markdownToBlocks } from "../../src/lib/blocknote-markdown.ts";
import {
  DEFAULT_PUBLIC_PROFILE,
  normalizePublicProfile,
} from "../../src/lib/profile-defaults.ts";

test("isOptimizableImageSrc excludes SVGs, data/blob/protocol-relative URLs, and unconfigured hosts", () => {
  assert.equal(isOptimizableImageSrc("/placeholder.svg"), false);
  assert.equal(isOptimizableImageSrc("/icons/logo.svg?v=2#icon"), false);
  assert.equal(isOptimizableImageSrc("  "), false);
  assert.equal(isOptimizableImageSrc("data:image/png;base64,AAAA"), false);
  assert.equal(isOptimizableImageSrc("blob:https://essaahmed.dev/123"), false);
  assert.equal(isOptimizableImageSrc("//cdn.example.com/a.jpg"), false);
  assert.equal(isOptimizableImageSrc("https://example.com/photo.jpg"), false);
  assert.equal(isOptimizableImageSrc("http://images.unsplash.com/photo-1"), false);
  assert.equal(
    isOptimizableImageSrc("https://xyz.supabase.co/other/path/photo.png"),
    false
  );

  assert.equal(isOptimizableImageSrc("/og-image.png"), true);
  assert.equal(isOptimizableImageSrc("/images/diagram.webp?w=800"), true);
  assert.equal(
    isOptimizableImageSrc(
      "https://xyz.supabase.co/storage/v1/object/public/images/cover.png"
    ),
    true
  );
  assert.equal(
    isOptimizableImageSrc("https://images.unsplash.com/photo-12345?auto=format"),
    true
  );
});

test("project-markdown helpers deduplicate gallery images by basename and strip duplicate leading visuals", () => {
  const project = {
    image_url: "https://cdn.example.com/a/hero-shot.png?v=1",
    additional_images: [
      "https://cdn.example.com/b/hero-shot.png?v=2",
      "/placeholder.svg",
      "https://cdn.example.com/b/architecture.png",
    ],
    description:
      "![Hero](https://other.example.com/hero-shot.png)\n\n## Overview\nPipeline details.",
  };

  const uniqueImages = getUniqueProjectImages(project);
  assert.deepEqual(uniqueImages, [
    "https://cdn.example.com/a/hero-shot.png?v=1",
    "https://cdn.example.com/b/architecture.png",
  ]);

  const cleaned = getCleanProjectMarkdown(project, uniqueImages);
  assert.equal(cleaned, "## Overview\nPipeline details.");

  const jsonbProject = {
    image_url: "https://cdn.example.com/a/hero-shot.png",
    description_jsonb: [
      { type: "image", props: { url: "https://cdn.example.com/hero-shot.png" } },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ text: "Architecture" }],
      },
      { type: "bulletListItem", content: [{ text: "Step one" }] },
    ],
  };

  const jsonbMarkdown = getProjectBodyMarkdown(jsonbProject, [
    "https://cdn.example.com/a/hero-shot.png",
  ]);
  assert.equal(jsonbMarkdown, "## Architecture\n\n- Step one");
});

test("markdownToBlocks parses headings, code blocks, lists, and custom video syntax cleanly", () => {
  const blocks = markdownToBlocks(
    "# Title\n\n- First item\n\n```ts\nconst x = 1;\n```\n\n!video[Demo](https://youtu.be/abc12345678)"
  );

  assert.equal(blocks[0]?.type, "heading");
  assert.equal(blocks[0]?.props?.level, 1);
  assert.equal(blocks[1]?.type, "bulletListItem");
  assert.equal(blocks[2]?.type, "codeBlock");
  assert.equal(blocks[2]?.props?.language, "ts");
  assert.equal(blocks[2]?.content, "const x = 1;");
  assert.equal(blocks[3]?.type, "video");
  assert.equal(blocks[3]?.props?.url, "https://youtu.be/abc12345678");
});

test("normalizePublicProfile upgrades legacy placeholder titles and invalid stats deterministically", () => {
  const normalized = normalizePublicProfile({
    name: "Essa Ahmed",
    title: "BI Analyst",
    stats: ["not-an-object"],
  });

  assert.equal(normalized.title, DEFAULT_PUBLIC_PROFILE.title);
  assert.deepEqual(normalized.stats, {});
  assert.equal(
    normalizePublicProfile(null).created_at,
    DEFAULT_PUBLIC_PROFILE.created_at
  );
});
