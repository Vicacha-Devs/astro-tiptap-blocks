# Components (`src/components`)

Native Astro block and inline mark components for `@vicacha-devs/astro-tiptap-blocks`.

```text
components/
├── TiptapBlocks.astro                  # Main entry component (normalizes data, builds theme, dispatches blocks)
└── blocks/
    ├── TiptapBlockCustom.astro         # Renders user-supplied custom Astro component overrides
    ├── TiptapBlockHeading.astro        # Renders <h1> through <h6> blocks
    ├── TiptapBlockParagraph.astro      # Renders <p> blocks
    ├── TiptapBlockQuote.astro          # Renders <blockquote> blocks
    ├── TiptapBlockList.astro           # Renders <ul> and <ol> lists (including nested sub-lists)
    ├── TiptapBlockCode.astro           # Renders <pre><code> blocks with per-line <span> elements
    ├── TiptapBlockImage.astro          # Renders <figure><img><figcaption> blocks with URL sanitization
    ├── TiptapBlockTable.astro          # Renders <table><thead><tbody><tr><th>/<td> blocks
    ├── TiptapBlockHr.astro             # Renders <hr /> dividers
    └── items/
        ├── TiptapInlineNodes.astro     # Iterates inline nodes (text, link marks, hardBreak)
        ├── TiptapTextItem.astro        # Applies bold, italic, underline, strike, code, highlight marks
        └── TiptapLinkItem.astro        # Renders sanitized <a> tags with rel="noopener noreferrer"
```
