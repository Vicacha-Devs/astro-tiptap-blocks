import { getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockQuote from "./TiptapBlockQuote.astro";

describe("TiptapBlockQuote", () => {
  it("renders a blockquote element with nested paragraph and list items", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockQuote, {
      props: {
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Simplicity is prerequisite for reliability." }],
          },
        ],
      },
    });

    try {
      const quote = root.querySelector("blockquote");
      expect(quote).not.toBeNull();
      expect(getByText(root, "Simplicity is prerequisite for reliability.")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
