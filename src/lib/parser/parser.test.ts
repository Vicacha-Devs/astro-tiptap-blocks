import { parseTiptapContent } from "./parser";

describe("parseTiptapContent (lib/parser)", () => {
  it("parses ProseMirror JSON doc and deduplicates auto-generated heading IDs across nested blocks", () => {
    const doc = parseTiptapContent({
      type: "doc",
      content: [
        { type: "tableOfContents" },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Overview" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Overview" }],
        },
        {
          type: "layoutContainer",
          attrs: { columns: "1:1" },
          content: [
            {
              type: "layoutColumn",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Overview" }],
                },
              ],
            },
          ],
        },
      ],
    });

    const toc = doc.content[0];
    expect(toc.type === "tableOfContents" && toc.attrs?.headings).toEqual([
      { id: "overview", text: "Overview", level: 2 },
      { id: "overview-2", text: "Overview", level: 2 },
      { id: "overview-3", text: "Overview", level: 3 },
    ]);
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
    expect(blockTypes.has("taskList")).toBe(true);
    expect(blockTypes.has("mathematics")).toBe(true);
    expect(blockTypes.has("pageBreak")).toBe(true);
  });

  it("normalizes fallback string[] paragraph arrays", () => {
    const doc = parseTiptapContent(["First paragraph", "Second paragraph"]);
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "First paragraph" }],
    });
  });

  it("preserves generic custom block nodes, strips event handlers/prototype keys, and sanitizes URL/srcset attributes", () => {
    const doc = parseTiptapContent(
      {
        type: "doc",
        content: [
          {
            type: "customWidget",
            attrs: {
              imageUrl: "/uploads/sample.jpg",
              imageSrcset: "/uploads/sample-1x.jpg 1x, javascript:alert(1) 2x",
              caption: "Custom block",
              onclick: "alert(1)",
              onerror: "alert(2)",
              constructor: "polluted",
            },
          },
          {
            type: "customWidget",
            attrs: {
              url: "javascript:alert(1)",
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
          imageSrcset: "https://cms.mezquitabogota.org/uploads/sample-1x.jpg 1x",
          caption: "Custom block",
        },
      },
    ]);
  });
});
