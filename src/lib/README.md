# Core Library (`src/lib`)

Parsing, sanitization, and theme resolution utilities for `@vicacha-devs/astro-tiptap-blocks`.

```text
lib/
├── index.ts                # Barrel export for parser, html-parser, sanitize, and theme
├── parser.ts               # parseTiptapContent() — normalizes JSON, HTML, or string[] into TiptapDocNode
├── html-parser.ts          # parseTiptapHtml() — pure TypeScript HTML-to-ProseMirror AST parser
├── sanitize.ts             # sanitizeTiptapUrl() & decodeHtmlEntities()
├── theme.ts                # TiptapBlockThemeDefault, buildThemeObject(), renderPropertyClasses()
└── __tests__/
    ├── parser.test.ts      # Unit & security PoC tests for AST parsing and XSS neutralization
    └── theme.test.ts       # Unit tests for theme extend/overwrite merging
```
