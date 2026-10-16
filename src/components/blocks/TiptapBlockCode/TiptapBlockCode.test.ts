import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockCode from "./TiptapBlockCode.astro";

describe("TiptapBlockCode", () => {
  it("renders <pre> and <code> with language class, line numbers, and copyable toolbar", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockCode, {
      props: {
        showLineNumbers: true,
        copyable: true,
        attrs: { language: "typescript" },
        content: [{ type: "text", text: "const a = 1;\nconst b = 2;" }],
      },
    });

    try {
      const pre = root.querySelector("pre");
      expect(pre?.getAttribute("data-language")).toBe("typescript");

      const code = root.querySelector("code");
      expect(code?.className).toContain("language-typescript");

      const copyBtn = getByRole(root, "button", { name: "Copy code to clipboard" });
      expect(copyBtn.getAttribute("data-copy-code")).toBe("const a = 1;\nconst b = 2;");

      const firstLine = getByText(root, "const a = 1;");
      expect(firstLine.getAttribute("data-line-number")).toBe("1");
      expect(getByText(root, "const b = 2;")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
