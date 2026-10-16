import { getByRole } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapLinkItem from "./TiptapLinkItem.astro";

describe("TiptapLinkItem", () => {
  it("renders external link with automatic rel='noopener noreferrer' on target='_blank'", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapLinkItem, {
      props: {
        text: "Astro Docs",
        linkMark: {
          type: "link",
          attrs: {
            href: "https://docs.astro.build",
            target: "_blank",
          },
        },
      },
    });

    try {
      const link = getByRole(root, "link", { name: "Astro Docs" });
      expect(link.getAttribute("href")).toBe("https://docs.astro.build");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    } finally {
      await close();
    }
  });

  it("resolves strapi:// internal link URIs and blocks javascript: URLs", async () => {
    const { root: strapiRoot, close: closeStrapi } = await renderAstroComponentToDom(
      TiptapLinkItem,
      {
        props: {
          text: "Internal Post",
          linkMark: {
            type: "link",
            attrs: { href: "strapi://api::article.article/doc-99" },
          },
        },
      }
    );

    try {
      const link = getByRole(strapiRoot, "link", { name: "Internal Post" });
      expect(link.getAttribute("href")).toBe("/article/doc-99");
    } finally {
      await closeStrapi();
    }

    const { root: unsafeRoot, close: closeUnsafe } = await renderAstroComponentToDom(
      TiptapLinkItem,
      {
        props: {
          text: "Unsafe Link",
          linkMark: {
            type: "link",
            attrs: { href: "javascript:alert(1)" },
          },
        },
      }
    );

    try {
      const link = getByRole(unsafeRoot, "link", { name: "Unsafe Link" });
      expect(link.getAttribute("href")).toBe("#");
    } finally {
      await closeUnsafe();
    }
  });
});
