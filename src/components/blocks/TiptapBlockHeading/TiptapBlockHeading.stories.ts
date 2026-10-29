import preview from "@storybook/preview";

import type { TiptapHeadingNode } from "../../../types";
import TiptapBlockHeading from "./TiptapBlockHeading.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockHeading",
  component: TiptapBlockHeading,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "heading",
    attrs: { level: 1, id: "heading-level-1" },
    content: [{ type: "text", text: "Heading Level 1 (h1)" }],
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

export const HeadingLevel1 = meta.story({
  args: {
    type: "heading",
    attrs: { level: 1, id: "heading-level-1" },
    content: [{ type: "text", text: "Heading Level 1 (h1)" }],
  } satisfies TiptapHeadingNode,
});

export const HeadingLevel2 = meta.story({
  args: {
    type: "heading",
    attrs: { level: 2, id: "heading-level-2" },
    content: [{ type: "text", text: "Heading Level 2 (h2) with Anchor ID" }],
  } satisfies TiptapHeadingNode,
});

export const HeadingLevel3WithInlineMarks = meta.story({
  args: {
    type: "heading",
    attrs: { level: 3, id: "architecture-overview" },
    content: [
      { type: "text", text: "Heading Level 3 with " },
      { type: "text", text: "inline code", marks: [{ type: "code" }] },
      { type: "text", text: " and " },
      {
        type: "text",
        text: "highlight",
        marks: [{ type: "highlight", attrs: { color: "#fef08a" } }],
      },
    ],
  } satisfies TiptapHeadingNode,
});

export const SeoTagOverrideVisualH2AsH4 = meta.story({
  args: {
    type: "heading",
    attrs: {
      level: 2,
      tag: "h4",
      id: "seo-friendly-subheading",
    },
    content: [
      {
        type: "text",
        text: 'Visually styled as H2 (level: 2), semantically rendered as an <h4 data-seo-tag="h4"> element',
      },
    ],
  } satisfies TiptapHeadingNode,
});

export const CenteredAndRTLHeading = meta.story({
  args: {
    type: "heading",
    attrs: {
      level: 2,
      textAlign: "center",
      dir: "rtl",
    },
    content: [{ type: "text", text: "عنوان رئيسي باللغة العربية مع محاذاة في المنتصف" }],
  } satisfies TiptapHeadingNode,
});
