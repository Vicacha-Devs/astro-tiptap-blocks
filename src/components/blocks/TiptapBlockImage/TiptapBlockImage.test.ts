import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockImage from "./TiptapBlockImage.astro";

describe("TiptapBlockImage", () => {
  it("renders figure, img, and figcaption with Strapi asset metadata and mediaBaseUrl", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockImage, {
      props: {
        mediaBaseUrl: "https://cms.mezquitabogota.org",
        attrs: {
          src: "/uploads/photo.jpg",
          alt: "Architecture diagram",
          caption: "Figure 1: Overview",
          loading: "eager",
          fetchpriority: "high",
          "data-align": "center",
          "data-asset-id": 42,
          "data-document-id": "asset-doc-42",
        },
      },
    });

    try {
      const img = getByRole(root, "img", { name: "Architecture diagram" });
      expect(img.getAttribute("src")).toBe("https://cms.mezquitabogota.org/uploads/photo.jpg");
      expect(img.getAttribute("loading")).toBe("eager");
      expect(img.getAttribute("fetchpriority")).toBe("high");
      expect(getByText(root, "Figure 1: Overview")).toBeInTheDocument();

      const figure = root.querySelector("figure");
      expect(figure?.getAttribute("data-asset-id")).toBe("42");
      expect(figure?.getAttribute("data-document-id")).toBe("asset-doc-42");
    } finally {
      await close();
    }
  });

  it("refuses to render images with unsafe javascript: src", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockImage, {
      props: {
        attrs: {
          src: "javascript:alert(1)",
          alt: "Malicious image",
        },
      },
    });

    try {
      expect(root.querySelector("img")).toBeNull();
    } finally {
      await close();
    }
  });
});
