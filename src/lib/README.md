# Core Library (`src/lib`)

Parsing, sanitization, Strapi relation extraction, document metadata/reading-time analysis, and theme resolution utilities for `@vicacha-devs/astro-tiptap-blocks`. Every library module lives in its own dedicated folder containing its implementation (`<module>.ts` + `index.ts`), TypeScript Storybook story (`<module>.stories.ts`), and Vitest unit test (`<module>.test.ts`).

```text
lib/
├── index.ts                      # Barrel export for parser, html-parser, markdown-parser, metadata, relations, sanitize, and theme
├── parser/                       # parseTiptapContent() (parser.ts, index.ts, parser.stories.ts, parser.test.ts)
├── html-parser/                  # parseTiptapHtml() (html-parser.ts, html-inline.ts, html-custom-blocks.ts, index.ts, html-parser.stories.ts, html-parser.test.ts)
├── markdown-parser/              # parseTiptapMarkdown() (markdown-parser.ts, index.ts, markdown-parser.stories.ts, markdown-parser.test.ts)
├── metadata/                     # extractPlainTextFromTiptap(), calculateReadingTime(), extractHeadingsFromTiptap(), extractDocumentMetadata()
├── relations/                    # extractRelationsFromTiptap() (relations.ts, index.ts, relations.stories.ts, relations.test.ts)
├── sanitize/                     # URL, media base URL, iframe, CSS color, and LaTeX sanitizers (sanitize.ts, index.ts, sanitize.stories.ts, sanitize.test.ts)
└── theme/                        # TiptapBlockThemeDefault & buildThemeObject() (theme.ts, index.ts, theme.stories.ts, theme.test.ts)
```
