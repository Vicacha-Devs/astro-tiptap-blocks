import preview from "@storybook/preview";

import type { TiptapDetailsNode } from "../../../types";
import TiptapBlockDetails from "./TiptapBlockDetails.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockDetails",
  component: TiptapBlockDetails,
  tags: ["autodocs", "version:1.1.0", "new"],
  args: {
    type: "details",
    attrs: { open: false },
    content: [
      {
        type: "detailsSummary",
        content: [{ type: "text", text: "How does internal relation resolution work?" }],
      },
      {
        type: "detailsContent",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Links stored as tiptap:// are resolved via resolveInternalLink.",
              },
            ],
          },
        ],
      },
    ],
  },
  argTypes: {
    type: {
      control: "text",
    },
    attrs: {
      control: "object",
    },
    content: {
      control: "object",
    },
  },
});

export const CollapsedAccordion = meta.story({
  args: {
    type: "details",
    attrs: { open: false },
    content: [
      {
        type: "detailsSummary",
        content: [{ type: "text", text: "How does internal relation resolution work?" }],
      },
      {
        type: "detailsContent",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Links stored as tiptap://article/doc-123 are parsed and resolved via resolveInternalLink.",
              },
            ],
          },
        ],
      },
    ],
  } satisfies TiptapDetailsNode,
});

export const ExpandedAccordionWithRichContent = meta.story({
  args: {
    type: "details",
    attrs: { open: true },
    content: [
      {
        type: "detailsSummary",
        content: [{ type: "text", text: "Supported Input Formats (Expanded by Default)" }],
      },
      {
        type: "detailsContent",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "You can pass any of the following directly to <TiptapBlocks />:",
              },
            ],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  { type: "paragraph", content: [{ type: "text", text: "ProseMirror JSON doc" }] },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "HTML string from Tiptap" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Markdown string with callouts" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  } satisfies TiptapDetailsNode,
});
