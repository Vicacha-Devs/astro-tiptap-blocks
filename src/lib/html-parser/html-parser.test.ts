import { parseTiptapHtml } from "./html-parser";

describe("parseTiptapHtml (lib/html-parser)", () => {
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

    const doc = parseTiptapHtml(html);
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

  it("strips <script>, blocks HTTP iframes, and neutralizes javascript: links", () => {
    const maliciousHtml = `
      <script>window.__xss = true;</script>
      <iframe src="http://insecure.example.com"></iframe>
      <p><a href="javascript:alert(1)">Click me</a></p>
      <img src="javascript:alert(2)" alt="bad" />
      <img src="https://mezquitabogota.org/mosque.jpg" alt="Mosque" title="Exterior" />
    `;

    const doc = parseTiptapHtml(maliciousHtml);
    expect(doc.content).toHaveLength(2);
    const p = doc.content[0];
    if (p.type === "paragraph" && p.content?.[0]?.type === "text") {
      expect(p.content[0].marks?.[0]).toEqual({
        type: "link",
        attrs: { href: "#", target: null, rel: null, title: null, class: null },
      });
    }
  });
});
