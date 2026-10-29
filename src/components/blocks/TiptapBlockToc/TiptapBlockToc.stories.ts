import preview from "@storybook/preview";

import type { TiptapPageBreakNode, TiptapTableOfContentsNode } from "../../../types";
import TiptapBlockToc from "./TiptapBlockToc.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockToc",
  component: TiptapBlockToc,
  tags: ["autodocs", "version:1.1.0", "new"],
  args: {
    type: "tableOfContents",
    attrs: {
      title: "Document Contents",
      headings: [
        { id: "introduction", text: "1. Introduction", level: 1 },
        { id: "input-formats", text: "1.1 Supported Input Formats", level: 2 },
      ],
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["tableOfContents", "pageBreak"],
    },
    attrs: {
      control: "object",
    },
  },
});

export const TableOfContentsNavigation = meta.story({
  args: {
    type: "tableOfContents",
    attrs: {
      title: "Document Contents",
      headings: [
        { id: "introduction", text: "1. Introduction", level: 1 },
        { id: "input-formats", text: "1.1 Supported Input Formats", level: 2 },
        { id: "prosemirror-json", text: "ProseMirror JSON AST", level: 3 },
        { id: "html-and-markdown", text: "HTML & Lossless Markdown", level: 3 },
        { id: "security-model", text: "2. Security Model", level: 2 },
      ],
    },
  } satisfies TiptapTableOfContentsNode,
});

export const PageBreakSeparator = meta.story({
  args: {
    type: "pageBreak",
  } satisfies TiptapPageBreakNode,
});
