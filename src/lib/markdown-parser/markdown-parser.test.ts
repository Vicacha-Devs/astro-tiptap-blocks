import { isLikelyMarkdown, parseTiptapMarkdown } from "./markdown-parser";

describe("parseTiptapMarkdown (lib/markdown-parser)", () => {
  it("detects and parses extended Markdown (callouts, lead, math, task lists, media, and lossless tiptap-node metadata)", () => {
    const md = [
      "<!-- toc -->",
      "# Main Heading",
      "> **Lead:** Introductory lead paragraph",
      "> [!SUCCESS] Deployment Ready\n> Everything passed.",
      "- [x] Configure Tiptap\n- [ ] Deploy Astro",
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

const first = (md: string) => parseTiptapMarkdown(md).content[0];

describe("parseTiptapMarkdown block variants", () => {
  it("parses rules, code fences and block quotes", () => {
    expect(first("---").type).toBe("horizontalRule");
    expect(first("```ts\nconst a = 1;\n```")).toMatchObject({
      type: "codeBlock",
      attrs: { language: "ts" },
    });
    expect(first("> quoted text").type).toBe("blockquote");
    expect(first("> **Conversation History** *(Ana)*\n> hello")).toMatchObject({
      type: "conversationHistory",
      attrs: { author: "Ana" },
    });
  });

  it("parses lists and tables", () => {
    expect(first("- a\n- b").type).toBe("bulletList");
    expect(first("1. a\n2. b").type).toBe("orderedList");
    const table = first("| A | B |\n| - | - |\n| 1 | 2 |");
    expect(table.type).toBe("table");
    expect((table as { content: unknown[] }).content).toHaveLength(2);
  });

  it("parses media and images, dropping unsafe URLs", () => {
    expect(first("[Video: Demo](https://youtu.be/abc)")).toMatchObject({
      type: "video",
      attrs: { embedType: "embed" },
    });
    expect(first("[Audio: Song](https://example.com/a.mp3)").type).toBe("audio");
    expect(first("![alt](https://example.com/a.png)").type).toBe("image");
    expect(parseTiptapMarkdown("![x](javascript:alert)").content).toEqual([]);
    expect(parseTiptapMarkdown("[Video: x](javascript:alert)").content).toEqual([]);
  });

  it("parses inline marks, links, internal linkers and math", () => {
    const para = first(
      "**b** *i* ~~s~~ ==h== `c` [l](https://example.com) [r](tiptap://article/doc1) $x$"
    );
    const nodes = (para as { content: { type: string; marks?: { type: string }[] }[] }).content;
    const marks = nodes.flatMap((n) => n.marks?.map((m) => m.type) ?? []);
    expect(marks).toEqual(
      expect.arrayContaining(["bold", "italic", "strike", "highlight", "code", "link"])
    );
    expect(nodes.some((n) => n.type === "linker")).toBe(true);
    expect(nodes.some((n) => n.type === "mathematics")).toBe(true);
  });

  it("falls back to markdown when metadata JSON is invalid and handles HTML chunks", () => {
    expect(first("text\n<!-- tiptap-node:{bad} -->").type).toBe("paragraph");
    expect(first("<p>raw html</p>").type).toBe("paragraph");
  });
});
