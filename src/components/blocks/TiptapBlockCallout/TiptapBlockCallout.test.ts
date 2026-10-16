import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockCallout from "./TiptapBlockCallout.astro";

describe("TiptapBlockCallout", () => {
  it("renders informationPane as an <aside role='note'> with variant and title", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockCallout, {
      props: {
        type: "informationPane",
        attrs: { variant: "warning", title: "Migration Notice" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Backup before migrating." }] }],
      },
    });

    try {
      const aside = getByRole(root, "note");
      expect(aside.getAttribute("data-type")).toBe("information-pane");
      expect(aside.getAttribute("data-variant")).toBe("warning");
      expect(getByText(root, "Migration Notice")).toBeInTheDocument();
      expect(getByText(root, "Backup before migrating.")).toBeInTheDocument();
    } finally {
      await close();
    }
  });

  it("renders conversationHistory with author and timestamp metadata", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockCallout, {
      props: {
        type: "conversationHistory",
        attrs: { author: "Alice", timestamp: "2026-04-19 10:00" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Updated schema." }] }],
      },
    });

    try {
      const conv = root.querySelector('[data-type="conversation-history"]');
      expect(conv).not.toBeNull();
      expect(getByText(root, "Alice")).toBeInTheDocument();
      expect(getByText(root, "2026-04-19 10:00")).toBeInTheDocument();
      expect(getByText(root, "Updated schema.")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
