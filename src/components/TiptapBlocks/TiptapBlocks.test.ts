import { getByRole } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlocks from "./TiptapBlocks.astro";

describe("TiptapBlocks", () => {
  it("renders ProseMirror JSON AST and propagates headingAnchors, mediaBaseUrl, and resolveInternalLink into nested containers", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlocks, {
      props: {
        data: {
          type: "doc",
          content: [
            { type: "tableOfContents", attrs: { title: "On this page" } },
            {
              type: "heading",
              attrs: { level: 2, tag: "h3" },
              content: [{ type: "text", text: "Architecture Overview" }],
            },
            {
              type: "informationPane",
              attrs: { variant: "info", title: "Note" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Nested Heading" }],
                },
                {
                  type: "image",
                  attrs: { src: "/uploads/nested.webp", alt: "Nested Image" },
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "linker",
                      attrs: {
                        collectionName: "api::article.article",
                        documentId: "astro-guide",
                        label: "Astro Guide",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        headingAnchors: true,
        mediaBaseUrl: "https://cdn.mezquitabogota.org",
        resolveInternalLink: ({
          collectionName,
          documentId,
        }: {
          collectionName: string;
          documentId: string;
        }) => `/cms/${collectionName}/${documentId}`,
      },
    });

    try {
      expect(getByRole(root, "navigation", { name: "On this page" })).toBeInTheDocument();
      const heading = getByRole(root, "heading", {
        level: 3,
        name: /Architecture Overview/,
      });
      expect(heading.getAttribute("data-seo-tag")).toBe("h3");

      const nestedAnchor = getByRole(root, "link", {
        name: "Permalink to Nested Heading",
      });
      expect(nestedAnchor.getAttribute("href")).toBe("#nested-heading");

      const nestedImg = getByRole(root, "img", { name: "Nested Image" });
      expect(nestedImg.getAttribute("src")).toBe(
        "https://cdn.mezquitabogota.org/uploads/nested.webp"
      );

      const link = getByRole(root, "link", { name: "Astro Guide" });
      expect(link.getAttribute("href")).toBe("/cms/api::article.article/astro-guide");
    } finally {
      await close();
    }
  });

  it("renders HTML and Markdown inputs and strips XSS payloads", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlocks, {
      props: {
        data: '<h2>Safe Heading</h2><script>alert("xss")</script><p><a href="javascript:alert(1)">Bad Link</a></p>',
      },
    });

    try {
      expect(getByRole(root, "heading", { level: 2, name: "Safe Heading" })).toBeInTheDocument();
      expect(root.querySelector("script")).toBeNull();
      const link = getByRole(root, "link", { name: "Bad Link" });
      expect(link.getAttribute("href")).toBe("#");
    } finally {
      await close();
    }
  });
});
