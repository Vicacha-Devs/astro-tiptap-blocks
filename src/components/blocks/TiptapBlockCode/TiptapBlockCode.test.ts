import { getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockCode from "./TiptapBlockCode.astro";

describe("TiptapBlockCode", () => {
  it("renders <pre> and <code> with language class and per-line spans", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockCode, {
      props: {
        attrs: { language: "typescript" },
        content: [{ type: "text", text: "const a = 1;\nconst b = 2;" }],
      },
    });

    try {
      const pre = root.querySelector("pre");
      expect(pre?.getAttribute("data-language")).toBe("typescript");

      const code = root.querySelector("code");
      expect(code?.className).toContain("language-typescript");

      expect(getByText(root, "const a = 1;")).toBeInTheDocument();
      expect(getByText(root, "const b = 2;")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
