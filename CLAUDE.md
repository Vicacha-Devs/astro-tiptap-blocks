# CLAUDE.md — `@vicacha-devs/astro-tiptap-blocks`

## Project Overview

`@vicacha-devs/astro-tiptap-blocks` is a standalone Astro component library inspired by VirtusLab's `@sensinum/astro-strapi-blocks`, designed to render **Tiptap / ProseMirror** rich text content (including `@notum-cz/strapi-plugin-tiptap-editor` HTML and ProseMirror JSON AST) using native, themeable Astro components without `set:html`.

---

## Architecture & Directory Layout

- `src/index.ts` & `src/index.d.ts` — Package entrypoints exporting `TiptapBlocks`, parser/theme utilities, and TypeScript definitions.
- `src/types/` —
  - `tiptap.ts`: ProseMirror / Tiptap AST definitions (`TiptapDocNode`, `TiptapBlockNode`, `TiptapInlineNode`, `TiptapMark`, `TiptapContentInput`).
  - `theme.ts`: Theme configuration types (`TiptapBlockTheme`, `TiptapBlockUserTheme` with `extend` and `overwrite`).
  - `custom.ts`: Custom Astro block override map (`TiptapBlockUserComponents`).
  - `common.ts`: `DeepPartial<T>` helper.
- `src/lib/` —
  - `parser.ts`: `parseTiptapContent(input)` normalizing ProseMirror JSON, serialized JSON strings, Tiptap HTML strings, and `string[]` arrays into a sanitized `TiptapDocNode`.
  - `html-parser.ts`: Pure TypeScript HTML tokenizer and tree builder (`parseTiptapHtml`) converting HTML tags into ProseMirror AST nodes and inline marks.
  - `sanitize.ts`: `sanitizeTiptapUrl` (protocol allow-list blocking `javascript:`, `vbscript:`, `data:`) and `decodeHtmlEntities`.
  - `theme.ts`: `TiptapBlockThemeDefault`, `buildThemeObject`, `getPropertyClass`, and `renderPropertyClasses`.
- `src/components/` —
  - `TiptapBlocks.astro`: Root component accepting `data`, `theme`, `blocks`, and `class`.
  - `blocks/`: Single-responsibility block components (`TiptapBlockHeading`, `TiptapBlockParagraph`, `TiptapBlockQuote`, `TiptapBlockList`, `TiptapBlockCode`, `TiptapBlockImage`, `TiptapBlockTable`, `TiptapBlockHr`, `TiptapBlockCustom`).
  - `blocks/items/`: Inline node renderers (`TiptapInlineNodes`, `TiptapTextItem`, `TiptapLinkItem`).

---

## Engineering & Security Rules

1. **Zero `set:html` / `innerHTML`**:
   - Never use `set:html` in any `.astro` component or `innerHTML` in any script. All content must be parsed into `TiptapDocNode` and rendered through native Astro template expressions (`{text}`).
2. **Strict URL Validation**:
   - Every external or user-supplied URL rendered in `href` or `src` must pass through `sanitizeTiptapUrl()`.
3. **Single-Responsibility Modularity**:
   - Keep all components and modules concise and decoupled (`< 200` lines per file).
