import { parseTiptapContent } from "./parser";

describe("parseTiptapContent (lib/parser)", () => {
  it("parses ProseMirror JSON doc and auto-generates heading id", () => {
    const doc = parseTiptapContent({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Welcome to Abu Bakr Mosque" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Visit our ", marks: [{ type: "bold" }] },
            {
              type: "text",
              text: "community page",
              marks: [{ type: "link", attrs: { href: "https://mezquitabogota.org/en" } }],
            },
          ],
        },
      ],
    });

    expect(doc.content).toHaveLength(2);
    expect(doc.content[0]).toEqual({
      type: "heading",
      attrs: { level: 2, id: "welcome-to-abu-bakr-mosque" },
      content: [{ type: "text", text: "Welcome to Abu Bakr Mosque" }],
    });
  });

  it("parses all extended Tiptap block types and auto-populates Table of Contents", () => {
    const doc = parseTiptapContent({
      type: "doc",
      content: [
        { type: "tableOfContents" },
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Section One" }],
        },
        {
          type: "leadParagraph",
          content: [{ type: "text", text: "Lead summary" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Section Two" }],
        },
        {
          type: "informationPane",
          attrs: { variant: "info", title: "Note" },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Callout" }] }],
        },
        {
          type: "conversationHistory",
          attrs: { author: "Admin" },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Message" }] }],
        },
        {
          type: "details",
          content: [
            { type: "detailsSummary", content: [{ type: "text", text: "Summary" }] },
            {
              type: "detailsContent",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }],
            },
          ],
        },
        {
          type: "layoutContainer",
          attrs: { columns: "1:1" },
          content: [
            {
              type: "layoutColumn",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Col 1" }] }],
            },
          ],
        },
        {
          type: "taskList",
          content: [
            {
              type: "taskItem",
              attrs: { checked: true },
              content: [{ type: "paragraph", content: [{ type: "text", text: "Done" }] }],
            },
          ],
        },
        {
          type: "mathematics",
          attrs: { latex: "E = mc^2", displayMode: "block" },
        },
        { type: "pageBreak" },
      ],
    });

    const blockTypes = new Set<string>(doc.content.map((b) => b.type));
    expect(blockTypes.has("tableOfContents")).toBe(true);
    expect(blockTypes.has("leadParagraph")).toBe(true);
    expect(blockTypes.has("informationPane")).toBe(true);
    expect(blockTypes.has("conversationHistory")).toBe(true);
    expect(blockTypes.has("details")).toBe(true);
    expect(blockTypes.has("layoutContainer")).toBe(true);
    expect(blockTypes.has("taskList")).toBe(true);
    expect(blockTypes.has("mathematics")).toBe(true);
    expect(blockTypes.has("pageBreak")).toBe(true);

    const tocBlock = doc.content.find((b) => b.type === "tableOfContents");
    expect(
      tocBlock?.type === "tableOfContents" && (tocBlock.attrs?.headings?.length ?? 0) === 2
    ).toBe(true);
  });

  it("normalizes fallback string[] paragraph arrays", () => {
    const doc = parseTiptapContent(["First paragraph", "Second paragraph"]);
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "First paragraph" }],
    });
  });

  it("preserves generic custom block nodes and sanitizes URL attributes", () => {
    const doc = parseTiptapContent(
      {
        type: "doc",
        content: [
          {
            type: "customWidget",
            attrs: {
              imageUrl: "/uploads/sample.jpg",
              caption: "Custom block",
            },
          },
          {
            type: "customWidget",
            attrs: {
              imageUrl: "javascript:alert(1)",
            },
          },
        ],
      },
      { mediaBaseUrl: "https://cms.mezquitabogota.org" }
    );
    expect(doc.content).toEqual([
      {
        type: "customWidget",
        attrs: {
          imageUrl: "https://cms.mezquitabogota.org/uploads/sample.jpg",
          caption: "Custom block",
        },
      },
    ]);
  });
});
