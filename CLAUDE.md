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
  - `Types.docs.mdx`: Storybook MDX documentation for all TypeScript AST and theme types.
- `src/lib/` — Organized into dedicated module folders (`<module>/<module>.ts`, `index.ts`, `<module>.stories.ts`, `<module>.test.ts`):
  - `parser/`: `parseTiptapContent(input, options?)` normalizing ProseMirror JSON, serialized JSON strings, Tiptap HTML strings, Tiptap Markdown strings, and `string[]` arrays into a sanitized `TiptapDocNode`.
  - `html-parser/`: Pure TypeScript HTML tokenizer and tree builder (`html-inline.ts`, `html-custom-blocks.ts`, `html-parser.ts`, `html-parser.stories.ts`, `html-parser.test.ts`).
  - `markdown-parser/`: Pure TypeScript Markdown parser (`markdown-parser.ts`, `markdown-parser.stories.ts`, `markdown-parser.test.ts`) supporting callouts, math, checklists, tables, and lossless `<!-- tiptap-node:{...} -->` metadata comments.
  - `relations/`: `extractRelationsFromTiptap`, `parseStrapiLinkUri`, `formatStrapiLinkUri`, and `resolveStrapiLinkHref` (`relations.ts`, `relations.stories.ts`, `relations.test.ts`).
  - `sanitize/`: `sanitizeTiptapUrl`, `sanitizeTiptapIframeUrl`, `sanitizeCssColor`, `buildSafeInlineStyle`, `slugifyHeadingText`, `formatFileSize`, `formatLatexPreview`, and `decodeHtmlEntities` (`sanitize.ts`, `sanitize.stories.ts`, `sanitize.test.ts`).
  - `theme/`: `TiptapBlockThemeDefault`, `buildThemeObject`, `getPropertyClass`, and `renderPropertyClasses` (`theme.ts`, `theme.stories.ts`, `theme.test.ts`).
- `src/components/` — Organized into dedicated component folders (`<Name>/<Name>.astro`, `<Name>.stories.ts`, `<Name>.test.ts`):
  - `TiptapBlocks/`: Root orchestrator (`TiptapBlocks.astro`, `TiptapBlocks.stories.ts`, `TiptapBlocks.test.ts`).
  - `blocks/`: Block component folders (`TiptapBlockHeading/`, `TiptapBlockParagraph/`, `TiptapBlockQuote/`, `TiptapBlockCallout/`, `TiptapBlockDetails/`, `TiptapBlockColumns/`, `TiptapBlockList/`, `TiptapBlockCode/`, `TiptapBlockImage/`, `TiptapBlockMedia/`, `TiptapBlockMath/`, `TiptapBlockToc/`, `TiptapBlockTable/`, `TiptapBlockHr/`, `TiptapBlockCustom/`, `TiptapLibPreview/`).
  - `blocks/items/`: Inline and nested block component folders (`TiptapInlineNodes/`, `TiptapTextItem/`, `TiptapLinkItem/`, `TiptapNestedBlocks/`).
- `src/utils/test.helpers.ts` & `vitest.config.ts` — Astro Container + `happy-dom` + `@testing-library/dom` test helper (`renderAstroComponentToDom`) and Vitest configuration.
- `.storybook/` —
  - `.storybook/main.ts` & `.storybook/preview.ts`: TypeScript Storybook configuration powered by `defineMain` and `definePreview` from `@storybook-astro/framework` and `@storybook/addon-docs`.

---

## Engineering & Security Rules

1. **Zero `set:html` / `innerHTML`**:
   - Never use `set:html` in any `.astro` component or `innerHTML` in any script. All content must be parsed into `TiptapDocNode` and rendered through native Astro template expressions (`{text}`).
2. **Strict URL & CSS Validation**:
   - Every external or user-supplied URL rendered in `href` or `src` must pass through `sanitizeTiptapUrl()` (and `sanitizeTiptapIframeUrl()` for `<iframe>` embeds). All inline style values must pass through `sanitizeCssColor` / `buildSafeInlineStyle`.
3. **Single-Responsibility Modularity & Folder Colocation**:
   - Keep every component and library module in its own folder with its implementation, `.stories.ts`, and `.test.ts`, and keep every file `< 200` lines.
4. **Component Prop & Starlight/Mosque JSDoc Documentation**:
   - Every `.astro` component must include a top-level JSDoc block (`@component`, `@title`, `@description`, `@preview`, `@usage`, `@examples`) above `export interface Props` and per-prop `/** ... */` JSDoc comments (with `@default` tags) so `@storybook-astro/framework` docgen populates Storybook's `autodocs` tables.
