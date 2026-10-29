import preview from "@storybook/preview";

import TiptapLibPreview from "../../components/blocks/TiptapLibPreview/TiptapLibPreview.astro";
import type { TiptapDocNode } from "../../types";
import {
  extractRelationsFromTiptap,
  formatInternalLinkUri,
  parseInternalLinkUri,
  resolveInternalLinkHref,
} from "./relations";

const docWithRelations: TiptapDocNode = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Read our related guide: " },
        {
          type: "text",
          text: "Getting Started with Astro",
          marks: [
            {
              type: "link",
              attrs: { href: "tiptap://article/astro-getting-started" },
            },
          ],
        },
        { type: "text", text: " or inspect the inline linker chip: " },
        {
          type: "linker",
          attrs: {
            collectionName: "product",
            documentId: "starter-kit-pro",
            label: "Starter Kit Pro",
          },
        },
      ],
    },
    {
      type: "image",
      attrs: {
        "src":
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "alt": "Architecture diagram",
        "data-asset-id": 108,
        "data-document-id": "media-arch-108",
      },
    },
  ],
};

const extracted = extractRelationsFromTiptap(docWithRelations);
const sampleUri = "tiptap://article/astro-getting-started";
const parsedUri = parseInternalLinkUri(sampleUri);

const meta = preview.meta({
  title: "Lib/relations",
  component: TiptapLibPreview,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    title: "extractRelationsFromTiptap(doc)",
    subtitle: "Extracts deduplicated internal relation links and media asset references.",
    inputPreview: JSON.stringify(docWithRelations, null, 2),
    outputPreview: JSON.stringify(extracted, null, 2),
    renderedContent: docWithRelations,
  },
});

export const ExtractLinksAndMediaFromDocument = meta.story({
  args: {
    title: "extractRelationsFromTiptap(doc)",
    subtitle: "Extracts deduplicated internal relation links and media asset references.",
    inputPreview: JSON.stringify(docWithRelations, null, 2),
    outputPreview: JSON.stringify(extracted, null, 2),
    renderedContent: docWithRelations,
  },
});

export const ParseAndFormatInternalUri = meta.story({
  args: {
    title: "parseInternalLinkUri() & resolveInternalLinkHref()",
    subtitle: "Parses tiptap://<collectionName>/<documentId> and resolves public route URLs.",
    inputPreview: sampleUri,
    outputPreview: JSON.stringify(
      {
        parsed: parsedUri,
        reformatted: parsedUri
          ? formatInternalLinkUri(parsedUri.collectionName, parsedUri.documentId)
          : null,
        defaultResolvedHref: resolveInternalLinkHref({ href: sampleUri }),
        customResolvedHref: resolveInternalLinkHref(
          { href: sampleUri },
          (ref) => `/blog/${ref.collectionName.split(".").pop()}/${ref.documentId}`
        ),
      },
      null,
      2
    ),
  },
});
