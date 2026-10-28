import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractRelationsFromTiptap,
  formatStrapiLinkUri,
  parseStrapiLinkUri,
  resolveStrapiLinkHref,
} from "./relations";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(
  currentDir,
  "../../fixtures/all-features-payload.json"
);

describe("relations utilities (lib/relations)", () => {
  it("extracts Strapi media asset references and internal content links via extractRelationsFromTiptap", () => {
    const payload = JSON.parse(readFileSync(fixturePath, "utf-8"));
    const relations = extractRelationsFromTiptap(payload.content);

    expect(relations.mediaIds).toEqual([42, 99, 100, 201, 202, 203]);
    expect(relations.mediaDocumentIds).toContain("doc-img-42");
    expect(relations.internalLinks).toHaveLength(1);
    expect(relations.linksByCollection["api::article.article"]).toEqual([
      { documentId: "doc-article-99" },
    ]);
  });

  it("parses, formats, and resolves strapi:// relation URIs", () => {
    const uri = formatStrapiLinkUri("api::page.page", "home-1");
    expect(uri).toBe("strapi://api::page.page/home-1");
    expect(parseStrapiLinkUri(uri)).toEqual({
      collectionName: "api::page.page",
      documentId: "home-1",
    });
    expect(resolveStrapiLinkHref({ href: uri })).toBe("/page/home-1");
    expect(
      resolveStrapiLinkHref(
        { href: uri },
        ({ collectionName, documentId }) => `/cms/${collectionName}/${documentId}`
      )
    ).toBe("/cms/api::page.page/home-1");
  });
});
