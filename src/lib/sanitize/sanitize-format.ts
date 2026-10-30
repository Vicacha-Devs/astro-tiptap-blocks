import type { TiptapTextStyleMarkAttrs } from "../../types";

export const DEFAULT_ALLOWED_IFRAME_DOMAINS: ReadonlyArray<string> = [
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
  "open.spotify.com",
  "w.soundcloud.com",
  "codepen.io",
  "codesandbox.io",
  "stackblitz.com",
  "figma.com",
  "loom.com",
  "openstreetmap.org",
  "google.com",
  "maps.google.com",
];

export const normalizeEmbedUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if ((host === "youtube.com" || host === "www.youtube.com") && parsed.pathname === "/watch") {
      const videoId = parsed.searchParams.get("v");
      if (videoId && /^[\w-]{6,20}$/.test(videoId)) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    if (host === "youtu.be" && /^\/[\w-]{6,20}$/.test(parsed.pathname)) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if ((host === "vimeo.com" || host === "www.vimeo.com") && /^\/\d+$/.test(parsed.pathname)) {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

export const isTrustedMediaEmbedUrl = (url: string | null | undefined): boolean => {
  if (!url || url === "#") return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return DEFAULT_ALLOWED_IFRAME_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch {
    return false;
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
  return SAFE_FONT_FAMILY_REGEX.test(trimmed) && !/url\(|expression\(|;/i.test(trimmed)
    ? trimmed
    : null;
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
  [/\\alpha(?![a-zA-Z])/g, "α"],
  [/\\beta(?![a-zA-Z])/g, "β"],
  [/\\gamma(?![a-zA-Z])/g, "γ"],
  [/\\delta(?![a-zA-Z])/g, "δ"],
  [/\\pi(?![a-zA-Z])/g, "π"],
  [/\\theta(?![a-zA-Z])/g, "θ"],
  [/\\lambda(?![a-zA-Z])/g, "λ"],
  [/\\sigma(?![a-zA-Z])/g, "σ"],
  [/\\omega(?![a-zA-Z])/g, "ω"],
  [/\\infty(?![a-zA-Z])/g, "∞"],
  [/\\sum(?![a-zA-Z])/g, "∑"],
  [/\\prod(?![a-zA-Z])/g, "∏"],
  [/\\int(?![a-zA-Z])/g, "∫"],
  [/\\sqrt\{([^}]+)\}/g, "√($1)"],
  [/\\sqrt(?![a-zA-Z])/g, "√"],
  [/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)"],
  [/\\pm(?![a-zA-Z])/g, "±"],
  [/\\times(?![a-zA-Z])/g, "×"],
  [/\\div(?![a-zA-Z])/g, "÷"],
  [/\\cdot(?![a-zA-Z])/g, "·"],
  [/\\neq(?![a-zA-Z])/g, "≠"],
  [/\\leq(?![a-zA-Z])/g, "≤"],
  [/\\geq(?![a-zA-Z])/g, "≥"],
  [/\\approx(?![a-zA-Z])/g, "≈"],
  [/\\rightarrow(?![a-zA-Z])|\\to(?![a-zA-Z])/g, "→"],
  [/\\leftarrow(?![a-zA-Z])/g, "←"],
  [/\\Rightarrow(?![a-zA-Z])/g, "⇒"],
];

export const formatLatexPreview = (latex: string | null | undefined): string => {
  if (!latex) return "";
  let result = latex.trim();
  for (const [pattern, replacement] of LATEX_SYMBOLS) {
    result = result.replace(pattern, replacement);
  }
  return result;
};
