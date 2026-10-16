import preview from "@storybook/preview";
import type { TiptapCodeBlockNode } from "../../../types";

import TiptapBlockCode from "./TiptapBlockCode.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockCode",
  component: TiptapBlockCode,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "codeBlock",
    attrs: { language: "typescript" },
    content: [{ type: "text", text: "const x = 42;" }],
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

export const TypeScriptSnippet = meta.story({
  args: {
    type: "codeBlock",
    attrs: { language: "typescript" },
    content: [
      {
        type: "text",
        text: [
          'import { parseTiptapContent, extractRelationsFromTiptap } from "@vicacha-devs/astro-tiptap-blocks";',
          "",
          "const doc = parseTiptapContent(article.body);",
          "const relations = extractRelationsFromTiptap(doc);",
          "console.log(relations.internalLinks, relations.mediaAssets);",
        ].join("\n"),
      },
    ],
  } satisfies TiptapCodeBlockNode,
});

export const PlainCodeBlockWithoutLanguage = meta.story({
  args: {
    type: "codeBlock",
    content: [
      {
        type: "text",
        text: "pnpm add @vicacha-devs/astro-tiptap-blocks\npnpm storybook",
      },
    ],
  } satisfies TiptapCodeBlockNode,
});
