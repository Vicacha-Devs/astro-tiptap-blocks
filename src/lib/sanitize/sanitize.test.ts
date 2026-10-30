import {
  buildSafeInlineStyle,
  decodeHtmlEntities,
  formatFileSize,
  formatLatexPreview,
  isTrustedMediaEmbedUrl,
  resolveTiptapMediaUrl,
  sanitizeCssColor,
  sanitizeTiptapIframeUrl,
  sanitizeTiptapSrcset,
  sanitizeTiptapUrl,
  slugifyHeadingText,
} from "./sanitize";

describe("sanitize utilities (lib/sanitize)", () => {
  it("whitelists safe URL protocols and neutralizes XSS and backslash protocol-relative schemes", () => {
    expect(sanitizeTiptapUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("  JaVaScRiPt:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("&#106;avascript:alert(1)")).toBe("#");
    expect(sanitizeTiptapUrl("//evil.example.com/payload.js")).toBe("#");
    expect(sanitizeTiptapUrl("/\\evil.example.com/payload.js")).toBe("#");
    expect(sanitizeTiptapUrl("\\\\evil.example.com/payload.js")).toBe("#");
    expect(sanitizeTiptapUrl("\\evil.example.com/payload.js")).toBe("#");
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

  it("decodes supplementary plane emojis and guards out-of-range or surrogate code points", () => {
    expect(decodeHtmlEntities("Rocket &#128640; &#x1F680; &AMP; &QUOT;")).toBe('Rocket 🚀 🚀 & "');
    expect(decodeHtmlEntities("&#999999999; &#xD800;")).toBe("&#999999999; &#xD800;");
  });

  it("resolves relative media URLs and sanitizes responsive srcset strings", () => {
    expect(
      resolveTiptapMediaUrl("/uploads/mosque_hero.webp", {
        mediaBaseUrl: "https://cms.mezquitabogota.org/",
      })
    ).toBe("https://cms.mezquitabogota.org/uploads/mosque_hero.webp");

    expect(
      resolveTiptapMediaUrl("/uploads/doc.pdf", {
        resolveMediaUrl: (url) => `https://cdn.example.com${url}`,
      })
    ).toBe("https://cdn.example.com/uploads/doc.pdf");

    expect(
      sanitizeTiptapSrcset(
        "/uploads/small.webp 400w, javascript:alert(1) 800w, //evil.com/x.png 2x, /uploads/large.webp 2x",
        { mediaBaseUrl: "https://cdn.example.com" }
      )
    ).toBe(
      "https://cdn.example.com/uploads/small.webp 400w, https://cdn.example.com/uploads/large.webp 2x"
    );
    expect(sanitizeTiptapSrcset("javascript:alert(1) 1x")).toBeUndefined();
  });

  it("enforces HTTPS, normalizes YouTube/Vimeo embed URLs, and checks trusted embed hosts", () => {
    expect(sanitizeTiptapIframeUrl("http://example.com")).toBe("#");
    expect(sanitizeTiptapIframeUrl("https://www.youtube.com/embed/123", ["youtube.com"])).toBe(
      "https://www.youtube.com/embed/123"
    );
    expect(sanitizeTiptapIframeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    expect(sanitizeTiptapIframeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    expect(sanitizeTiptapIframeUrl("https://vimeo.com/12345678")).toBe(
      "https://player.vimeo.com/video/12345678"
    );
    expect(sanitizeTiptapIframeUrl("https://evil.com/embed", ["youtube.com"])).toBe("#");
    expect(isTrustedMediaEmbedUrl("https://www.youtube.com/embed/123")).toBe(true);
    expect(isTrustedMediaEmbedUrl("https://untrusted.example.com/embed")).toBe(false);
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
