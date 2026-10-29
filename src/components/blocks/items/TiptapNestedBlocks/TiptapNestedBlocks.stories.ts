import preview from "@storybook/preview";

import type { TiptapBlockNode } from "../../../../types";
import TiptapNestedBlocks from "./TiptapNestedBlocks.astro";

const meta = preview.meta({
  title: "Components/Blocks/Items/TiptapNestedBlocks",
  component: TiptapNestedBlocks,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    blocks: [],
  },
  argTypes: {
    blocks: {
      control: "object",
    },
    theme: {
      control: "object",
    },
  },
});

export const NestedParagraphAndCodeSequence = meta.story({
  args: {
    blocks: [
      {
        type: "heading",
        attrs: { level: 4 },
        content: [{ type: "text", text: "Nested Container Heading" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "TiptapNestedBlocks dispatches paragraphs, headings, lists, images, tables, and code blocks inside container nodes.",
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "json" },
        content: [{ type: "text", text: '{ "type": "doc", "content": [] }' }],
      },
    ] satisfies TiptapBlockNode[],
  },
});
