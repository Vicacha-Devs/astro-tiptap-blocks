import type { TiptapMediaUrlResolver, TiptapTextStyleMarkAttrs } from "../../types";

const SAFE_URL_PROTOCOLS = ["http:", "https:", "mailto:", "tel:", "strapi:"];
const SAFE_DATA_URI_REGEX =
  /^data:(?:image\/(?:png|jpeg|jpg|gif|webp|avif)|audio\/(?:wav|mpeg|mp3|ogg|webm));base64,[a-z0-9+/=\s]+$/i;

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
};

export const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (match) => HTML_ENTITIES[match] ?? match)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

/**
 * Validates and sanitizes a URL for safe rendering in `href` or `src` attributes.
 * Blocks `javascript:`, `vbscript:`, `data:text/html`, `data:image/svg+xml`, and `//` protocol-relative URLs.
 */
export const sanitizeTiptapUrl = (rawUrl: string | null | undefined): string => {
  if (!rawUrl || typeof rawUrl !== "string") return "#";
  const trimmed = decodeHtmlEntities(rawUrl).trim();
  if (!trimmed || trimmed.startsWith("//")) return "#";
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return trimmed;
  }
  const normalized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]+/g, "").toLowerCase();
  if (normalized.startsWith("javascript:") || normalized.startsWith("vbscript:")) return "#";
  if (normalized.startsWith("data:")) return SAFE_DATA_URI_REGEX.test(trimmed) ? trimmed : "#";
  if (normalized.startsWith("strapi://")) {
    return /^strapi:\/\/[a-zA-Z0-9_.:-]+\/[a-zA-Z0-9_.:-]+$/.test(trimmed) ? trimmed : "#";
  }
  try {
    const parsed = new URL(trimmed);
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol.toLowerCase()) ? trimmed : "#";
  } catch {
    return !trimmed.includes(":") ? trimmed : "#";
  }
};

/**
 * Resolves relative Strapi media URLs (e.g. `/uploads/photo.webp`) using `mediaBaseUrl` or `resolveMediaUrl`
 * before running `sanitizeTiptapUrl()`.
 */
export const resolveTiptapMediaUrl = (
  rawUrl: string | null | undefined,
  options?: { mediaBaseUrl?: string; resolveMediaUrl?: TiptapMediaUrlResolver }
): string => {
  if (!rawUrl || typeof rawUrl !== "string") return "#";
  const custom = options?.resolveMediaUrl ? options.resolveMediaUrl(rawUrl) : rawUrl;
  const candidate = (custom ?? rawUrl).trim();
  if (options?.mediaBaseUrl && candidate.startsWith("/") && !candidate.startsWith("//")) {
    const base = options.mediaBaseUrl.trim().replace(/\/+$/, "");
    return sanitizeTiptapUrl(`${base}${candidate}`);
  }
  return sanitizeTiptapUrl(candidate);
};

/**
 * Enforces HTTPS-only URLs and optional domain allowlist for sandboxed `<iframe>` embeds.
 */
export const sanitizeTiptapIframeUrl = (
  rawUrl: string | null | undefined,
  allowedDomains?: ReadonlyArray<string>
): string => {
  const safe = sanitizeTiptapUrl(rawUrl);
  if (safe === "#") return "#";
  try {
    const parsed = new URL(safe);
    if (parsed.protocol.toLowerCase() !== "https:") return "#";
    if (allowedDomains && allowedDomains.length > 0) {
      const host = parsed.hostname.toLowerCase();
      const allowed = allowedDomains.some((domain) => {
        const clean = domain.toLowerCase().trim();
        return host === clean || host.endsWith(`.${clean}`);
      });
      if (!allowed) return "#";
    }
    return parsed.toString();
  } catch {
    return "#";
  }
};

const SAFE_COLOR_REGEX =
  /^(#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla)\(\s*[\d.,%\s/]+\)|var\(--[a-zA-Z0-9_-]+\)|[a-zA-Z]{3,20})$/;
const SAFE_DIMENSION_REGEX = /^\d+(?:\.\d+)?(?:px|rem|em|%|pt|ch|vh|vw)?$/;
const SAFE_FONT_FAMILY_REGEX = /^[a-zA-Z0-9\s,'"-]+$/;

export const sanitizeCssColor = (color: string | null | undefined): string | null => {
  if (!color || typeof color !== "string") return null;
  const trimmed = color.trim();
  return SAFE_COLOR_REGEX.test(trimmed) ? trimmed : null;
};

export const sanitizeCssDimension = (val: string | null | undefined): string | null => {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  return SAFE_DIMENSION_REGEX.test(trimmed) ? trimmed : null;
};

export const sanitizeCssFontFamily = (font: string | null | undefined): string | null => {
  if (!font || typeof font !== "string") return null;
  const trimmed = font.trim();
  return SAFE_FONT_FAMILY_REGEX.test(trimmed) && !/url\(|expression\(|;/i.test(trimmed) ? trimmed : null;
};

export const sanitizeTextStyleAttrs = (
  attrs?: TiptapTextStyleMarkAttrs
): TiptapTextStyleMarkAttrs | undefined => {
  if (!attrs) return undefined;
  const color = sanitizeCssColor(attrs.color);
  const fontFamily = sanitizeCssFontFamily(attrs.fontFamily);
  const fontSize = sanitizeCssDimension(attrs.fontSize);
  const lineHeight = sanitizeCssDimension(attrs.lineHeight);
  if (!color && !fontFamily && !fontSize && !lineHeight) return undefined;
  return {
    ...(color ? { color } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontSize ? { fontSize } : {}),
    ...(lineHeight ? { lineHeight } : {}),
  };
};

export const buildSafeInlineStyle = (attrs?: TiptapTextStyleMarkAttrs): string | undefined => {
  const safe = sanitizeTextStyleAttrs(attrs);
  if (!safe) return undefined;
  const parts: string[] = [];
  if (safe.color) parts.push(`color: ${safe.color}`);
  if (safe.fontFamily) parts.push(`font-family: ${safe.fontFamily}`);
  if (safe.fontSize) parts.push(`font-size: ${safe.fontSize}`);
  if (safe.lineHeight) parts.push(`line-height: ${safe.lineHeight}`);
  return parts.length > 0 ? parts.join("; ") : undefined;
};

export const slugifyHeadingText = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

export const formatFileSize = (bytes: number | string | null | undefined): string => {
  const num = typeof bytes === "string" ? Number(bytes) : bytes;
  if (!num || Number.isNaN(num) || num <= 0) return "";
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

const LATEX_SYMBOLS: Array<[RegExp, string]> = [
  [/\\alpha(?![a-zA-Z])/g, "α"], [/\\beta(?![a-zA-Z])/g, "β"], [/\\gamma(?![a-zA-Z])/g, "γ"], [/\\delta(?![a-zA-Z])/g, "δ"],
  [/\\pi(?![a-zA-Z])/g, "π"], [/\\theta(?![a-zA-Z])/g, "θ"], [/\\lambda(?![a-zA-Z])/g, "λ"], [/\\sigma(?![a-zA-Z])/g, "σ"],
  [/\\omega(?![a-zA-Z])/g, "ω"], [/\\infty(?![a-zA-Z])/g, "∞"], [/\\sum(?![a-zA-Z])/g, "∑"], [/\\prod(?![a-zA-Z])/g, "∏"],
  [/\\int(?![a-zA-Z])/g, "∫"], [/\\sqrt\{([^}]+)\}/g, "√($1)"], [/\\sqrt(?![a-zA-Z])/g, "√"],
  [/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)"],
  [/\\pm(?![a-zA-Z])/g, "±"], [/\\times(?![a-zA-Z])/g, "×"], [/\\div(?![a-zA-Z])/g, "÷"], [/\\cdot(?![a-zA-Z])/g, "·"],
  [/\\neq(?![a-zA-Z])/g, "≠"], [/\\leq(?![a-zA-Z])/g, "≤"], [/\\geq(?![a-zA-Z])/g, "≥"], [/\\approx(?![a-zA-Z])/g, "≈"],
  [/\\rightarrow(?![a-zA-Z])|\\to(?![a-zA-Z])/g, "→"], [/\\leftarrow(?![a-zA-Z])/g, "←"], [/\\Rightarrow(?![a-zA-Z])/g, "⇒"],
];

export const formatLatexPreview = (latex: string | null | undefined): string => {
  if (!latex) return "";
  let result = latex.trim();
  for (const [pattern, replacement] of LATEX_SYMBOLS) {
    result = result.replace(pattern, replacement);
  }
  return result;
};
