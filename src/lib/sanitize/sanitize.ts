import type { TiptapMediaUrlResolver } from "../../types";
import { normalizeEmbedUrl } from "./sanitize-format";

export * from "./sanitize-format";

const SAFE_URL_PROTOCOLS = [
  "http:",
  "https:",
  "mailto:",
  "tel:",
  "tiptap:",
  "internal:",
  "cms:",
  "doc:",
];
const SAFE_DATA_URI_REGEX =
  /^data:(?:image\/(?:png|jpeg|jpg|gif|webp|avif)|audio\/(?:wav|mpeg|mp3|ogg|webm));base64,[a-z0-9+/=\s]+$/i;

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

const safeFromCodePoint = (code: number, fallback: string): string => {
  if (
    !Number.isInteger(code) ||
    code < 0 ||
    code > 0x10ffff ||
    (code >= 0xd800 && code <= 0xdfff)
  ) {
    return fallback;
  }
  return String.fromCodePoint(code);
};

export const decodeHtmlEntities = (text: string): string =>
  text
    .replace(
      /&(?:amp|lt|gt|quot|#39|apos|nbsp);/gi,
      (match) => HTML_ENTITIES[match.toLowerCase()] ?? match
    )
    .replace(/&#(\d+);/g, (match, dec) => safeFromCodePoint(Number(dec), match))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => safeFromCodePoint(parseInt(hex, 16), match));

/**
 * Validates and sanitizes a URL for safe rendering in `href` or `src` attributes.
 * Blocks `javascript:`, `vbscript:`, `data:text/html`, `data:image/svg+xml`, and `//` or `/\` protocol-relative URLs.
 */
export const sanitizeTiptapUrl = (rawUrl: string | null | undefined): string => {
  if (!rawUrl || typeof rawUrl !== "string") return "#";
  const trimmed = decodeHtmlEntities(rawUrl)
    .replace(/[\u0000-\u001F\u007F-\u009F]+/g, "")
    .trim();
  if (!trimmed || /^[/\\]{2}|^\\/.test(trimmed)) return "#";
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return trimmed;
  }
  const normalized = trimmed.replace(/\s+/g, "").toLowerCase();
  if (normalized.startsWith("javascript:") || normalized.startsWith("vbscript:")) return "#";
  if (normalized.startsWith("data:")) return SAFE_DATA_URI_REGEX.test(trimmed) ? trimmed : "#";
  if (/^(?:tiptap|internal|cms|doc):\/\//.test(normalized)) {
    return /^(?:tiptap|internal|cms|doc):\/\/[a-zA-Z0-9_.:-]+\/[a-zA-Z0-9_.:-]+$/.test(trimmed)
      ? trimmed
      : "#";
  }
  try {
    const parsed = new URL(trimmed);
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol.toLowerCase()) ? trimmed : "#";
  } catch {
    return !trimmed.includes(":") && !trimmed.includes("\\") ? trimmed : "#";
  }
};

/**
 * Resolves relative media URLs (e.g. `/uploads/photo.webp`) using `mediaBaseUrl` or `resolveMediaUrl`
 * before running `sanitizeTiptapUrl()`.
 */
export const resolveTiptapMediaUrl = (
  rawUrl: string | null | undefined,
  options?: { mediaBaseUrl?: string; resolveMediaUrl?: TiptapMediaUrlResolver }
): string => {
  if (!rawUrl || typeof rawUrl !== "string") return "#";
  const custom = options?.resolveMediaUrl ? options.resolveMediaUrl(rawUrl) : rawUrl;
  const candidate = (custom ?? rawUrl).trim();
  if (options?.mediaBaseUrl && candidate.startsWith("/") && !/^[/\\]{2}/.test(candidate)) {
    const base = options.mediaBaseUrl.trim().replace(/\/+$/, "");
    return sanitizeTiptapUrl(`${base}${candidate}`);
  }
  return sanitizeTiptapUrl(candidate);
};

/**
 * Sanitizes a responsive `srcset` attribute string by validating and resolving every candidate URL.
 */
export const sanitizeTiptapSrcset = (
  rawSrcset: string | null | undefined,
  options?: { mediaBaseUrl?: string; resolveMediaUrl?: TiptapMediaUrlResolver }
): string | undefined => {
  if (!rawSrcset || typeof rawSrcset !== "string") return undefined;
  const safeParts: string[] = [];
  for (const entry of rawSrcset.split(",")) {
    const tokens = entry.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0 || tokens.length > 2) continue;
    const safeUrl = resolveTiptapMediaUrl(tokens[0], options);
    if (safeUrl === "#") continue;
    if (tokens.length === 2) {
      if (!/^\d+(?:\.\d+)?[wx]$/i.test(tokens[1])) continue;
      safeParts.push(`${safeUrl} ${tokens[1]}`);
    } else {
      safeParts.push(safeUrl);
    }
  }
  return safeParts.length > 0 ? safeParts.join(", ") : undefined;
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
    const parsed = new URL(normalizeEmbedUrl(safe));
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
