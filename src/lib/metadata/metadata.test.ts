import {
  calculateReadingTime,
  extractDocumentMetadata,
  extractHeadingsFromTiptap,
  extractPlainTextFromTiptap,
} from "./metadata";

describe("metadata utilities (lib/metadata)", () => {
  const sampleDoc = {
    type: "doc" as const,
    content: [
      {
        type: "heading" as const,
        attrs: { level: 1 as const },
        content: [{ type: "text" as const, text: "Introduction to Astro Tiptap Blocks" }],
      },
      {
        type: "leadParagraph" as const,
        content: [
          {
            type: "text" as const,
            text: "A zero-JS Astro component library for rendering Strapi Tiptap rich text safely.",
          },
        ],
      },
      {
        type: "layoutContainer" as const,
        attrs: { columns: "1:1" },
        content: [
          {
            type: "layoutColumn" as const,
            content: [
              {
                type: "heading" as const,
                attrs: { level: 2 as const },
                content: [{ type: "text" as const, text: "Nested Column Heading" }],
              },
              {
                type: "paragraph" as const,
                content: [{ type: "text" as const, text: "Column body content." }],
              },
            ],
          },
        ],
      },
    ],
  };

  it("extracts plain text and word-boundary SEO excerpts", () => {
    const text = extractPlainTextFromTiptap(sampleDoc);
    expect(text).toContain("Introduction to Astro Tiptap Blocks");
    expect(text).toContain("Column body content.");

    const excerpt = extractPlainTextFromTiptap(sampleDoc, { maxLength: 60 });
    expect(excerpt.length).toBeLessThanOrEqual(61);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("calculates reading time and extracts top-level and nested headings", () => {
    const rt = calculateReadingTime(sampleDoc, 200);
    expect(rt.words).toBeGreaterThan(15);
    expect(rt.minutes).toBe(1);
    expect(rt.text).toBe("1 min read");

    const headings = extractHeadingsFromTiptap(sampleDoc);
    expect(headings).toEqual([
      {
        id: "introduction-to-astro-tiptap-blocks",
        text: "Introduction to Astro Tiptap Blocks",
        level: 1,
      },
      {
        id: "nested-column-heading",
        text: "Nested Column Heading",
        level: 2,
      },
    ]);

    const h2Only = extractHeadingsFromTiptap(sampleDoc, { minLevel: 2, maxLevel: 3 });
    expect(h2Only).toHaveLength(1);
    expect(h2Only[0].level).toBe(2);
  });

  it("returns full document metadata in a single call", () => {
    const meta = extractDocumentMetadata(sampleDoc, { excerptLength: 50 });
    expect(meta.plainText).toContain("Introduction to Astro Tiptap Blocks");
    expect(meta.excerpt.endsWith("…")).toBe(true);
    expect(meta.readingTime.minutes).toBe(1);
    expect(meta.headings).toHaveLength(2);
    expect(meta.relations).toEqual({
      mediaIds: [],
      mediaDocumentIds: [],
      mediaAssets: [],
      internalLinks: [],
      linksByCollection: {},
    });
  });
});
