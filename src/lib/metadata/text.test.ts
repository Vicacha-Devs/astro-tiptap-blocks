import type { TiptapBlockNode } from "../../types";
import { blockNodesToText, inlineNodesToText } from "./text";

const p = (text: string): TiptapBlockNode => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

describe("text extraction (lib/metadata/text)", () => {
  it("flattens inline nodes including breaks, linkers and math", () => {
    expect(
      inlineNodesToText([
        { type: "text", text: "a" },
        { type: "hardBreak" },
        { type: "linker", attrs: { collectionName: "x", documentId: "1", label: "L", href: "strapi://x/1" } },
        { type: "mathematics", attrs: { latex: "x^2", displayMode: "inline" } },
      ])
    ).toBe("a\nLx^2");
    expect(inlineNodesToText(undefined)).toBe("");
  });

  it("returns an empty string for empty or non-array input", () => {
    expect(blockNodesToText(undefined)).toBe("");
    expect(blockNodesToText([])).toBe("");
  });

  it("extracts text from containers, details, lists, code, tables and math", () => {
    const blocks = [
      { type: "informationPane", attrs: { variant: "info", title: "Note" }, content: [p("body")] },
      { type: "blockquote", content: [p("quoted")] },
      {
        type: "details",
        content: [
          { type: "detailsSummary", content: [{ type: "text", text: "Sum" }] },
          { type: "detailsContent", content: [p("Hidden")] },
        ],
      },
      { type: "bulletList", content: [{ type: "listItem", content: [p("one")] }, { type: "listItem", content: [p("two")] }] },
      { type: "codeBlock", content: [{ type: "text", text: "const a = 1" }] },
      {
        type: "table",
        content: [{ type: "tableRow", content: [{ type: "tableCell", content: [p("cell")] }] }],
      },
      { type: "mathematics", attrs: { latex: " E=mc^2 ", displayMode: "block" } },
      { type: "horizontalRule" },
    ] as TiptapBlockNode[];

    expect(blockNodesToText(blocks)).toBe(
      "Note: body quoted Sum Hidden one two const a = 1 cell E=mc^2"
    );
  });
});
