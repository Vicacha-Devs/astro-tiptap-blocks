import preview from "@storybook/preview";

import type { TiptapTableNode } from "../../../types";
import TiptapBlockTable from "./TiptapBlockTable.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockTable",
  component: TiptapBlockTable,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "table",
    content: [],
  },
  argTypes: {
    type: {
      control: "text",
    },
    content: {
      control: "object",
    },
  },
});

export const FeatureMatrixTable = meta.story({
  args: {
    type: "table",
    content: [
      {
        type: "tableRow",
        content: [
          {
            type: "tableHeader",
            attrs: { colwidth: [220] },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Feature" }] }],
          },
          {
            type: "tableHeader",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Input Support" }] }],
          },
          {
            type: "tableHeader",
            content: [{ type: "paragraph", content: [{ type: "text", text: "XSS Safe" }] }],
          },
        ],
      },
      {
        type: "tableRow",
        content: [
          {
            type: "tableCell",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Callouts & Conversation" }] },
            ],
          },
          {
            type: "tableCell",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "JSON, HTML, Markdown" }] },
            ],
          },
          {
            type: "tableCell",
            attrs: { backgroundColor: "#dcfce7" },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Yes" }] }],
          },
        ],
      },
      {
        type: "tableRow",
        content: [
          {
            type: "tableCell",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Internal Linker" }] }],
          },
          {
            type: "tableCell",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "tiptap:// URI & JSON attrs" }],
              },
            ],
          },
          {
            type: "tableCell",
            attrs: { backgroundColor: "#dcfce7" },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Yes" }] }],
          },
        ],
      },
    ],
  } satisfies TiptapTableNode,
});

export const MergedCellsTable = meta.story({
  args: {
    type: "table",
    content: [
      {
        type: "tableRow",
        content: [
          {
            type: "tableHeader",
            attrs: { colspan: 2, backgroundColor: "#e0e7ff" },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Merged Header (colspan = 2)" }],
              },
            ],
          },
        ],
      },
      {
        type: "tableRow",
        content: [
          {
            type: "tableCell",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Left Cell" }] }],
          },
          {
            type: "tableCell",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Right Cell" }] }],
          },
        ],
      },
    ],
  } satisfies TiptapTableNode,
});
