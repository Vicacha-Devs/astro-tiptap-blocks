import {
  buildSafeInlineStyle,
  formatFileSize,
  formatLatexPreview,
  sanitizeCssColor,
  sanitizeTiptapIframeUrl,
  sanitizeTiptapUrl,
  slugifyHeadingText,
} from "./sanitize";

describe("sanitize utilities (lib/sanitize)", () => {
  it("whitelists safe URL protocols and neutralizes XSS schemes", () => {
    expect(sanitizeTiptapUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("  JaVaScRiPt:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("&#106;avascript:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("//evil.example.com/payload.js")).toBe("#");
    expect(sanitizeTiptapUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(sanitizeTiptapUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe("#");
    expect(sanitizeTiptapUrl("data:audio/wav;base64,UklGRiQAAABXQVZF")).toContain(
      "data:audio/wav;base64,"
    );
    expect(sanitizeTiptapUrl("https://mezquitabogota.org")).toBe("https://mezquitabogota.org");
    expect(sanitizeTiptapUrl("mailto:info@mezquitabogota.org")).toBe(
      "mailto:info@mezquitabogota.org"
    );
  });

  it("enforces HTTPS and optional domain allowlist for iframe URLs", () => {
    expect(sanitizeTiptapIframeUrl("http://example.com")).toBe("#");
    expect(sanitizeTiptapIframeUrl("https://www.youtube.com/embed/123", ["youtube.com"])).toBe(
      "https://www.youtube.com/embed/123"
    );
    expect(sanitizeTiptapIframeUrl("https://evil.com/embed", ["youtube.com"])).toBe("#");
  });

  it("sanitizes CSS colors, inline styles, slugs, file sizes, and LaTeX previews", () => {
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
    expect(slugifyHeadingText("Hello World! 2026")).toBe("hello-world-2026");
    expect(formatFileSize(245760)).toBe("240.0 KB");
    expect(formatLatexPreview("\\alpha + \\beta \\leq \\pi")).toBe("α + β ≤ π");
  });
});
