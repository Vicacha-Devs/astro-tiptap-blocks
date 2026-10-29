import preview from "@storybook/preview";

import TiptapLibPreview from "../../components/blocks/TiptapLibPreview/TiptapLibPreview.astro";
import type { TiptapDocNode } from "../../types";
import {
  calculateReadingTime,
  extractDocumentMetadata,
  extractPlainTextFromTiptap,
} from "./metadata";

const sampleArticle: TiptapDocNode = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Community Architecture & Heritage" }],
    },
    {
      type: "leadParagraph",
      content: [
        {
          type: "text",
          text: "Discover how traditional geometric craftsmanship meets sustainable modern engineering in Bogotá.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Guided Tours & Educational Programs" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Visitors are welcome every weekend for guided architectural tours and cultural dialogues.",
        },
        {
          type: "linker",
          attrs: {
            collectionName: "api::event.event",
            documentId: "weekend-tour-2026",
            label: "Book Weekend Tour",
          },
        },
      ],
    },
  ],
};

const fullMetadata = extractDocumentMetadata(sampleArticle, { excerptLength: 110 });
const readingTime = calculateReadingTime(sampleArticle);

const meta = preview.meta({
  title: "Lib/metadata",
  component: TiptapLibPreview,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    title: "extractDocumentMetadata(doc, { excerptLength: 110 })",
    subtitle: `${readingTime.text} (${readingTime.words} words) — Extracts SEO excerpt, reading time, headings, and document relations.`,
    inputPreview: JSON.stringify(sampleArticle, null, 2),
    outputPreview: JSON.stringify(fullMetadata, null, 2),
    renderedContent: sampleArticle,
  },
});

export const DocumentMetadataAndReadingTime = meta.story({
  args: {
    title: "extractDocumentMetadata(doc, { excerptLength: 110 })",
    subtitle: `${readingTime.text} (${readingTime.words} words) — Extracts SEO excerpt, reading time, headings, and document relations.`,
    inputPreview: JSON.stringify(sampleArticle, null, 2),
    outputPreview: JSON.stringify(fullMetadata, null, 2),
    renderedContent: sampleArticle,
  },
});

export const SeoExcerptTruncation = meta.story({
  args: {
    title: "extractPlainTextFromTiptap(doc, { maxLength: 90 })",
    subtitle:
      "Cleanly truncates plain text at word boundaries for <meta name='description'> and OpenGraph cards.",
    inputPreview: JSON.stringify(sampleArticle, null, 2),
    outputPreview: JSON.stringify(
      {
        fullPlainText: extractPlainTextFromTiptap(sampleArticle),
        truncated90Chars: extractPlainTextFromTiptap(sampleArticle, { maxLength: 90 }),
      },
      null,
      2
    ),
    renderedContent: sampleArticle,
  },
});
