import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapInlineNodes from "./TiptapInlineNodes.astro";

describe("TiptapInlineNodes", () => {
  it("dispatches text, hardBreak, linker, and inline mathematics nodes", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapInlineNodes, {
      props: {
        nodes: [
          { type: "text", text: "Start text" },
          { type: "hardBreak" },
          {
            type: "linker",
            attrs: {
              collectionName: "api::article.article",
              documentId: "guide-1",
              label: "Guide 1",
            },
          },
          {
            type: "mathematics",
            attrs: { latex: "E = mc^2", displayMode: "inline" },
          },
        ],
      },
    });

    try {
      expect(getByText(root, "Start text")).toBeInTheDocument();
      expect(root.querySelector("br")).not.toBeNull();

      const linker = getByRole(root, "link", { name: "Guide 1" });
      expect(linker.getAttribute("data-type")).toBe("linker");
      expect(linker.getAttribute("href")).toBe("/article/guide-1");

      const math = getByRole(root, "math");
      expect(math.getAttribute("data-latex")).toBe("E = mc^2");
    } finally {
      await close();
    }
  });
});
