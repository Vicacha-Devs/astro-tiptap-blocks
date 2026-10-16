# Components (`src/components`)

Native Astro block and inline mark components for `@vicacha-devs/astro-tiptap-blocks`. Every component lives in its own folder alongside its TypeScript Storybook story (`*.stories.ts`) and Vitest DOM unit test (`*.test.ts`).

```text
components/
├── Overview.docs.mdx
├── TiptapBlocks/
│   ├── TiptapBlocks.astro
│   ├── TiptapBlocks.stories.ts
│   └── TiptapBlocks.test.ts
└── blocks/
    ├── TiptapBlockCallout/       # .astro + .stories.ts + .test.ts
    ├── TiptapBlockCode/          # .astro + .stories.ts + .test.ts
    ├── TiptapBlockColumns/       # .astro + .stories.ts + .test.ts
    ├── TiptapBlockCustom/        # .astro + .stories.ts + .test.ts
    ├── TiptapBlockDetails/       # .astro + .stories.ts + .test.ts
    ├── TiptapBlockHeading/       # .astro + .stories.ts + .test.ts
    ├── TiptapBlockHr/            # .astro + .stories.ts + .test.ts
    ├── TiptapBlockImage/         # .astro + .stories.ts + .test.ts
    ├── TiptapBlockList/          # .astro + .stories.ts + .test.ts
    ├── TiptapBlockMath/          # .astro + .stories.ts + .test.ts
    ├── TiptapBlockMedia/         # .astro + .stories.ts + .test.ts
    ├── TiptapBlockParagraph/     # .astro + .stories.ts + .test.ts
    ├── TiptapBlockQuote/         # .astro + .stories.ts + .test.ts
    ├── TiptapBlockTable/         # .astro + .stories.ts + .test.ts
    ├── TiptapBlockToc/           # .astro + .stories.ts + .test.ts
    ├── TiptapLibPreview/         # .astro + .test.ts
    └── items/
        ├── TiptapInlineNodes/    # .astro + .stories.ts + .test.ts
        ├── TiptapLinkItem/       # .astro + .stories.ts + .test.ts
        ├── TiptapNestedBlocks/   # .astro + .stories.ts + .test.ts
        └── TiptapTextItem/       # .astro + .stories.ts + .test.ts
```
