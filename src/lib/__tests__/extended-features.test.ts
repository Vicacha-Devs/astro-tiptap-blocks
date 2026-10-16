import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseTiptapContent } from "../parser";
import { extractRelationsFromTiptap, formatStrapiLinkUri, parseStrapiLinkUri } from "../relations";
import { buildSafeInlineStyle, formatFileSize, formatLatexPreview, sanitizeCssColor } from "../sanitize";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(
  currentDir,
  "../../../../strapi-plugin-tiptap-editor/fixtures/all-features-payload.json"
);

describe("Strapi Plugin Extended Editor Features (PR #40 compatibility)", () => {
  it("parses the full Strapi all-features-payload.json and auto-populates Table of Contents", () => {
    const payload = JSON.parse(readFileSync(fixturePath, "utf-8"));
    const doc = parseTiptapContent(payload.content);

    const blockTypes = new Set(doc.content.map((b) => b.type));
    expect(blockTypes.has("tableOfContents")).toBe(true);
    expect(blockTypes.has("leadParagraph")).toBe(true);
    expect(blockTypes.has("heading")).toBe(true);
    expect(blockTypes.has("informationPane")).toBe(true);
    expect(blockTypes.has("conversationHistory")).toBe(true);
    expect(blockTypes.has("details")).toBe(true);
    expect(blockTypes.has("layoutContainer")).toBe(true);
    expect(blockTypes.has("taskList")).toBe(true);
    expect(blockTypes.has("table")).toBe(true);
    expect(blockTypes.has("image")).toBe(true);
    expect(blockTypes.has("video")).toBe(true);
    expect(blockTypes.has("audio")).toBe(true);
    expect(blockTypes.has("attachment")).toBe(true);
    expect(blockTypes.has("iframe")).toBe(true);
    expect(blockTypes.has("mathematics")).toBe(true);
    expect(blockTypes.has("pageBreak")).toBe(true);
    expect(blockTypes.has("codeBlock")).toBe(true);
    expect(blockTypes.has("bulletList")).toBe(true);

    const tocBlock = doc.content.find((b) => b.type === "tableOfContents");
    expect(tocBlock?.type === "tableOfContents" && (tocBlock.attrs?.headings?.length ?? 0) > 5).toBe(true);
  });

  it("extracts Strapi media asset references and internal content links via extractRelationsFromTiptap", () => {
    const payload = JSON.parse(readFileSync(fixturePath, "utf-8"));
    const relations = extractRelationsFromTiptap(payload.content);

    expect(relations.mediaIds).toEqual([42, 99, 100, 201, 202, 203]);
    expect(relations.mediaDocumentIds).toContain("doc-img-42");
    expect(relations.internalLinks).toHaveLength(1);
    expect(relations.linksByCollection["api::article.article"]).toEqual([
      { documentId: "doc-article-99" },
    ]);

    expect(parseStrapiLinkUri(formatStrapiLinkUri("api::page.page", "home-1"))).toEqual({
      collectionName: "api::page.page",
      documentId: "home-1",
    });
  });

  it("supports custom resolveInternalLink and allowedIframeDomains in parseTiptapContent", () => {
    const doc = parseTiptapContent(
      {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "linker",
                attrs: {
                  collectionName: "api::article.article",
                  documentId: "ramadan-2026",
                  label: "Ramadan Schedule",
                },
              },
            ],
          },
          {
            type: "iframe",
            attrs: { src: "https://untrusted.example.org/embed" },
          },
        ],
      },
      {
        allowedIframeDomains: ["youtube.com", "openstreetmap.org"],
        resolveInternalLink: ({ collectionName, documentId }) =>
          `/en/${collectionName.split(".").pop()}/${documentId}`,
      }
    );

    expect(doc.content).toHaveLength(1); // untrusted iframe removed
    const first = doc.content[0];
    if (first.type === "paragraph" && first.content?.[0]?.type === "linker") {
      expect(first.content[0].attrs.href).toBe("/en/article/ramadan-2026");
    }
  });

  it("parses extended HTML (details, callout, columns, taskList, sub/sup/abbr/lang/textStyle, math)", () => {
    const html = `
      <p data-lead="true">Lead intro</p>
      <h2 id="custom-id" data-seo-tag="h1">SEO Heading</h2>
      <p>
        <sub>2</sub><sup>3</sup>
        <abbr title="Content Management System">CMS</abbr>
        <span lang="ar" dir="rtl">السلام</span>
        <span style="color: #2563eb; font-size: 18px">Styled</span>
        <span data-type="mathematics" data-latex="E = mc^2">E = mc^2</span>
      </p>
      <aside data-type="information-pane" data-variant="warning" data-title="Heads up"><p>Careful!</p></aside>
      <details open><summary>More info</summary><p>Hidden body</p></details>
      <div data-type="layout-container" data-columns="2:1">
        <div data-type="layout-column"><p>Left</p></div>
        <div data-type="layout-column"><p>Right</p></div>
      </div>
      <ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Done task</p></li></ul>
      <div data-type="page-break"></div>
    `;

    const doc = parseTiptapContent(html);
    expect(doc.content.map((b) => b.type)).toEqual([
      "leadParagraph",
      "heading",
      "paragraph",
      "informationPane",
      "details",
      "layoutContainer",
      "taskList",
      "pageBreak",
    ]);
  });

  it("parses extended Markdown (callouts, lead, math, task lists, media, and lossless tiptap-node metadata)", () => {
    const md = [
      "<!-- toc -->",
      "# Main Heading",
      "> **Lead:** Introductory lead paragraph",
      "> [!SUCCESS] Deployment Ready\n> Everything passed.",
      "- [x] Configure Strapi\n- [ ] Deploy Astro",
      "$$\n\\int_0^\\infty e^{-x^2} dx\n$$",
      "[Attachment: guide.pdf](https://example.com/guide.pdf)",
      "<!-- pagebreak -->",
      'Fallback text\n<!-- tiptap-node:{"type":"conversationHistory","attrs":{"author":"Editor","timestamp":"2026-04-15"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Reviewed and approved."}]}]} -->',
    ].join("\n\n");

    const doc = parseTiptapContent(md);
    expect(doc.content.map((b) => b.type)).toEqual([
      "tableOfContents",
      "heading",
      "leadParagraph",
      "informationPane",
      "taskList",
      "mathematics",
      "attachment",
      "pageBreak",
      "conversationHistory",
    ]);
  });

  it("sanitizes CSS colors, inline styles, file sizes, and LaTeX previews", () => {
    expect(sanitizeCssColor("#fef08a")).toBe("#fef08a");
    expect(sanitizeCssColor("red; background: url(javascript:alert(1))")).toBeNull();
    expect(
      buildSafeInlineStyle({
        color: "#2563eb",
        fontSize: "18px",
        fontFamily: "Georgia, serif",
        lineHeight: "1.6",
      })
    ).toBe("color: #2563eb; font-family: Georgia, serif; font-size: 18px; line-height: 1.6");
    expect(formatFileSize(245760)).toBe("240.0 KB");
    expect(formatLatexPreview("\\alpha + \\beta \\leq \\pi")).toBe("α + β ≤ π");
  });
});
