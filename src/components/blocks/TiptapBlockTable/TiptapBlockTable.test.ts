import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockTable from "./TiptapBlockTable.astro";

describe("TiptapBlockTable", () => {
  it("renders table with thead, tbody, colspan, and sanitized cell background color", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockTable, {
      props: {
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                attrs: { colspan: 2, backgroundColor: "#e0e7ff" },
                content: [{ type: "paragraph", content: [{ type: "text", text: "Header Span" }] }],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Cell A" }] }],
              },
              {
                type: "tableCell",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Cell B" }] }],
              },
            ],
          },
        ],
      },
    });

    try {
      expect(getByRole(root, "table")).toBeInTheDocument();
      const th = getByText(root, "Header Span").closest("th");
      expect(th?.getAttribute("colspan")).toBe("2");
      expect(th?.getAttribute("style")).toContain("background-color: #e0e7ff");
      expect(getByText(root, "Cell A")).toBeInTheDocument();
      expect(getByText(root, "Cell B")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
