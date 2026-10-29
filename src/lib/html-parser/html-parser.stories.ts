import preview from "@storybook/preview";

import TiptapLibPreview from "../../components/blocks/TiptapLibPreview/TiptapLibPreview.astro";
import { parseTiptapHtml } from "./html-parser";

const extendedTiptapHtml = [
  '<h2 data-seo-tag="h3">Extended Tiptap HTML</h2>',
  '<p data-lead="true">Lead paragraph with <mark data-color="#fef08a">custom highlight</mark> and <abbr title="Abstract Syntax Tree">AST</abbr>.</p>',
  '<aside data-type="information-pane" data-variant="info" data-title="Tokenizer Note">',
  "  <p>Parsed by the state-machine HTML tokenizer without raw DOM injection.</p>",
  "</aside>",
  '<ul data-type="taskList">',
  '  <li data-type="taskItem" data-checked="true"><p>Strip unsafe script tags</p></li>',
  '  <li data-type="taskItem" data-checked="false"><p>Hydrate math formulas</p></li>',
  "</ul>",
].join("\n");

const parsedExtendedHtml = parseTiptapHtml(extendedTiptapHtml);

const untrustedHtmlWithXss = [
  '<p onclick="alert(\'xss\')">Safe text before script<script>window.pwned = true;</script> and safe link <a href="javascript:alert(1)">blocked href</a>.</p>',
  "<style>body { display: none; }</style>",
].join("\n");

const parsedSanitizedHtml = parseTiptapHtml(untrustedHtmlWithXss);

const meta = preview.meta({
  title: "Lib/html-parser",
  component: TiptapLibPreview,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    title: "parseTiptapHtml(extendedTiptapHtml)",
    subtitle:
      "Parses data-seo-tag headings, callout panes, task lists, highlights, and abbreviations.",
    inputPreview: extendedTiptapHtml,
    outputPreview: JSON.stringify(parsedExtendedHtml, null, 2),
    renderedContent: parsedExtendedHtml,
  },
});

export const ExtendedTiptapHtmlToAst = meta.story({
  args: {
    title: "parseTiptapHtml(extendedTiptapHtml)",
    subtitle:
      "Parses data-seo-tag headings, callout panes, task lists, highlights, and abbreviations.",
    inputPreview: extendedTiptapHtml,
    outputPreview: JSON.stringify(parsedExtendedHtml, null, 2),
    renderedContent: parsedExtendedHtml,
  },
});

export const ScriptAndXssStripping = meta.story({
  args: {
    title: "parseTiptapHtml(untrustedHtml) — Security Sanitization",
    subtitle: "Strips <script> and <style> subtrees and neutralizes javascript: href attributes.",
    inputPreview: untrustedHtmlWithXss,
    outputPreview: JSON.stringify(parsedSanitizedHtml, null, 2),
    renderedContent: parsedSanitizedHtml,
  },
});
