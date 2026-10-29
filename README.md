# `@vicacha-devs/astro-tiptap-blocks`

Render **Tiptap / ProseMirror** rich text content across **JSON**, **HTML**, and **Markdown** output modes using native, themeable **Astro** block components with zero `set:html` injection.

> **Astro compatibility:** `^5.0.0 || ^6.0.0 || ^7.0.0`

---

## Features

- **Zero `set:html` / `innerHTML` Rendering** — Every block and inline mark is parsed into a typed `TiptapDocNode` AST and rendered through native Astro components (`{text}`).
- **Rich Tiptap & ProseMirror Extension Support**:
  - **Typography & Inline Marks**: `bold`, `italic`, `underline`, `strike`, `code`, `subscript` (`<sub>`), `superscript` (`<sup>`), `highlight` (with custom color), `link` (with `tiptap://` / `internal://` link resolution), `textStyle` (`color`, `fontFamily`, `fontSize`, `lineHeight`), `abbr` (`<abbr title>`), `language` (`<span lang dir>`), inline `linker` chips, and inline `mathematics` formulas.
  - **Headings & Lead Paragraphs**: `heading` (`h1`–`h6` with automatic slug `id` generation, optional `#` permalink anchors via `headingAnchors`, and SEO `tag` override) and `leadParagraph` (`data-lead="true"`).
  - **Callouts & Accordions**: `informationPane` (`info`, `success`, `warning`, `danger`, `neutral`, `tip`), `conversationHistory` (author & timestamp), and collapsible `details` (`detailsSummary` + `detailsContent`).
  - **Multi-Column Layouts**: `layoutContainer` and `layoutColumn` with configurable column ratios (`1:1`, `1:1:1`, `2:1`, `1:2`, `1:1:1:1`).
  - **Lists & Checklists**: `bulletList`, `orderedList`, and `taskList` (`taskItem` with interactive-styled read-only checkboxes).
  - **Code Blocks with Line Numbers & Copy Toolbar**: `codeBlock` with Shiki syntax highlighting, `showCodeLineNumbers` (`data-line-number`), and `copyableCodeBlocks` (`data-copy-code`).
  - **Media, Responsive Images & Sandboxed Embeds**: `image` (with `mediaBaseUrl`, `srcset`, `sizes`, `loading`, `decoding`, `fetchpriority`, `caption`, `data-align`, `data-asset-id`, `data-document-id`), `video` (YouTube/Vimeo embeds & `<video controls>`), `audio` (`<audio controls>`), `attachment` (downloadable file card with formatted size & badge), and HTTPS-only sandboxed `iframe` (with optional `allowedIframeDomains` allowlist).
  - **Mathematics, TOC & Page Breaks**: Display/inline `mathematics` (`role="math"` with Unicode formula preview), auto-populated `tableOfContents`, and `pageBreak`.
  - **Advanced Tables**: `table`, `tableRow`, `tableHeader`, and `tableCell` supporting `colspan`, `rowspan`, `colwidth`, and sanitized `backgroundColor`.
- **3-Format Input Normalization** — Seamlessly accepts ProseMirror JSON (`TiptapDocNode` or JSON string), Tiptap HTML strings, Tiptap Markdown strings (including lossless `<!-- tiptap-node:{...} -->` metadata comments), or `string[]` fallback arrays.
- **Built-in SEO Metadata, Reading Time & Document Relation Extraction** — Includes `extractDocumentMetadata()`, `extractPlainTextFromTiptap()`, `calculateReadingTime()`, `extractHeadingsFromTiptap()`, and `extractRelationsFromTiptap()`.
- **Granular Subpath Exports** — Import the Astro component from `@vicacha-devs/astro-tiptap-blocks`, built-in block components from `@vicacha-devs/astro-tiptap-blocks/components`, pure TypeScript utilities from `@vicacha-devs/astro-tiptap-blocks/lib`, or types from `@vicacha-devs/astro-tiptap-blocks/types`.

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
import { TiptapBlocks, extractDocumentMetadata } from "@vicacha-devs/astro-tiptap-blocks";

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

const { excerpt, readingTime, headings } = extractDocumentMetadata(articleContent);
---

<p class="text-sm text-slate-500">{readingTime.text}</p>

<TiptapBlocks
  data={articleContent}
  mediaBaseUrl="https://cdn.example.com"
  headingAnchors
  showCodeLineNumbers
  copyableCodeBlocks
  allowedIframeDomains={["youtube.com", "player.vimeo.com", "openstreetmap.org"]}
  resolveInternalLink={({ collectionName, documentId }) =>
    `/blog/${collectionName.split(".").pop()}/${documentId}`
  }
/>
```

---

## Programmatic Utilities (`@vicacha-devs/astro-tiptap-blocks/lib`)

```ts
import {
  parseTiptapContent,
  parseTiptapHtml,
  parseTiptapMarkdown,
  extractDocumentMetadata,
  extractPlainTextFromTiptap,
  calculateReadingTime,
  extractHeadingsFromTiptap,
  extractRelationsFromTiptap,
  parseInternalLinkUri,
  formatInternalLinkUri,
  resolveInternalLinkHref,
  resolveTiptapMediaUrl,
  sanitizeTiptapUrl,
  sanitizeTiptapIframeUrl,
  sanitizeCssColor,
  buildSafeInlineStyle,
  buildThemeObject,
  TiptapBlockThemeDefault,
} from "@vicacha-devs/astro-tiptap-blocks/lib";
```

## Customizing Theme & Extending with Custom Components

- **Theme & CSS (`theme.extend` / `theme.overwrite`)**: Customize Tailwind classes, replace slots with BEM/vanilla CSS, or style via `data-*` selectors. See **Guides / Customizing Theme & Styling** (`src/lib/theme/CustomizingTheme.docs.mdx`).
- **Custom Block Components (`blocks` prop)**: Override any built-in block renderer (`TiptapBlockUserComponents`) or render custom Tiptap extensions (`TiptapCustomBlockNode` in JSON/Markdown or `data-tiptap-type="<nodeName>"` in HTML) by passing the custom node `type` key in `blocks`. See **Guides / Extending & Custom Components** (`src/components/blocks/TiptapBlockCustom/ExtendingCustomComponents.docs.mdx`):

```astro
---
import { TiptapBlocks } from "@vicacha-devs/astro-tiptap-blocks";
import BeforeAfterSlider from "./BeforeAfterSlider.astro";
import CustomCallout from "./CustomCallout.astro";
import CustomHeading from "./CustomHeading.astro";
---

<TiptapBlocks
  data={articleContent}
  blocks={{
    heading: CustomHeading,
    informationPane: CustomCallout,
    beforeAfterSlider: BeforeAfterSlider,
  }}
/>
```

---

## Interactive Documentation & Testing

This repository includes a full TypeScript **Storybook for Astro** (`@storybook-astro/framework` + `@storybook/addon-docs` + `@storybook/addon-a11y` + themes, designs, RTL and tag badges) suite and **Vitest** unit/component tests for every `.astro` component and `src/lib/` module.

```bash
# Start Storybook dev server on http://localhost:6006
pnpm storybook

# Run Vitest unit & component tests with coverage
pnpm test:coverage

# Run every story as a browser test (first run: pnpm exec playwright install chromium)
pnpm test:stories

# Typecheck & build declaration files
pnpm check && pnpm build
```

---

## License

MIT © Vicacha Devs
