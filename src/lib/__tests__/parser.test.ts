import { describe, expect, it } from "vitest";
import { parseTiptapContent } from "../parser";
import { sanitizeTiptapIframeUrl, sanitizeTiptapUrl } from "../sanitize";

describe("astro-tiptap-blocks parser & sanitizer", () => {
  it("parses ProseMirror JSON doc and preserves formatting marks + auto-generates heading id", () => {
    const doc = parseTiptapContent({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Welcome to Abu Bakr Mosque" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Visit our ", marks: [{ type: "bold" }] },
            {
              type: "text",
              text: "community page",
              marks: [{ type: "link", attrs: { href: "https://mezquitabogota.org/en" } }],
            },
          ],
        },
      ],
    });

    expect(doc.content).toHaveLength(2);
    expect(doc.content[0]).toEqual({
      type: "heading",
      attrs: { level: 2, id: "welcome-to-abu-bakr-mosque" },
      content: [{ type: "text", text: "Welcome to Abu Bakr Mosque" }],
    });
    expect(doc.content[1].type).toBe("paragraph");
  });

  it("parses Tiptap HTML strings into structured AST blocks (headings, marks, lists, tables, blockquotes)", () => {
    const html = `
      <h2>Our Mission</h2>
      <p>Serving <strong>Bogotá</strong> with <em>peace</em> and <a href="/contact" target="_blank">hospitality</a>.</p>
      <blockquote><p>Seek knowledge from the cradle to the grave.</p></blockquote>
      <ul><li>Daily prayers</li><li>Jumuah khutbah</li></ul>
      <table>
        <thead><tr><th>Prayer</th><th>Time</th></tr></thead>
        <tbody><tr><td>Fajr</td><td>04:45</td></tr></tbody>
      </table>
      <hr />
    `;

    const doc = parseTiptapContent(html);
    expect(doc.content.map((b) => b.type)).toEqual([
      "heading",
      "paragraph",
      "blockquote",
      "bulletList",
      "table",
      "horizontalRule",
    ]);

    const paragraph = doc.content[1];
    expect(paragraph.type).toBe("paragraph");
    if (paragraph.type === "paragraph") {
      const boldNode = paragraph.content?.find((n) => n.type === "text" && n.text === "Bogotá");
      expect(boldNode?.type === "text" && boldNode.marks).toEqual([{ type: "bold" }]);

      const linkNode = paragraph.content?.find((n) => n.type === "text" && n.text === "hospitality");
      expect(linkNode?.type === "text" && linkNode.marks?.[0]).toEqual({
        type: "link",
        attrs: { href: "/contact", target: "_blank", rel: null, title: null, class: null },
      });
    }
  });

  it("strips <script>, blocks HTTP/unallowed iframes, and neutralizes javascript: and dangerous data: URLs", () => {
    const maliciousHtml = `
      <script>window.__xss = true;</script>
      <iframe src="http://insecure.example.com"></iframe>
      <p><a href="javascript:alert(1)">Click me</a></p>
      <img src="javascript:alert(2)" alt="bad" />
      <img src="https://mezquitabogota.org/mosque.jpg" alt="Mosque" title="Exterior" />
    `;

    const doc = parseTiptapContent(maliciousHtml);
    expect(doc.content).toHaveLength(2);

    const p = doc.content[0];
    if (p.type === "paragraph" && p.content?.[0]?.type === "text") {
      expect(p.content[0].marks?.[0]).toEqual({
        type: "link",
        attrs: { href: "#", target: null, rel: null, title: null, class: null },
      });
    }

    expect(sanitizeTiptapUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("  JaVaScRiPt:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("&#106;avascript:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("//evil.example.com/payload.js")).toBe("#");
    expect(sanitizeTiptapUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(sanitizeTiptapUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe("#");
    expect(sanitizeTiptapUrl("data:audio/wav;base64,UklGRiQAAABXQVZF")).toContain("data:audio/wav;base64,");
    expect(sanitizeTiptapUrl("https://mezquitabogota.org")).toBe("https://mezquitabogota.org");
    expect(sanitizeTiptapUrl("mailto:info@mezquitabogota.org")).toBe("mailto:info@mezquitabogota.org");
    expect(sanitizeTiptapIframeUrl("http://example.com")).toBe("#");
    expect(sanitizeTiptapIframeUrl("https://www.youtube.com/embed/123", ["youtube.com"])).toBe(
      "https://www.youtube.com/embed/123"
    );
    expect(sanitizeTiptapIframeUrl("https://evil.com/embed", ["youtube.com"])).toBe("#");
  });

  it("supports fallback string[] paragraph arrays", () => {
    const doc = parseTiptapContent(["First paragraph", "Second paragraph"]);
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "First paragraph" }],
    });
  });
});
