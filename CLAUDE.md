# CLAUDE.md — `@vicacha-devs/astro-tiptap-blocks`

## Project Overview

`@vicacha-devs/astro-tiptap-blocks` is a standalone Astro component library inspired by VirtusLab's `@sensinum/astro-strapi-blocks`, designed to render **Tiptap / ProseMirror** rich text content (including all extended features from `@notum-cz/strapi-plugin-tiptap-editor` in JSON, HTML, and Markdown formats) using native, themeable Astro components without `set:html`.

---

## Architecture & Directory Layout

- `src/index.ts` & `src/index.d.ts` — Package entrypoints exporting `TiptapBlocks`, parser/theme/relation utilities, and TypeScript definitions.
- `src/types/` —
  - `tiptap-inline.ts`: Inline marks (`bold`, `italic`, `underline`, `strike`, `code`, `subscript`, `superscript`, `highlight`, `link`, `textStyle`, `abbr`, `language`), inline nodes (`text`, `hardBreak`, `linker`, `mathematics`), and `TiptapInternalLinkResolver`.
  - `tiptap.ts`: Block AST definitions (`heading`, `paragraph`, `leadParagraph`, `blockquote`, `informationPane`, `conversationHistory`, `details`, `layoutContainer`, `bulletList`, `orderedList`, `taskList`, `codeBlock`, `image`, `video`, `audio`, `attachment`, `iframe`, `mathematics`, `tableOfContents`, `pageBreak`, `horizontalRule`, `table`), `TiptapDocNode`, `TiptapContentInput`, and `TiptapParserOptions`.
  - `theme.ts`: Theme configuration types (`TiptapBlockTheme`, `TiptapBlockUserTheme` with `extend` and `overwrite`).
  - `custom.ts`: Custom Astro block override map (`TiptapBlockUserComponents`).
  - `common.ts`: `DeepPartial<T>` helper.
- `src/lib/` —
  - `parser.ts`: `parseTiptapContent(input, options?)` normalizing ProseMirror JSON, serialized JSON strings, Tiptap HTML strings, Tiptap Markdown strings, and `string[]` arrays into a sanitized `TiptapDocNode` with auto-populated heading anchor IDs and Table of Contents items.
  - `html-inline.ts`, `html-custom-blocks.ts`, `html-parser.ts`: Pure TypeScript HTML tokenizer and tree builder (`parseTiptapHtml`) converting standard and extended Tiptap HTML elements into ProseMirror AST nodes and inline marks.
  - `markdown-parser.ts`: Pure TypeScript Markdown parser (`parseTiptapMarkdown`) supporting standard Markdown, Edifice/Strapi callout/lead/math/media syntax, and lossless `<!-- tiptap-node:{...} -->` metadata comments.
  - `relations.ts`: `extractRelationsFromTiptap`, `parseStrapiLinkUri`, `formatStrapiLinkUri`, and `resolveStrapiLinkHref` for Strapi Media Library assets and `strapi://collection/documentId` internal links.
  - `sanitize.ts`: `sanitizeTiptapUrl`, `sanitizeTiptapIframeUrl`, `sanitizeCssColor`, `buildSafeInlineStyle`, `slugifyHeadingText`, `formatFileSize`, `formatLatexPreview`, and `decodeHtmlEntities`.
  - `theme.ts`: `TiptapBlockThemeDefault`, `buildThemeObject`, `getPropertyClass`, and `renderPropertyClasses`.
- `src/components/` —
  - `TiptapBlocks.astro`: Root component accepting `data`, `theme`, `blocks`, `class`, `allowedIframeDomains`, and `resolveInternalLink`.
  - `blocks/`: Single-responsibility block components (`TiptapBlockHeading`, `TiptapBlockParagraph`, `TiptapBlockQuote`, `TiptapBlockCallout`, `TiptapBlockDetails`, `TiptapBlockColumns`, `TiptapBlockList`, `TiptapBlockCode`, `TiptapBlockImage`, `TiptapBlockMedia`, `TiptapBlockMath`, `TiptapBlockToc`, `TiptapBlockTable`, `TiptapBlockHr`, `TiptapBlockCustom`).
  - `blocks/items/`: Inline and nested block renderers (`TiptapInlineNodes`, `TiptapTextItem`, `TiptapLinkItem`, `TiptapNestedBlocks`).

---

## Engineering & Security Rules

1. **Zero `set:html` / `innerHTML`**:
   - Never use `set:html` in any `.astro` component or `innerHTML` in any script. All content must be parsed into `TiptapDocNode` and rendered through native Astro template expressions (`{text}`).
2. **Strict URL & CSS Validation**:
   - Every external or user-supplied URL rendered in `href` or `src` must pass through `sanitizeTiptapUrl()` (and `sanitizeTiptapIframeUrl()` for `<iframe>` embeds). All inline style values must pass through `sanitizeCssColor` / `buildSafeInlineStyle`.
3. **Single-Responsibility Modularity**:
   - Keep all components and modules concise and decoupled (`< 200` lines per file).
