import { getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockColumns from "./TiptapBlockColumns.astro";

describe("TiptapBlockColumns", () => {
  it("renders multi-column grid container with fractional grid-template-columns", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockColumns, {
      props: {
        attrs: { columns: "2:1" },
        content: [
          {
            type: "layoutColumn",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Main column" }] }],
          },
          {
            type: "layoutColumn",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Sidebar column" }] }],
          },
        ],
      },
    });

    try {
      const container = root.querySelector('[data-type="layout-container"]');
      expect(container).not.toBeNull();
      expect(container?.getAttribute("data-columns")).toBe("2:1");
      expect(container?.getAttribute("style")).toContain("minmax(0, 2fr) minmax(0, 1fr)");
      expect(root.querySelectorAll('[data-type="layout-column"]')).toHaveLength(2);
      expect(getByText(root, "Main column")).toBeInTheDocument();
      expect(getByText(root, "Sidebar column")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
