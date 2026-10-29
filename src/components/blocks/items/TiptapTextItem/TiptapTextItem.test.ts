import { getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapTextItem from "./TiptapTextItem.astro";

describe("TiptapTextItem", () => {
  it("renders inline bold, italic, underline, and strike marks with semantic tags and classes", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapTextItem, {
      props: {
        text: "Formatted span",
        marks: [{ type: "bold" }, { type: "italic" }, { type: "underline" }, { type: "strike" }],
      },
    });

    try {
      const el = getByText(root, "Formatted span");
      expect(el).toBeInTheDocument();
      expect(el.tagName.toLowerCase()).toBe("s");
      expect(el.className).toContain("line-through");

      const uEl = el.closest("u");
      expect(uEl).not.toBeNull();
      expect(uEl?.className).toContain("underline");

      const emEl = el.closest("em");
      expect(emEl).not.toBeNull();
      expect(emEl?.className).toContain("italic");

      const strongEl = el.closest("strong");
      expect(strongEl).not.toBeNull();
      expect(strongEl?.className).toContain("font-bold");
      expect(root.querySelector("span")).toBeNull();
    } finally {
      await close();
    }
  });

  it("renders highlight, abbr, and language marks with sanitized attributes", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapTextItem, {
      props: {
        text: "WCAG",
        marks: [
          { type: "abbr", attrs: { title: "Web Content Accessibility Guidelines" } },
          { type: "highlight", attrs: { color: "#fef08a" } },
          { type: "language", attrs: { lang: "en", dir: "ltr" } },
        ],
      },
    });

    try {
      const mark = getByText(root, "WCAG");
      expect(mark.tagName.toLowerCase()).toBe("mark");
      expect(mark.getAttribute("data-color")).toBe("#fef08a");

      const abbr = mark.closest("abbr");
      expect(abbr).not.toBeNull();
      expect(abbr?.getAttribute("title")).toBe("Web Content Accessibility Guidelines");

      const span = abbr?.closest("span");
      expect(span?.getAttribute("lang")).toBe("en");
      expect(span?.getAttribute("dir")).toBe("ltr");
    } finally {
      await close();
    }
  });

  it("renders inline code mark as a <code> element", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapTextItem, {
      props: {
        text: "const x = 1",
        marks: [{ type: "code" }],
      },
    });

    try {
      const codeEl = getByText(root, "const x = 1");
      expect(codeEl.tagName.toLowerCase()).toBe("code");
    } finally {
      await close();
    }
  });
});
