import { getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockDetails from "./TiptapBlockDetails.astro";

describe("TiptapBlockDetails", () => {
  it("renders native <details> and <summary> elements with open state and body blocks", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockDetails, {
      props: {
        attrs: { open: true },
        content: [
          {
            type: "detailsSummary",
            content: [{ type: "text", text: "Expandable FAQ" }],
          },
          {
            type: "detailsContent",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Detailed answer inside accordion." }],
              },
            ],
          },
        ],
      },
    });

    try {
      const details = root.querySelector("details");
      expect(details).not.toBeNull();
      expect(details?.hasAttribute("open")).toBe(true);
      expect(getByText(root, "Expandable FAQ").tagName.toLowerCase()).toBe("summary");
      expect(getByText(root, "Detailed answer inside accordion.")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
