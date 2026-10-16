const SAFE_URL_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/**
 * Validates and sanitizes a URL for safe rendering in `href` or `src` attributes.
 * Blocks `javascript:`, `vbscript:`, `data:text/html`, and other dangerous schemes.
 */
export const sanitizeTiptapUrl = (rawUrl: string | null | undefined): string => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "#";
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "#";
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return trimmed;
  }

  // Strip control characters and whitespace before protocol check
  const normalized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]+/g, "").toLowerCase();
  if (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("vbscript:") ||
    normalized.startsWith("data:")
  ) {
    return "#";
  }

  try {
    const parsed = new URL(trimmed);
    if (SAFE_URL_PROTOCOLS.includes(parsed.protocol.toLowerCase())) {
      return trimmed;
    }
    return "#";
  } catch {
    // Relative path without leading slash (e.g. "about" or "images/photo.jpg")
    if (!trimmed.includes(":")) {
      return trimmed;
    }
    return "#";
  }
};

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

export const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (match) => HTML_ENTITIES[match] ?? match)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
