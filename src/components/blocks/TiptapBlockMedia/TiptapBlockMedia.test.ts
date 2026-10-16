import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockMedia from "./TiptapBlockMedia.astro";

describe("TiptapBlockMedia", () => {
  it("renders downloadable attachment card with formatted byte size and extension badge", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockMedia, {
      props: {
        type: "attachment",
        attrs: {
          href: "https://example.com/manual.pdf",
          title: "User Manual",
          size: 1048576,
          ext: "pdf",
        },
      },
    });

    try {
      expect(getByText(root, "PDF")).toBeInTheDocument();
      expect(getByText(root, "User Manual")).toBeInTheDocument();
      expect(getByText(root, "1.0 MB")).toBeInTheDocument();
      const link = getByRole(root, "link", { name: "Download" });
      expect(link.getAttribute("href")).toBe("https://example.com/manual.pdf");
    } finally {
      await close();
    }
  });

  it("enforces HTTPS and domain allowlist on iframe embeds", async () => {
    const { root: allowedRoot, close: closeAllowed } = await renderAstroComponentToDom(
      TiptapBlockMedia,
      {
        props: {
          type: "iframe",
          attrs: { src: "https://www.youtube.com/embed/abc", title: "Allowed Video" },
          allowedIframeDomains: ["youtube.com"],
        },
      }
    );

    try {
      const iframe = allowedRoot.querySelector("iframe");
      expect(iframe).not.toBeNull();
      expect(iframe?.getAttribute("sandbox")).toContain("allow-scripts");
    } finally {
      await closeAllowed();
    }

    const { root: blockedRoot, close: closeBlocked } = await renderAstroComponentToDom(
      TiptapBlockMedia,
      {
        props: {
          type: "iframe",
          attrs: { src: "https://evil.example.com/embed", title: "Blocked" },
          allowedIframeDomains: ["youtube.com"],
        },
      }
    );

    try {
      expect(blockedRoot.querySelector("iframe")).toBeNull();
    } finally {
      await closeBlocked();
    }
  });
});
