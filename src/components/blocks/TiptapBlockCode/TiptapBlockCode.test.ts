import { getByRole } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockCode from "./TiptapBlockCode.astro";

describe("TiptapBlockCode", () => {
  it("renders Shiki syntax-highlighted tokens with language class, line numbers, and copyable toolbar", async () => {
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
      expect(pre?.getAttribute("data-shiki")).toBe("true");

      const code = root.querySelector("code");
      expect(code?.className).toContain("language-typescript");

      const copyBtn = getByRole(root, "button", { name: "Copy code to clipboard" });
      expect(copyBtn.getAttribute("data-copy-code")).toBe("const a = 1;\nconst b = 2;");

      const firstLine = root.querySelector('[data-line-number="1"]');
      const secondLine = root.querySelector('[data-line-number="2"]');
      expect(firstLine?.textContent).toContain("const a = 1;");
      expect(secondLine?.textContent).toContain("const b = 2;");

      const shikiTokens = root.querySelectorAll(".shiki-token");
      expect(shikiTokens.length).toBeGreaterThan(2);
      expect(shikiTokens[0]?.getAttribute("style")).toContain("color:");
    } finally {
      await close();
    }
  });

  it("falls back gracefully to plain text lines when language is unknown or omitted", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockCode, {
      props: {
        attrs: { language: "unknown-custom-dsl" },
        content: [{ type: "text", text: "SELECT * FROM custom_dsl;" }],
      },
    });

    try {
      const pre = root.querySelector("pre");
      expect(pre?.getAttribute("data-language")).toBe("unknown-custom-dsl");
      expect(pre?.getAttribute("data-shiki")).toBeNull();
      expect(pre?.textContent).toContain("SELECT * FROM custom_dsl;");
    } finally {
      await close();
    }
  });
});
