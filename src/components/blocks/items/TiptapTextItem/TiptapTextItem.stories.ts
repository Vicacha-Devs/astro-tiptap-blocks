import preview from "@storybook/preview";

import type { TiptapTextNode } from "../../../../types";
import TiptapTextItem from "./TiptapTextItem.astro";

const meta = preview.meta({
  title: "Components/Blocks/Items/TiptapTextItem",
  component: TiptapTextItem,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "text",
    text: "Sample formatted text",
  },
  argTypes: {
    text: {
      control: "text",
    },
    marks: {
      control: "object",
    },
    theme: {
      control: "object",
    },
  },
});

export const CombinedTypographyMarks = meta.story({
  args: {
    type: "text",
    text: "Bold + Italic + Underlined Text",
    marks: [{ type: "bold" }, { type: "italic" }, { type: "underline" }],
  } satisfies TiptapTextNode,
});

export const CustomHighlightColor = meta.story({
  args: {
    type: "text",
    text: "Highlighted with custom hex background (#bbf7d0)",
    marks: [{ type: "highlight", attrs: { color: "#bbf7d0" } }],
  } satisfies TiptapTextNode,
});

export const AbbreviationAndLanguageMark = meta.story({
  args: {
    type: "text",
    text: "WCAG 2.2 (Hover for full title)",
    marks: [
      { type: "abbr", attrs: { title: "Web Content Accessibility Guidelines 2.2" } },
      { type: "language", attrs: { lang: "en", dir: "ltr" } },
    ],
  } satisfies TiptapTextNode,
});

export const CustomTextStyleMark = meta.story({
  args: {
    type: "text",
    text: "Styled via sanitized textStyle mark (color, fontSize, lineHeight)",
    marks: [
      {
        type: "textStyle",
        attrs: { color: "#4f46e5", fontSize: "1.125rem", lineHeight: "1.75" },
      },
    ],
  } satisfies TiptapTextNode,
});
