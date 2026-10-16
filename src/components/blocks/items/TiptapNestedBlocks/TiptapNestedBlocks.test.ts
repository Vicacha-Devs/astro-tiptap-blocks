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
