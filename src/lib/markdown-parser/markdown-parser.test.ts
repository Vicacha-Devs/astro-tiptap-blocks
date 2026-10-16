import { isLikelyMarkdown, parseTiptapMarkdown } from "./markdown-parser";

describe("parseTiptapMarkdown (lib/markdown-parser)", () => {
  it("detects and parses extended Markdown (callouts, lead, math, task lists, media, and lossless tiptap-node metadata)", () => {
    const md = [
      "<!-- toc -->",
      "# Main Heading",
      "> **Lead:** Introductory lead paragraph",
      "> [!SUCCESS] Deployment Ready\n> Everything passed.",
      "- [x] Configure Strapi\n- [ ] Deploy Astro",
      "$$\n\\int_0^\\infty e^{-x^2} dx\n$$",
      "[Attachment: guide.pdf](https://example.com/guide.pdf)",
      "<!-- pagebreak -->",
      'Fallback text\n<!-- tiptap-node:{"type":"conversationHistory","attrs":{"author":"Editor","timestamp":"2026-04-15"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Reviewed and approved."}]}]} -->',
    ].join("\n\n");

    expect(isLikelyMarkdown(md)).toBe(true);
    const doc = parseTiptapMarkdown(md);
    expect(doc.content.map((b) => b.type)).toEqual([
      "tableOfContents",
      "heading",
      "leadParagraph",
      "informationPane",
      "taskList",
      "mathematics",
      "attachment",
      "pageBreak",
      "conversationHistory",
    ]);
  });
});
