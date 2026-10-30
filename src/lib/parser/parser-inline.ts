import type {
  TiptapBlockNode,
  TiptapDetailsContentNode,
  TiptapDetailsNode,
  TiptapDetailsSummaryNode,
  TiptapInlineNode,
  TiptapMark,
  TiptapParserOptions,
} from "../../types";
import { resolveInternalLinkHref } from "../relations/relations-uri";
import {
  resolveTiptapMediaUrl,
  sanitizeCssColor,
  sanitizeTextStyleAttrs,
  sanitizeTiptapSrcset,
  slugifyHeadingText,
} from "../sanitize";

const BLOCKED_CUSTOM_ATTR_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const URL_ATTR_KEY_REGEX =
  /^(?:src|href|url|action|formaction)$|(?:Url|Href|Src|Uri|_url|_href|_src|-url|-href|-src)$/;

export const extractInlineText = (nodes?: TiptapInlineNode[]): string =>
  (nodes ?? [])
    .map((n) => (n.type === "text" ? n.text : n.type === "linker" ? n.attrs.label || "" : ""))
    .join("");

export const extractDetailsParts = (
  content: TiptapDetailsNode["content"] = []
): { summary: TiptapInlineNode[]; body: TiptapBlockNode[] } => {
  const summaryNode = content.find(
    (child): child is TiptapDetailsSummaryNode => child.type === "detailsSummary"
  );
  const detailsContentNode = content.find(
    (child): child is TiptapDetailsContentNode => child.type === "detailsContent"
  );
  const body = detailsContentNode
    ? detailsContentNode.content || []
    : (content.filter(
        (child) => child.type !== "detailsSummary" && child.type !== "detailsContent"
      ) as TiptapBlockNode[]);
  return { summary: summaryNode?.content || [], body };
};

export const sanitizeMarks = (
  marks?: TiptapMark[],
  options?: TiptapParserOptions
): TiptapMark[] | undefined => {
  if (!Array.isArray(marks) || marks.length === 0) return undefined;
  const result: TiptapMark[] = [];
  for (const mark of marks) {
    if (!mark || typeof mark !== "object" || !("type" in mark)) continue;
    if (mark.type === "link") {
      result.push({
        ...mark,
        attrs: {
          ...mark.attrs,
          href: resolveInternalLinkHref({ href: mark.attrs?.href }, options?.resolveInternalLink),
        },
      });
    } else if (mark.type === "highlight") {
      const color = sanitizeCssColor(mark.attrs?.color);
      result.push({ type: "highlight", ...(color ? { attrs: { color } } : {}) });
    } else if (mark.type === "textStyle") {
      const safeAttrs = sanitizeTextStyleAttrs(mark.attrs);
      if (safeAttrs) result.push({ type: "textStyle", attrs: safeAttrs });
    } else {
      result.push(mark);
    }
  }
  return result.length > 0 ? result : undefined;
};

export const sanitizeInlineNodes = (
  nodes?: TiptapInlineNode[],
  options?: TiptapParserOptions
): TiptapInlineNode[] => {
  if (!Array.isArray(nodes)) return [];
  const result: TiptapInlineNode[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object" || !("type" in node)) continue;
    if (node.type === "text") {
      const marks = sanitizeMarks(node.marks, options);
      result.push({
        type: "text",
        text: typeof node.text === "string" ? node.text : "",
        ...(marks ? { marks } : {}),
      });
    } else if (node.type === "hardBreak") {
      result.push({ type: "hardBreak" });
    } else if (node.type === "linker") {
      const href = resolveInternalLinkHref(node.attrs || {}, options?.resolveInternalLink);
      result.push({ ...node, attrs: { ...node.attrs, href } });
    } else if (node.type === "mathematics") {
      result.push({
        type: "mathematics",
        attrs: {
          latex: String(node.attrs?.latex ?? ""),
          displayMode: node.attrs?.displayMode ?? "inline",
        },
      });
    }
  }
  return result;
};

export const allocateHeadingId = (
  explicitId: string | null | undefined,
  rawText: string,
  usedIds: Map<string, number>
): string | null => {
  if (explicitId && explicitId.trim()) {
    const clean = explicitId.trim();
    usedIds.set(clean, (usedIds.get(clean) ?? 0) + 1);
    return clean;
  }
  if (!rawText.trim()) return null;
  const base = slugifyHeadingText(rawText);
  const count = (usedIds.get(base) ?? 0) + 1;
  usedIds.set(base, count);
  return count === 1 ? base : `${base}-${count}`;
};

export const sanitizeCustomBlock = (
  custom: { type?: string; attrs?: Record<string, unknown>; content?: TiptapBlockNode[] },
  options: TiptapParserOptions | undefined,
  recurse: (children?: TiptapBlockNode[]) => TiptapBlockNode[]
): TiptapBlockNode | null => {
  if (typeof custom.type !== "string" || !custom.type.trim()) return null;
  const safeAttrs: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(custom.attrs ?? {})) {
    if (BLOCKED_CUSTOM_ATTR_KEYS.has(k) || /^on[a-z]/i.test(k)) continue;
    if (typeof v === "string" && /srcset$/i.test(k)) {
      const safeSrcset = sanitizeTiptapSrcset(v, options);
      if (!safeSrcset) return null;
      safeAttrs[k] = safeSrcset;
    } else if (typeof v === "string" && URL_ATTR_KEY_REGEX.test(k)) {
      const resolved = resolveTiptapMediaUrl(v, options);
      if (resolved === "#") return null;
      safeAttrs[k] = resolved;
    } else {
      safeAttrs[k] = v;
    }
  }
  return {
    type: custom.type,
    ...(custom.attrs ? { attrs: safeAttrs } : {}),
    ...(Array.isArray(custom.content) ? { content: recurse(custom.content) } : {}),
  } as unknown as TiptapBlockNode;
};
