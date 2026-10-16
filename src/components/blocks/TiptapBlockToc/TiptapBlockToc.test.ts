import { getByRole } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockToc from "./TiptapBlockToc.astro";

describe("TiptapBlockToc", () => {
  it("renders tableOfContents navigation with indented heading anchor links", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockToc, {
      props: {
        type: "tableOfContents",
        attrs: {
          title: "On this page",
          headings: [
            { id: "intro", text: "Introduction", level: 1 },
            { id: "setup", text: "Setup Guide", level: 2 },
          ],
        },
      },
    });

    try {
      const nav = getByRole(root, "navigation", { name: "On this page" });
      expect(nav.getAttribute("data-type")).toBe("table-of-contents");
      const link = getByRole(root, "link", { name: "Setup Guide" });
      expect(link.getAttribute("href")).toBe("#setup");
    } finally {
      await close();
    }
  });

  it("renders pageBreak as an <hr role='separator'> element", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockToc, {
      props: { type: "pageBreak" },
    });

    try {
      const separator = getByRole(root, "separator");
      expect(separator.getAttribute("data-type")).toBe("page-break");
    } finally {
      await close();
    }
  });
});
