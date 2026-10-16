import preview from "@storybook/preview";
import TiptapLibPreview from "../../components/blocks/TiptapLibPreview/TiptapLibPreview.astro";

import { isLikelyMarkdown, parseTiptapMarkdown } from "./markdown-parser";

const markdownSample = [
  "# Markdown Parser Showcase",
  "",
  ":::warning[Markdown Admonition]",
  "Callout blocks convert into `informationPane` AST nodes.",
  ":::",
  "",
  "- [x] Support inline `$E = mc^2$` math",
  "- [ ] Support pipe tables",
  "",
  "| Module | Responsibility |",
  "| :--- | :--- |",
  "| `markdown-parser.ts` | Converts Markdown + lossless comments to AST |",
  "| `sanitize.ts` | Validates URLs, iframes, and CSS colors |",
].join("\n");

const parsedMarkdown = parseTiptapMarkdown(markdownSample);

const losslessCommentMarkdown = [
  '<!-- tiptap-node:{"type":"heading","attrs":{"level":2,"tag":"h3"},"content":[{"type":"text","text":"Lossless Comment Restored Heading"}]} -->',
  "",
  "Regular Markdown paragraph following a lossless `<!-- tiptap-node:{...} -->` comment.",
].join("\n");

const parsedLossless = parseTiptapMarkdown(losslessCommentMarkdown);

const meta = preview.meta({
  title: "Lib/markdown-parser",
  component: TiptapLibPreview,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    title: "parseTiptapMarkdown(markdown)",
    subtitle: `isLikelyMarkdown(input) === ${String(isLikelyMarkdown(markdownSample))}`,
    inputPreview: markdownSample,
    outputPreview: JSON.stringify(parsedMarkdown, null, 2),
    renderedContent: parsedMarkdown,
  },
});

export const CalloutsTaskListsAndTables = meta.story({
  args: {
    title: "parseTiptapMarkdown(markdown)",
    subtitle: `isLikelyMarkdown(input) === ${String(isLikelyMarkdown(markdownSample))}`,
    inputPreview: markdownSample,
    outputPreview: JSON.stringify(parsedMarkdown, null, 2),
    renderedContent: parsedMarkdown,
  },
});

export const LosslessMetadataCommentRestoration = meta.story({
  args: {
    title: "parseTiptapMarkdown() with <!-- tiptap-node:{...} -->",
    subtitle: "Reconstructs exact Tiptap AST nodes serialized as lossless HTML comments in Markdown mode.",
    inputPreview: losslessCommentMarkdown,
    outputPreview: JSON.stringify(parsedLossless, null, 2),
    renderedContent: parsedLossless,
  },
});
