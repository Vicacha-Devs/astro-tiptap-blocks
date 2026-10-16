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

## Supported Input Formats

`<TiptapBlocks data={...} />` accepts `TiptapContentInput`:

1. **ProseMirror JSON Document (`TiptapDocNode`)**:
   ```ts
   const doc = {
     type: "doc",
     content: [
       {
         type: "heading",
         attrs: { level: 2 },
         content: [{ type: "text", text: "Section Title" }],
       },
       {
         type: "paragraph",
         content: [
           { type: "text", text: "Important ", marks: [{ type: "bold" }] },
           { type: "text", text: "announcement." },
         ],
       },
     ],
   };
   ```
2. **Tiptap HTML String**:
   - Standard HTML output produced by `@notum-cz/strapi-plugin-tiptap-editor` (`<h2>...</h2><p>...</p><table>...</table>`).
3. **Serialized JSON String**:
   - JSON string representation of a `TiptapDocNode` or `TiptapBlockNode[]`.
4. **Paragraph String Array (`string[]`)**:
   - Array of plain text strings automatically converted into `<p>` blocks.

---

## Theme Customization

You can customize the CSS classes applied to every block and inline mark using the `theme` prop:

- **`theme.extend`**: Appends your classes to `TiptapBlockThemeDefault`.
- **`theme.overwrite`**: Replaces the default classes for the specified properties.

Each property accepts a `string` or `string[]`.

```astro
---
import { TiptapBlocks, type TiptapBlockUserTheme } from "@vicacha-devs/astro-tiptap-blocks";

const customTheme: TiptapBlockUserTheme = {
  overwrite: {
    quote: {
      default: "border-s-4 border-emerald-600 ps-4 italic my-6 text-slate-700",
    },
  },
  extend: {
    default: "space-y-4 text-slate-600 dark:text-slate-300",
    heading: {
      default: "font-serif text-slate-900 dark:text-white",
      h2: "text-2xl font-extrabold",
    },
    paragraph: {
      link: "text-emerald-700 font-semibold hover:text-emerald-900",
    },
  },
};
---

<TiptapBlocks data={content} theme={customTheme} />
```

### Default Theme Structure (`TiptapBlockThemeDefault`)

| Block Key | Sub-keys | Description |
| :--- | :--- | :--- |
| `default` | — | Root wrapper `<div>` classes |
| `heading` | `default`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6` | Heading tags `<h1>` – `<h6>` |
| `paragraph` | `default`, `link`, `bold`, `italic`, `underline`, `strikethrough`, `code`, `highlight` | Paragraph `<p>` and inline mark classes |
| `quote` | `default` | `<blockquote>` container |
| `list` | `default`, `ordered`, `unordered`, `item` | `<ol>`, `<ul>`, and `<li>` elements |
| `code` | `default`, `line` | `<pre><code>` block and per-line `<span>` |
| `image` | `default`, `image`, `caption` | `<figure>`, `<img>`, and `<figcaption>` |
| `table` | `default`, `head`, `body`, `row`, `headerCell`, `cell` | `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` |
| `hr` | `default` | `<hr />` divider |

---

## Custom Block Components

Pass custom Astro components via the `blocks` prop to completely replace the rendering of specific block types (`heading`, `paragraph`, `quote`, `list`, `code`, `image`, `table`, `hr`). Your component receives all AST node properties (`type`, `attrs`, `content`) plus the resolved `theme` object.

```astro
---
// src/components/CustomCalloutQuote.astro
import { TiptapBlockParagraph, type TiptapBlockquoteNode, type TiptapBlockTheme } from "@vicacha-devs/astro-tiptap-blocks";

interface Props extends TiptapBlockquoteNode {
  theme: TiptapBlockTheme;
}

const { content = [], theme } = Astro.props;
---

<aside class="rounded-2xl bg-amber-50/80 border border-amber-200 p-6 my-6">
  {content.map((block) => block.type === "paragraph" && <p class="italic text-amber-950">{block.content?.map((n) => n.type === "text" ? n.text : "")}</p>)}
</aside>
```

```astro
---
import { TiptapBlocks } from "@vicacha-devs/astro-tiptap-blocks";
import CustomCalloutQuote from "./CustomCalloutQuote.astro";
---

<TiptapBlocks
  data={content}
  blocks={{
    quote: CustomCalloutQuote,
  }}
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

- **`parseTiptapContent(input)`**: Normalizes any `TiptapContentInput` into a sanitized `TiptapDocNode`.
- **`parseTiptapHtml(html)`**: Converts a Tiptap HTML string into a `TiptapDocNode` AST.
- **`sanitizeTiptapUrl(url)`**: Validates URLs against safe schemes (`http:`, `https:`, `mailto:`, `tel:`, relative paths) and returns `"#"` for unsafe schemes.
- **`buildThemeObject(userTheme, defaultTheme?)`**: Merges `overwrite` and `extend` theme configurations.

---

## Security & XSS Prevention

1. **No Raw HTML Injection**: Unlike `set:html` or `dangerouslySetInnerHTML`, `<TiptapBlocks />` parses inputs into a typed AST and renders text nodes via Astro's auto-escaped `{text}` expressions.
2. **Dangerous Container Stripping**: `<script>`, `<style>`, `<iframe>`, `<object>`, and `<embed>` tags and their contents are stripped during tokenization.
3. **Strict URL Protocol Allow-List**: `sanitizeTiptapUrl` strips control characters and rejects `javascript:`, `vbscript:`, and `data:` URLs in both `<a href>` and `<img src>`.
4. **Reverse Tabnabbing Protection**: `<TiptapLinkItem />` automatically enforces `rel="noopener noreferrer"` when `target="_blank"` is set.

---

## Development & Testing

```bash
# Run unit & security PoC tests
pnpm test
```

---

## License

MIT © Vicacha Devs
