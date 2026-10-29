import preview from "@storybook/preview";

import TiptapLibPreview from "../../components/blocks/TiptapLibPreview/TiptapLibPreview.astro";
import type { TiptapDocNode } from "../../types";
import { parseTiptapContent } from "./parser";

const sampleDocInput: TiptapDocNode = {
  type: "doc",
  content: [
    {
      type: "tableOfContents",
      attrs: { title: "Generated Table of Contents" },
    },
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Unified Parser Overview" }],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Automatic Anchor Slugs & TOC" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "parseTiptapContent auto-detects JSON, HTML, Markdown, and string[].",
        },
      ],
    },
  ],
};

const parsedWithAutoToc = parseTiptapContent(sampleDocInput);

const legacyArrayInput = [
  "First legacy string item automatically wrapped in a paragraph node.",
  "Second legacy string item normalized by parseTiptapContent.",
];
const parsedLegacyArray = parseTiptapContent(legacyArrayInput);

const meta = preview.meta({
  title: "Lib/parser",
  component: TiptapLibPreview,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    title: "parseTiptapContent(doc)",
    subtitle: "Auto-assigns deterministic heading IDs and hydrates tableOfContents headings.",
    inputPreview: JSON.stringify(sampleDocInput, null, 2),
    outputPreview: JSON.stringify(parsedWithAutoToc, null, 2),
    renderedContent: parsedWithAutoToc,
  },
});

export const AutoPopulateTocAndHeadingSlugs = meta.story({
  args: {
    title: "parseTiptapContent(doc)",
    subtitle: "Auto-assigns deterministic heading IDs and hydrates tableOfContents headings.",
    inputPreview: JSON.stringify(sampleDocInput, null, 2),
    outputPreview: JSON.stringify(parsedWithAutoToc, null, 2),
    renderedContent: parsedWithAutoToc,
  },
});

export const LegacyStringArrayNormalization = meta.story({
  args: {
    title: "parseTiptapContent(string[])",
    subtitle: "Normalizes legacy string[] arrays into paragraph block nodes.",
    inputPreview: JSON.stringify(legacyArrayInput, null, 2),
    outputPreview: JSON.stringify(parsedLegacyArray, null, 2),
    renderedContent: parsedLegacyArray,
  },
});
