import preview from "@storybook/preview";

import type { TiptapInlineNode } from "../../../../types";
import TiptapInlineNodes from "./TiptapInlineNodes.astro";

const meta = preview.meta({
  title: "Components/Blocks/Items/TiptapInlineNodes",
  component: TiptapInlineNodes,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    nodes: [],
  },
  argTypes: {
    nodes: {
      control: "object",
    },
    theme: {
      control: "object",
    },
  },
});

export const MixedInlineSequence = meta.story({
  args: {
    nodes: [
      { type: "text", text: "Inline sequence combining " },
      { type: "text", text: "bold text", marks: [{ type: "bold" }] },
      { type: "text", text: ", an inline linker chip " },
      {
        type: "linker",
        attrs: {
          collectionName: "article",
          documentId: "tiptap-astro-guide",
          label: "Tiptap & Astro Guide",
        },
      },
      { type: "text", text: ", a hard break:" },
      { type: "hardBreak" },
      { type: "text", text: "and an inline math formula: " },
      {
        type: "mathematics",
        attrs: { latex: "E = mc^2 \\pm \\Delta E", displayMode: "inline" },
      },
    ] satisfies TiptapInlineNode[],
  },
});
