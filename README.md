# `@vicacha-devs/astro-tiptap-blocks`

Render **Tiptap / ProseMirror** rich text content (including [`@notum-cz/strapi-plugin-tiptap-editor`](https://github.com/notum-cz/strapi-plugin-tiptap-editor)) using native, themeable **Astro** block components — inspired by [`@sensinum/astro-strapi-blocks`](https://github.com/VirtusLab-Open-Source/astro-strapi-blocks).

> **Astro compatibility:** `^5.0.0 || ^6.0.0 || ^7.0.0`

---

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Supported Input Formats](#supported-input-formats)
- [Theme Customization](#theme-customization)
- [Custom Block Components](#custom-block-components)
- [Programmatic Utilities](#programmatic-utilities)
- [Security & XSS Prevention](#security--xss-prevention)
- [Development & Testing](#development--testing)
- [License](#license)

---

## Features

- **Zero `set:html` / `innerHTML` Rendering** — Every block (`heading`, `paragraph`, `blockquote`, `bulletList`, `orderedList`, `codeBlock`, `image`, `table`, `horizontalRule`) and inline mark (`bold`, `italic`, `underline`, `strike`, `code`, `highlight`, `link`) is rendered through native Astro components.
- **Multi-Format Input Normalization** — Seamlessly accepts:
  - ProseMirror JSON document (`{ type: "doc", content: [...] }`)
  - Array of `TiptapBlockNode[]`
  - Serialized JSON strings
  - Tiptap HTML strings (e.g. default output from `@notum-cz/strapi-plugin-tiptap-editor`)
  - Plain `string[]` paragraph arrays (fallback/mock content)
- **Tailwind CSS Theme Engine** — Built-in `TiptapBlockThemeDefault` with `theme={{ extend, overwrite }}` API matching `@sensinum/astro-strapi-blocks`.
- **Pluggable Custom Astro Components** — Override any block renderer (`heading`, `paragraph`, `quote`, `list`, `code`, `image`, `table`, `hr`) via the `blocks` prop.
- **Strict URL & Attribute Sanitization** — Automatically strips `<script>`, `<iframe>`, `<object>`, `<embed>`, and blocks `javascript:`, `vbscript:`, and `data:` schemes on links and images while enforcing `rel="noopener noreferrer"` on `target="_blank"` links.

---

## Requirements

| Dependency | Version |
| :--- | :--- |
| `astro` | `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0` |
| `tailwindcss` | `^3.0.0 \|\| ^4.0.0` *(optional — recommended for default theme classes)* |
| Node.js | `>= 20` |

---

## Installation

```bash
pnpm add @vicacha-devs/astro-tiptap-blocks
```

If using **Tailwind CSS**, ensure Tailwind scans the package's default theme classes:

### Tailwind CSS v4 (`@tailwindcss/vite`)

```css
/* src/styles/global.css */
@import "tailwindcss";
@source "../../node_modules/@vicacha-devs/astro-tiptap-blocks/src/**/*.{astro,ts}";
```

### Tailwind CSS v3 (`tailwind.config.mjs`)

```js
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}",
    "./node_modules/@vicacha-devs/astro-tiptap-blocks/src/**/*.{astro,ts}",
  ],
};
```

---

## Architecture

```text
src/
├── index.ts                              # Package entrypoint (exports TiptapBlocks, lib, types)
├── index.d.ts                            # TypeScript declarations
├── components/
│   ├── TiptapBlocks.astro                # Root orchestrator component
│   └── blocks/
│       ├── TiptapBlockCustom.astro       # Dynamic custom block wrapper
│       ├── TiptapBlockHeading.astro      # <h1> – <h6> renderer
│       ├── TiptapBlockParagraph.astro    # <p> renderer
│       ├── TiptapBlockQuote.astro        # <blockquote> renderer
│       ├── TiptapBlockList.astro         # <ul> / <ol> renderer (with nested list support)
│       ├── TiptapBlockCode.astro         # <pre><code> renderer with per-line spans
│       ├── TiptapBlockImage.astro        # <figure><img><figcaption> renderer
│       ├── TiptapBlockTable.astro        # <table><thead><tbody> renderer
│       ├── TiptapBlockHr.astro           # <hr /> renderer
│       └── items/
│           ├── TiptapInlineNodes.astro   # Dispatches text, link, and hardBreak nodes
│           ├── TiptapTextItem.astro      # Renders bold, italic, underline, strike, code, highlight
│           └── TiptapLinkItem.astro      # Renders sanitized <a> tags with rel="noopener noreferrer"
├── lib/
│   ├── parser.ts                         # Normalizes JSON, HTML, or string[] into TiptapDocNode
│   ├── html-parser.ts                    # Pure TypeScript HTML-to-ProseMirror AST parser
│   ├── sanitize.ts                       # URL protocol validator & HTML entity decoder
│   └── theme.ts                          # TiptapBlockThemeDefault & buildThemeObject()
└── types/
    ├── common.ts                         # DeepPartial<T> utility type
    ├── custom.ts                         # TiptapBlockUserComponents
    ├── theme.ts                          # TiptapBlockTheme & TiptapBlockUserTheme
    └── tiptap.ts                         # ProseMirror / Tiptap AST node & mark types
```

---

## Quick Start

```astro
---
import { TiptapBlocks } from "@vicacha-devs/astro-tiptap-blocks";

const articleContent = `
  <h2>Welcome to Our Community</h2>
  <p>We provide <strong>daily educational programs</strong> and <a href="/services">community services</a>.</p>
  <ul>
    <li>Guided visits</li>
    <li>Cultural dialogue</li>
  </ul>
`;
---

<TiptapBlocks data={articleContent} />
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
  sanitizeTiptapUrl,
  buildThemeObject,
  getPropertyClass,
  renderPropertyClasses,
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
