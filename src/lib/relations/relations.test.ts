import {
  extractRelationsFromTiptap,
  formatInternalLinkUri,
  parseInternalLinkUri,
  resolveInternalLinkHref,
} from "./relations";

describe("relations utilities (lib/relations)", () => {
  it("extracts media asset references and internal content links via extractRelationsFromTiptap", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "linker",
              attrs: {
                collectionName: "article",
                documentId: "doc-article-99",
                label: "Architecture Guide",
              },
            },
          ],
        },
        {
          type: "image",
          attrs: {
            "src": "https://mezquitabogota.org/uploads/hero.webp",
            "data-asset-id": 42,
            "data-document-id": "doc-img-42",
          },
        },
        {
          type: "video",
          attrs: {
            "src": "https://mezquitabogota.org/uploads/tour.mp4",
            "data-asset-id": 99,
            "data-document-id": "doc-vid-99",
          },
        },
      ],
    };

    const relations = extractRelationsFromTiptap(doc);

    expect(relations.mediaIds).toEqual([42, 99]);
    expect(relations.mediaDocumentIds).toEqual(["doc-img-42", "doc-vid-99"]);
    expect(relations.internalLinks).toHaveLength(1);
    expect(relations.linksByCollection["article"]).toEqual([{ documentId: "doc-article-99" }]);
  });

  it("parses, formats, and resolves tiptap:// internal relation URIs", () => {
    const uri = formatInternalLinkUri("page", "home-1");
    expect(uri).toBe("tiptap://page/home-1");
    expect(parseInternalLinkUri(uri)).toEqual({
      collectionName: "page",
      documentId: "home-1",
    });
    expect(resolveInternalLinkHref({ href: uri })).toBe("/page/home-1");
    expect(
      resolveInternalLinkHref(
        { href: uri },
        ({ collectionName, documentId }) => `/cms/${collectionName}/${documentId}`
      )
    ).toBe("/cms/page/home-1");
  });
});
