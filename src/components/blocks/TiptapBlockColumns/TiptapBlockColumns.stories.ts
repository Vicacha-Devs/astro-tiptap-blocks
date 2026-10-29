import preview from "@storybook/preview";

import type { TiptapLayoutContainerNode } from "../../../types";
import TiptapBlockColumns from "./TiptapBlockColumns.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockColumns",
  component: TiptapBlockColumns,
  tags: ["autodocs", "version:1.1.0", "new"],
  args: {
    type: "layoutContainer",
    attrs: { columns: "1:1" },
    content: [],
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

export const TwoEqualColumns = meta.story({
  args: {
    type: "layoutContainer",
    attrs: { columns: "1:1" },
    content: [
      {
        type: "layoutColumn",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Left Column (1:1)" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "First column in a balanced two-column grid." }],
          },
        ],
      },
      {
        type: "layoutColumn",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Right Column (1:1)" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Second column with independent nested blocks." }],
          },
        ],
      },
    ],
  } satisfies TiptapLayoutContainerNode,
});

export const ThreeEqualColumns = meta.story({
  args: {
    type: "layoutContainer",
    attrs: { columns: "1:1:1" },
    content: [
      {
        type: "layoutColumn",
        content: [
          { type: "heading", attrs: { level: 4 }, content: [{ type: "text", text: "1. Parse" }] },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Normalize JSON, HTML, or Markdown into AST." }],
          },
        ],
      },
      {
        type: "layoutColumn",
        content: [
          {
            type: "heading",
            attrs: { level: 4 },
            content: [{ type: "text", text: "2. Sanitize" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Validate protocols, iframe URLs, and CSS colors." }],
          },
        ],
      },
      {
        type: "layoutColumn",
        content: [
          { type: "heading", attrs: { level: 4 }, content: [{ type: "text", text: "3. Render" }] },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Render native Astro components with Tailwind theme." },
            ],
          },
        ],
      },
    ],
  } satisfies TiptapLayoutContainerNode,
});

export const AsymmetricTwoToOne = meta.story({
  args: {
    type: "layoutContainer",
    attrs: { columns: "2:1" },
    content: [
      {
        type: "layoutColumn",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Main Content Column (2/3)" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The 2:1 layout spans two-thirds of the container on desktop viewports while stacking cleanly on mobile.",
              },
            ],
          },
        ],
      },
      {
        type: "layoutColumn",
        content: [
          {
            type: "heading",
            attrs: { level: 4 },
            content: [{ type: "text", text: "Sidebar Column (1/3)" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Ideal for callouts, metadata, or quick links." }],
          },
        ],
      },
    ],
  } satisfies TiptapLayoutContainerNode,
});
