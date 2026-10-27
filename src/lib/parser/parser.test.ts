import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseTiptapContent } from "./parser";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(
  currentDir,
  "../../../../strapi-plugin-tiptap-editor/fixtures/all-features-payload.json"
);

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

  it("parses the full Strapi all-features-payload.json and auto-populates Table of Contents", () => {
    const payload = JSON.parse(readFileSync(fixturePath, "utf-8"));
    const doc = parseTiptapContent(payload.content);

    const blockTypes = new Set<string>(doc.content.map((b) => b.type));
    for (const b of doc.content) {
      if ("content" in b && Array.isArray(b.content)) {
        for (const child of b.content) {
          if (child && typeof child === "object" && "type" in child) {
            blockTypes.add(child.type);
          }
        }
      }
    }
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
    expect(tocBlock?.type === "tableOfContents" && (tocBlock.attrs?.headings?.length ?? 0) > 5).toBe(
      true
    );
  });

  it("normalizes fallback string[] paragraph arrays", () => {
    const doc = parseTiptapContent(["First paragraph", "Second paragraph"]);
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "First paragraph" }],
    });
  });
});
