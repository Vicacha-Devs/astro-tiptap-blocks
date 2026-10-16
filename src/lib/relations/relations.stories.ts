import preview from "@storybook/preview";
import TiptapLibPreview from "../../components/blocks/TiptapLibPreview/TiptapLibPreview.astro";
import type { TiptapDocNode } from "../../types";

import {
  extractRelationsFromTiptap,
  formatStrapiLinkUri,
  parseStrapiLinkUri,
  resolveStrapiLinkHref,
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
              attrs: { href: "strapi://api::article.article/astro-getting-started" },
            },
          ],
        },
        { type: "text", text: " or inspect the inline linker chip: " },
        {
          type: "linker",
          attrs: {
            collectionName: "api::product.product",
            documentId: "starter-kit-pro",
            label: "Starter Kit Pro",
          },
        },
      ],
    },
    {
      type: "image",
      attrs: {
        src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        alt: "Architecture diagram",
        "data-asset-id": 108,
        "data-document-id": "media-arch-108",
      },
    },
  ],
};

const extracted = extractRelationsFromTiptap(docWithRelations);
const sampleUri = "strapi://api::article.article/astro-getting-started";
const parsedUri = parseStrapiLinkUri(sampleUri);

const meta = preview.meta({
  title: "Lib/relations",
  component: TiptapLibPreview,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    title: "extractRelationsFromTiptap(doc)",
    subtitle: "Extracts deduplicated internal Strapi relation links and media asset references.",
    inputPreview: JSON.stringify(docWithRelations, null, 2),
    outputPreview: JSON.stringify(extracted, null, 2),
    renderedContent: docWithRelations,
  },
});

export const ExtractLinksAndMediaFromDocument = meta.story({
  args: {
    title: "extractRelationsFromTiptap(doc)",
    subtitle: "Extracts deduplicated internal Strapi relation links and media asset references.",
    inputPreview: JSON.stringify(docWithRelations, null, 2),
    outputPreview: JSON.stringify(extracted, null, 2),
    renderedContent: docWithRelations,
  },
});

export const ParseAndFormatStrapiUri = meta.story({
  args: {
    title: "parseStrapiLinkUri() & resolveStrapiLinkHref()",
    subtitle: "Parses strapi://<collectionName>/<documentId> and resolves public route URLs.",
    inputPreview: sampleUri,
    outputPreview: JSON.stringify(
      {
        parsed: parsedUri,
        reformatted: parsedUri
          ? formatStrapiLinkUri(parsedUri.collectionName, parsedUri.documentId)
          : null,
        defaultResolvedHref: resolveStrapiLinkHref({ href: sampleUri }),
        customResolvedHref: resolveStrapiLinkHref(
          { href: sampleUri },
          (ref) => `/blog/${ref.collectionName.split(".").pop()}/${ref.documentId}`,
        ),
      },
      null,
      2,
    ),
  },
});
