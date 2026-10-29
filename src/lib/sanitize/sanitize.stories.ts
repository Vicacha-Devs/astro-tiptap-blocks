import preview from "@storybook/preview";

import TiptapLibPreview from "../../components/blocks/TiptapLibPreview/TiptapLibPreview.astro";
import {
  buildSafeInlineStyle,
  formatFileSize,
  formatLatexPreview,
  sanitizeCssColor,
  sanitizeTiptapIframeUrl,
  sanitizeTiptapUrl,
  slugifyHeadingText,
} from "./sanitize";

const urlTestCases = [
  "https://astro.build/blog",
  "tiptap://article/doc-42",
  "javascript:alert(document.cookie)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
  "/relative/path#section",
];

const urlResults = Object.fromEntries(urlTestCases.map((u) => [u, sanitizeTiptapUrl(u)]));

const iframeAndStyleInputs = {
  iframes: [
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "http://insecure.example.com/embed",
    "javascript:alert(1)",
  ],
  colors: ["#4f46e5", "rgb(16, 185, 129)", "red; background:url(javascript:alert(1))"],
  textStyleAttrs: {
    color: "#1e293b",
    fontFamily: "Inter, sans-serif",
    fontSize: "18px",
    lineHeight: "1.6",
  },
  helpers: {
    slug: slugifyHeadingText("Hello World! Tiptap & Astro"),
    fileSize: formatFileSize(2485760),
    latexPreview: formatLatexPreview("\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}"),
  },
};

const iframeAndStyleOutputs = {
  iframes: Object.fromEntries(
    iframeAndStyleInputs.iframes.map((u) => [u, sanitizeTiptapIframeUrl(u)])
  ),
  colors: Object.fromEntries(iframeAndStyleInputs.colors.map((c) => [c, sanitizeCssColor(c)])),
  safeStyleString: buildSafeInlineStyle(iframeAndStyleInputs.textStyleAttrs),
  helpers: iframeAndStyleInputs.helpers,
};

const meta = preview.meta({
  title: "Lib/sanitize",
  component: TiptapLibPreview,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    title: "sanitizeTiptapUrl(url)",
    subtitle:
      "Allows http/https/mailto/tel/tiptap/relative URLs and blocks javascript:, data:text/html, and vbscript:.",
    inputPreview: JSON.stringify(urlTestCases, null, 2),
    outputPreview: JSON.stringify(urlResults, null, 2),
  },
});

export const UrlProtocolWhitelisting = meta.story({
  args: {
    title: "sanitizeTiptapUrl(url)",
    subtitle:
      "Allows http/https/mailto/tel/tiptap/relative URLs and blocks javascript:, data:text/html, and vbscript:.",
    inputPreview: JSON.stringify(urlTestCases, null, 2),
    outputPreview: JSON.stringify(urlResults, null, 2),
  },
});

export const IframeCssAndFormattingHelpers = meta.story({
  args: {
    title: "sanitizeTiptapIframeUrl, sanitizeCssColor & buildSafeInlineStyle",
    subtitle:
      "Enforces HTTPS on iframes, rejects CSS injection tokens, and formats slugs/bytes/LaTeX.",
    inputPreview: JSON.stringify(iframeAndStyleInputs, null, 2),
    outputPreview: JSON.stringify(iframeAndStyleOutputs, null, 2),
  },
});
