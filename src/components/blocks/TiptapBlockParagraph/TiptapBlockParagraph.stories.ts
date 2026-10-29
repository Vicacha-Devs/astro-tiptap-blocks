import preview from "@storybook/preview";

import type { TiptapLeadParagraphNode, TiptapParagraphNode } from "../../../types";
import TiptapBlockParagraph from "./TiptapBlockParagraph.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockParagraph",
  component: TiptapBlockParagraph,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "paragraph",
    content: [{ type: "text", text: "Standard paragraph text." }],
  },
  argTypes: {
    type: {
      control: "select",
      options: ["paragraph", "leadParagraph"],
    },
    attrs: {
      control: "object",
    },
    content: {
      control: "object",
    },
  },
});

export const StandardParagraph = meta.story({
  args: {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: "Standard body paragraph rendered by TiptapBlockParagraph with ",
      },
      { type: "text", text: "bold emphasis", marks: [{ type: "bold" }] },
      { type: "text", text: ", " },
      { type: "text", text: "italic phrasing", marks: [{ type: "italic" }] },
      { type: "text", text: ", and an inline " },
      {
        type: "text",
        text: "external documentation link",
        marks: [{ type: "link", attrs: { href: "https://docs.astro.build", target: "_blank" } }],
      },
      { type: "text", text: "." },
    ],
  } satisfies TiptapParagraphNode,
});

export const LeadParagraph = meta.story({
  args: {
    type: "leadParagraph",
    content: [
      {
        type: "text",
        text: "Lead paragraphs introduce articles with larger typography and muted contrast, matching the Tiptap LeadParagraph extension.",
      },
    ],
  } satisfies TiptapLeadParagraphNode,
});

export const CenteredParagraph = meta.story({
  args: {
    type: "paragraph",
    attrs: { textAlign: "center" },
    content: [
      {
        type: "text",
        text: "This paragraph uses attrs.textAlign = 'center' to apply centered text alignment.",
      },
    ],
  } satisfies TiptapParagraphNode,
});

export const RightToLeftParagraph = meta.story({
  args: {
    type: "paragraph",
    attrs: { dir: "rtl", textAlign: "right" },
    content: [
      {
        type: "text",
        text: "هذه فقرة تجريبية مكتوبة من اليمين إلى اليسار لاختبار دعم اتجاه النص في المكون.",
      },
    ],
  } satisfies TiptapParagraphNode,
});
