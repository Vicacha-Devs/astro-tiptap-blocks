import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapNestedBlocks from "./TiptapNestedBlocks.astro";

describe("TiptapNestedBlocks", () => {
  it("renders nested heading, paragraph, and codeBlock nodes", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapNestedBlocks, {
      props: {
        blocks: [
          {
            type: "heading",
            attrs: { level: 4 },
            content: [{ type: "text", text: "Nested Heading" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Nested body text" }],
          },
          {
            type: "codeBlock",
            attrs: { language: "json" },
            content: [{ type: "text", text: '{"ok":true}' }],
          },
        ],
      },
    });

    try {
      expect(getByRole(root, "heading", { level: 4, name: "Nested Heading" })).toBeInTheDocument();
      expect(getByText(root, "Nested body text")).toBeInTheDocument();
      expect(root.querySelector('pre[data-language="json"]')).not.toBeNull();
    } finally {
      await close();
    }
  });
});

describe("TiptapNestedBlocks remaining block types", () => {
  it("renders lists, rules, blockquotes and ignores unsupported nodes", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapNestedBlocks, {
      props: {
        blocks: [
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "item" }] }],
              },
            ],
          },
          { type: "horizontalRule" },
          {
            type: "blockquote",
            content: [{ type: "paragraph", content: [{ type: "text", text: "quoted" }] }],
          },
          { type: "pageBreak" },
        ],
      },
    });

    try {
      expect(root.querySelector("ul li")?.textContent).toContain("item");
      expect(root.querySelector("hr")).not.toBeNull();
      expect(root.querySelector("blockquote")?.textContent).toContain("quoted");
    } finally {
      await close();
    }
  });

  it("renders nested media, callouts, details, tables, and math with propagated resolver props", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapNestedBlocks, {
      props: {
        mediaBaseUrl: "https://cdn.example.com",
        headingAnchors: true,
        blocks: [
          {
            type: "leadParagraph",
            content: [{ type: "text", text: "Lead nested" }],
          },
          {
            type: "image",
            attrs: { src: "/uploads/pic.jpg", alt: "Nested pic" },
          },
          {
            type: "audio",
            attrs: { src: "/uploads/sound.mp3", title: "Sound" },
          },
          {
            type: "mathematics",
            attrs: { latex: "E = mc^2", display: "block" },
          },
          {
            type: "informationPane",
            attrs: { variant: "info", title: "Note" },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Inside pane" }] }],
          },
          {
            type: "conversationHistory",
            attrs: { author: "Admin" },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Chat line" }] }],
          },
          {
            type: "details",
            attrs: { open: true },
            content: [
              { type: "detailsSummary", content: [{ type: "text", text: "More" }] },
              {
                type: "detailsContent",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Hidden" }] }],
              },
            ],
          },
          {
            type: "table",
            content: [
              {
                type: "tableRow",
                content: [
                  {
                    type: "tableCell",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Cell 1" }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    try {
      expect(getByText(root, "Lead nested")).toBeInTheDocument();
      expect(root.querySelector("img")?.getAttribute("src")).toBe(
        "https://cdn.example.com/uploads/pic.jpg"
      );
      expect(root.querySelector("audio")?.getAttribute("src")).toBe(
        "https://cdn.example.com/uploads/sound.mp3"
      );
      expect(getByText(root, "Inside pane")).toBeInTheDocument();
      expect(getByText(root, "Chat line")).toBeInTheDocument();
      expect(getByText(root, "Hidden")).toBeInTheDocument();
      expect(getByText(root, "Cell 1")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
