# `@vicacha-devs/astro-tiptap-blocks`

Render **Tiptap / ProseMirror** rich text content (with full support for [`@notum-cz/strapi-plugin-tiptap-editor`](https://github.com/notum-cz/strapi-plugin-tiptap-editor) extended features across **JSON**, **HTML**, and **Markdown** output modes) using native, themeable **Astro** block components — inspired by [`@sensinum/astro-strapi-blocks`](https://github.com/VirtusLab-Open-Source/astro-strapi-blocks).

> **Astro compatibility:** `^5.0.0 || ^6.0.0 || ^7.0.0`

---

## Features

- **Zero `set:html` / `innerHTML` Rendering** — Every block and inline mark is parsed into a typed `TiptapDocNode` AST and rendered through native Astro components (`{text}`).
- **Full `@notum-cz/strapi-plugin-tiptap-editor` Feature Parity**:
  - **Typography & Inline Marks**: `bold`, `italic`, `underline`, `strike`, `code`, `subscript` (`<sub>`), `superscript` (`<sup>`), `highlight` (with custom color), `link` (with `strapi://` internal link resolution), `textStyle` (`color`, `fontFamily`, `fontSize`, `lineHeight`), `abbr` (`<abbr title>`), `language` (`<span lang dir>`), inline `linker` chips, and inline `mathematics` formulas.
  - **Headings & Lead Paragraphs**: `heading` (`h1`–`h6` with automatic slug `id` generation and SEO `tag` override from `BaseHeadingWithSEOTag`) and `leadParagraph` (`data-lead="true"`).
  - **Callouts & Accordions**: `informationPane` (`info`, `success`, `warning`, `danger`, `neutral`, `tip`), `conversationHistory` (author & timestamp), and collapsible `details` (`detailsSummary` + `detailsContent`).
  - **Multi-Column Layouts**: `layoutContainer` and `layoutColumn` with configurable column ratios (`1:1`, `1:1:1`, `2:1`, `1:2`, `1:1:1:1`).
  - **Lists & Checklists**: `bulletList`, `orderedList`, and `taskList` (`taskItem` with interactive-styled read-only checkboxes).
  - **Media & Sandboxed Embeds**: `image` (with `caption`, `data-align`, `data-asset-id`, `data-document-id`), `video` (YouTube/Vimeo embeds & `<video controls>`), `audio` (`<audio controls>`), `attachment` (downloadable file card with formatted size & badge), and HTTPS-only sandboxed `iframe` (with optional `allowedIframeDomains` allowlist).
  - **Mathematics, TOC & Page Breaks**: Display/inline `mathematics` (`role="math"` with Unicode formula preview), auto-populated `tableOfContents`, and `pageBreak`.
  - **Advanced Tables**: `table`, `tableRow`, `tableHeader`, and `tableCell` supporting `colspan`, `rowspan`, `colwidth`, and sanitized `backgroundColor`.
- **3-Format Input Normalization** — Seamlessly accepts ProseMirror JSON (`TiptapDocNode` or JSON string), Tiptap HTML strings, Tiptap/Strapi Markdown strings (including lossless `<!-- tiptap-node:{...} -->` metadata comments), or `string[]` fallback arrays.
- **Strapi Relation Extraction** — Includes `extractRelationsFromTiptap()`, `parseStrapiLinkUri()`, `formatStrapiLinkUri()`, and `resolveStrapiLinkHref()` to inspect referenced Strapi Media Library assets and internal content links.

---

## Installation

```bash
pnpm add @vicacha-devs/astro-tiptap-blocks
```

### Tailwind CSS v4 (`@tailwindcss/vite`)

```css
/* src/styles/global.css */
@import "tailwindcss";
@source "../../node_modules/@vicacha-devs/astro-tiptap-blocks/src/**/*.{astro,ts}";
```

---

## Quick Start

```astro
---
import { TiptapBlocks } from "@vicacha-devs/astro-tiptap-blocks";

const articleContent = {
  type: "doc",
  content: [
    { type: "tableOfContents" },
    {
      type: "leadParagraph",
      content: [{ type: "text", text: "Executive summary of our new release." }],
    },
    {
      type: "heading",
      attrs: { level: 2, tag: "h2" },
      content: [{ type: "text", text: "Key Highlights" }],
    },
    {
      type: "informationPane",
      attrs: { variant: "tip", title: "Pro Tip" },
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Works with JSON, HTML, and Markdown!" }],
        },
      ],
    },
  ],
};
---

<TiptapBlocks
  data={articleContent}
  allowedIframeDomains={["youtube.com", "player.vimeo.com", "openstreetmap.org"]}
  resolveInternalLink={({ collectionName, documentId }) =>
    `/blog/${collectionName.split(".").pop()}/${documentId}`
  }
/>
```

---

## Programmatic Utilities

```ts
import {
  parseTiptapContent,
  parseTiptapHtml,
  parseTiptapMarkdown,
  extractRelationsFromTiptap,
  parseStrapiLinkUri,
  formatStrapiLinkUri,
  resolveStrapiLinkHref,
  sanitizeTiptapUrl,
  sanitizeTiptapIframeUrl,
  sanitizeCssColor,
  buildSafeInlineStyle,
  buildThemeObject,
  TiptapBlockThemeDefault,
} from "@vicacha-devs/astro-tiptap-blocks";
```

---

## Interactive Documentation (Storybook for Astro)

This repository includes a full TypeScript **Storybook for Astro** (`@storybook-astro/framework`) suite with `autodocs` prop tables for every `.astro` component, interactive demos for `src/lib/` utilities, and MDX documentation for `src/types/`.

```bash
# Start Storybook dev server on http://localhost:6006
pnpm storybook

# Build static Storybook site
pnpm build-storybook
```

---

## License

MIT © Vicacha Devs
