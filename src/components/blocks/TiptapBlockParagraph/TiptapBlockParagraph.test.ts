import { getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockParagraph from "./TiptapBlockParagraph.astro";

describe("TiptapBlockParagraph", () => {
  it("renders standard paragraph and leadParagraph with data-lead attribute", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockParagraph, {
      props: {
        type: "leadParagraph",
        attrs: { textAlign: "center", dir: "rtl" },
        content: [{ type: "text", text: "Introductory lead text" }],
      },
    });

    try {
      const p = getByText(root, "Introductory lead text");
      expect(p.tagName.toLowerCase()).toBe("p");
      expect(p.getAttribute("data-lead")).toBe("true");
      expect(p.getAttribute("dir")).toBe("rtl");
      expect(p.getAttribute("style")).toContain("text-align: center");
    } finally {
      await close();
    }
  });
});
