import preview from "@storybook/preview";
import type { TiptapCodeBlockNode } from "../../../types";

import TiptapBlockCode from "./TiptapBlockCode.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockCode",
  component: TiptapBlockCode,
  tags: ["autodocs", "version:1.1.0", "security"],
  args: {
    type: "codeBlock",
    showLineNumbers: true,
    copyable: true,
    attrs: { language: "typescript" },
    content: [{ type: "text", text: "const x: number = 42;" }],
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
    showLineNumbers: {
      control: "boolean",
    },
    copyable: {
      control: "boolean",
    },
  },
});

export const TypeScriptSnippet = meta.story({
  args: {
    type: "codeBlock",
    showLineNumbers: true,
    copyable: true,
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
  } satisfies TiptapCodeBlockNode & { showLineNumbers: boolean; copyable: boolean },
});

export const SqlQuerySnippet = meta.story({
  args: {
    type: "codeBlock",
    showLineNumbers: true,
    copyable: true,
    attrs: { language: "sql" },
    content: [
      {
        type: "text",
        text: [
          "SELECT document_id, title, published_at",
          "FROM articles",
          "WHERE locale = 'es' AND published_at IS NOT NULL",
          "ORDER BY published_at DESC",
          "LIMIT 10;",
        ].join("\n"),
      },
    ],
  } satisfies TiptapCodeBlockNode & { showLineNumbers: boolean; copyable: boolean },
});

export const PlainCodeBlockWithoutLanguage = meta.story({
  args: {
    type: "codeBlock",
    showLineNumbers: false,
    copyable: false,
    content: [
      {
        type: "text",
        text: "pnpm add @vicacha-devs/astro-tiptap-blocks\npnpm storybook",
      },
    ],
  } satisfies TiptapCodeBlockNode & { showLineNumbers: boolean; copyable: boolean },
});
