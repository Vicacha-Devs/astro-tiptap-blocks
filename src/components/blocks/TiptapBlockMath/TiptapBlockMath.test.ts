import { getByRole } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockMath from "./TiptapBlockMath.astro";

describe("TiptapBlockMath", () => {
  it("renders display-mode math block with role='math', data-latex, and Unicode preview", async () => {
    const latex = "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}";
    const { root, close } = await renderAstroComponentToDom(TiptapBlockMath, {
      props: {
        attrs: { latex, displayMode: "block" },
      },
    });

    try {
      const mathEl = getByRole(root, "math");
      expect(mathEl.getAttribute("data-type")).toBe("mathematics");
      expect(mathEl.getAttribute("data-latex")).toBe(latex);
      expect(mathEl.textContent).toContain("∫");
      expect(mathEl.textContent).toContain("π");
    } finally {
      await close();
    }
  });
});
