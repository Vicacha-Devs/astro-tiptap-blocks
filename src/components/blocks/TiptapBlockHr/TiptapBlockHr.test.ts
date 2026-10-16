import { getByRole } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockHr from "./TiptapBlockHr.astro";

describe("TiptapBlockHr", () => {
  it("renders a thematic horizontal rule <hr /> with default theme classes", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockHr);

    try {
      const hr = getByRole(root, "separator");
      expect(hr.tagName.toLowerCase()).toBe("hr");
      expect(hr.className).toContain("border-t");
    } finally {
      await close();
    }
  });
});
