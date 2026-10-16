import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapLibPreview from "./TiptapLibPreview.astro";

describe("TiptapLibPreview", () => {
  it("renders input preview, library output preview, and live <TiptapBlocks /> output", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapLibPreview, {
      props: {
        title: "parseTiptapContent(doc)",
        subtitle: "Normalizes content into TiptapDocNode",
        inputPreview: '{"type":"doc"}',
        outputPreview: '{"type":"doc","content":[]}',
        renderedContent: "<p>Live rendered paragraph</p>",
      },
    });

    try {
      expect(getByRole(root, "heading", { level: 3, name: "parseTiptapContent(doc)" })).toBeInTheDocument();
      expect(getByText(root, '{"type":"doc"}')).toBeInTheDocument();
      expect(getByText(root, "Live rendered paragraph")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
