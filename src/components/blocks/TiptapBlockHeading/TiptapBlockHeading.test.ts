import { getByRole } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockHeading from "./TiptapBlockHeading.astro";

describe("TiptapBlockHeading", () => {
  it("renders semantic heading with auto-generated slug id and optional permalink anchor", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockHeading, {
      props: {
        anchorLink: true,
        attrs: { level: 2 },
        content: [{ type: "text", text: "Getting Started Guide" }],
      },
    });

    try {
      const heading = getByRole(root, "heading", { level: 2 });
      expect(heading.getAttribute("id")).toBe("getting-started-guide");
      const anchor = getByRole(root, "link", { name: "Permalink to Getting Started Guide" });
      expect(anchor.getAttribute("href")).toBe("#getting-started-guide");
    } finally {
      await close();
    }
  });

  it("supports BaseHeadingWithSEOTag override (visual level 2 rendered as h4)", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockHeading, {
      props: {
        attrs: { level: 2, tag: "h4", id: "seo-override" },
        content: [{ type: "text", text: "Visual H2 as H4" }],
      },
    });

    try {
      const heading = getByRole(root, "heading", {
        level: 4,
        name: "Visual H2 as H4",
      });
      expect(heading.getAttribute("data-level")).toBe("2");
      expect(heading.getAttribute("data-seo-tag")).toBe("h4");
      expect(heading.className).toContain("text-3xl");
    } finally {
      await close();
    }
  });
});
