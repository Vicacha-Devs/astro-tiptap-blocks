import preview from "@storybook/preview";

import type { TiptapBlockquoteNode } from "../../../types";
import TiptapBlockQuote from "./TiptapBlockQuote.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockQuote",
  component: TiptapBlockQuote,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "blockquote",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Simplicity is prerequisite for reliability." }],
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

export const SingleParagraphQuote = meta.story({
  args: {
    type: "blockquote",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Simplicity is prerequisite for reliability. Every AST node should render deterministically without raw HTML injection.",
          },
        ],
      },
    ],
  } satisfies TiptapBlockquoteNode,
});

export const MultiParagraphWithListQuote = meta.story({
  args: {
    type: "blockquote",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Key architectural invariants enforced by @vicacha-devs/astro-tiptap-blocks:",
            marks: [{ type: "bold" }],
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Native Astro component rendering" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Protocol-whitelisted URLs" }] },
            ],
          },
        ],
      },
    ],
  } satisfies TiptapBlockquoteNode,
});

export const RightToLeftQuote = meta.story({
  tags: ["rtl"],
  globals: { addonRtl: "rtl" },
  parameters: {
    design: { type: "link", url: "https://www.figma.com/design/REPLACE_ME" },
  },
  args: {
    type: "blockquote",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "البساطة شرط الموثوقية." }],
      },
    ],
  },
});
