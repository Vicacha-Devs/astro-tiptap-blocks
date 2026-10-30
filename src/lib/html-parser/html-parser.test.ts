import { parseTiptapHtml } from "./html-parser";

describe("parseTiptapHtml (lib/html-parser)", () => {
  it("parses extended HTML including > inside quoted attributes, <ol start>, and responsive img srcset", () => {
    const html = `
      <p data-lead="true">Lead intro</p>
      <h2 id="custom-id" data-seo-tag="h1">SEO Heading</h2>
      <p>
        <sub>2</sub><sup>3</sup>
        <abbr title="A > B">CMS</abbr>
        <span lang="ar" dir="rtl">السلام</span>
        <span style="color: #2563eb; font-size: 18px">Styled</span>
        <span data-type="mathematics" data-latex="x > 0">x &gt; 0</span>
      </p>
      <ol start="5"><li>Fifth item</li></ol>
      <img src="https://example.com/hero.webp" srcset="https://example.com/hero-1x.webp 1x, javascript:alert(1) 2x" sizes="100vw" alt="Hero" />
      <aside data-type="information-pane" data-variant="warning" data-title="Heads up"><p>Careful!</p></aside>
      <details open><summary>More info</summary><p>Hidden body</p></details>
      <div data-type="layout-container" data-columns="2:1">
        <div data-type="layout-column"><p>Left</p></div>
        <div data-type="layout-column"><p>Right</p></div>
      </div>
      <ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Done task</p></li></ul>
      <div data-type="page-break"></div>
    `;

    const doc = parseTiptapHtml(html);
    expect(doc.content.map((b) => b.type)).toEqual([
      "leadParagraph",
      "heading",
      "paragraph",
      "orderedList",
      "image",
      "informationPane",
      "details",
      "layoutContainer",
      "taskList",
      "pageBreak",
    ]);

    const ol = doc.content[3];
    expect(ol.type === "orderedList" && ol.attrs?.start).toBe(5);

    const img = doc.content[4];
    expect(img.type === "image" && img.attrs.srcset).toBe("https://example.com/hero-1x.webp 1x");
  });

  it("strips <script>, blocks HTTP iframes, and neutralizes javascript: links and custom block handlers", () => {
    const maliciousHtml = `
      <script>window.__xss = true;</script>
      <iframe src="http://insecure.example.com"></iframe>
      <p><a href="javascript:alert(1)">Click me</a></p>
      <img src="javascript:alert(2)" alt="bad" />
      <img src="https://mezquitabogota.org/mosque.jpg" alt="Mosque" title="Exterior" />
      <div data-tiptap-type="banner" data-onclick="alert(1)" data-url="https://example.com/banner"></div>
      <div data-tiptap-type="badBanner" data-url="javascript:alert(1)"></div>
    `;

    const doc = parseTiptapHtml(maliciousHtml);
    expect(doc.content).toHaveLength(3);
    expect(doc.content[0]).toMatchObject({
      type: "paragraph",
      content: [
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: { href: "#", target: null, rel: null, title: null, class: null },
            },
          ],
        },
      ],
    });
    expect(doc.content[2]).toEqual({
      type: "banner",
      attrs: { url: "https://example.com/banner" },
    });
  });
});
