import preview from "@storybook/preview";
import type { TiptapDocNode } from "../../types";

import TiptapBlocks from "./TiptapBlocks.astro";

const kitchenSinkDoc: TiptapDocNode = {
  type: "doc",
  content: [
    {
      type: "tableOfContents",
      attrs: { title: "On this page" },
    },
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Strapi Tiptap Editor Kitchen Sink" }],
    },
    {
      type: "leadParagraph",
      content: [
        {
          type: "text",
          text: "A complete end-to-end demonstration of ProseMirror JSON, HTML, and Markdown rendering with native Astro components.",
        },
      ],
    },
    {
      type: "informationPane",
      attrs: { variant: "info", title: "Security Guarantee" },
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Every mark—including " },
            { type: "text", text: "highlighted text", marks: [{ type: "highlight", attrs: { color: "#fef08a" } }] },
            { type: "text", text: ", " },
            { type: "text", text: "CMS", marks: [{ type: "abbr", attrs: { title: "Content Management System" } }] },
            { type: "text", text: ", and internal " },
            {
              type: "linker",
              attrs: {
                collectionName: "api::article.article",
                documentId: "astro-5-guide",
                label: "Astro 5 Migration Guide",
              },
            },
            { type: "text", text: "—is rendered via native Astro components." },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2, tag: "h3" },
      content: [{ type: "text", text: "Visual H2 Rendered as <h3> for SEO" }],
    },
    {
      type: "layoutContainer",
      attrs: { columns: "2:1" },
      content: [
        {
          type: "layoutColumn",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Primary 2/3 column with checklist items:" }],
            },
            {
              type: "taskList",
              content: [
                {
                  type: "taskItem",
                  attrs: { checked: true },
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Multi-format input parser" }] }],
                },
                {
                  type: "taskItem",
                  attrs: { checked: false },
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Visual regression review" }] }],
                },
              ],
            },
          ],
        },
        {
          type: "layoutColumn",
          content: [
            {
              type: "mathematics",
              attrs: { latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}", displayMode: "block" },
            },
          ],
        },
      ],
    },
  ],
};

const meta = preview.meta({
  title: "Components/TiptapBlocks",
  component: TiptapBlocks,
  tags: ["autodocs", "version:1.1.0", "new"],
  args: {
    data: kitchenSinkDoc,
  },
  argTypes: {
    data: {
      control: "object",
    },
    theme: {
      control: "object",
    },
    class: {
      control: "text",
    },
    allowedIframeDomains: {
      control: "object",
    },
  },
});

export const KitchenSinkJSON = meta.story({
  args: {
    data: kitchenSinkDoc,
  },
});

export const FromHTMLString = meta.story({
  args: {
    data:
      '<h2 data-seo-tag="h3">HTML Input Mode</h2><p data-lead="true">Parsed directly from Strapi HTML output with <mark data-color="#bbf7d0">highlighted marks</mark> and <span data-type="mathematics" data-latex="E = mc^2"></span>.</p><aside data-type="information-pane" data-variant="success" data-title="HTML Callout"><p>Safe HTML tokenizer strips scripts and event attributes automatically.</p></aside>',
  },
});

export const FromMarkdownString = meta.story({
  args: {
    data: [
      "# Markdown Input Mode",
      "",
      ":::tip[Lossless Markdown Support]",
      "Supports callouts, task lists, tables, and display math.",
      ":::",
      "",
      "- [x] Parse Markdown headings and lists",
      "- [ ] Configure custom theme overrides",
      "",
      "$$",
      "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
      "$$",
    ].join("\n"),
  },
});

export const CustomExtendedTheme = meta.story({
  args: {
    data: kitchenSinkDoc,
    theme: {
      extend: {
        heading: {
          default: "text-indigo-950",
          h1: "underline decoration-indigo-500 decoration-4 underline-offset-8",
        },
        leadParagraph: {
          default: "text-indigo-700 font-medium",
        },
      },
    },
  },
});
