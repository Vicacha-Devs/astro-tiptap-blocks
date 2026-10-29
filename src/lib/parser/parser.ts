import type {
  TiptapBlockNode,
  TiptapContentInput,
  TiptapDocNode,
  TiptapHeadingLevel,
  TiptapInlineNode,
  TiptapMark,
  TiptapParserOptions,
  TiptapTocHeadingItem,
} from "../../types";
import { parseTiptapHtml } from "../html-parser";
import { isLikelyMarkdown, parseTiptapMarkdown } from "../markdown-parser";
import { resolveInternalLinkHref } from "../relations";
import {
  resolveTiptapMediaUrl,
  sanitizeCssColor,
  sanitizeTextStyleAttrs,
  sanitizeTiptapIframeUrl,
  slugifyHeadingText,
} from "../sanitize";

const extractInlineText = (nodes?: TiptapInlineNode[]): string =>
  (nodes ?? [])
    .map((n) => (n.type === "text" ? n.text : n.type === "linker" ? n.attrs.label || "" : ""))
    .join("");

const sanitizeMarks = (
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

const sanitizeInlineNodes = (
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

const sanitizeBlockNodes = (
  nodes?: TiptapBlockNode[],
  options?: TiptapParserOptions
): TiptapBlockNode[] => {
  if (!Array.isArray(nodes)) return [];
  const result: TiptapBlockNode[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object" || !("type" in node)) continue;
    switch (node.type) {
      case "heading": {
        const content = sanitizeInlineNodes(node.content, options);
        const level = (node.attrs?.level ?? 2) as TiptapHeadingLevel;
        const rawText = extractInlineText(content);
        const id = node.attrs?.id || (rawText ? slugifyHeadingText(rawText) : null);
        result.push({ ...node, attrs: { ...node.attrs, level, ...(id ? { id } : {}) }, content });
        break;
      }
      case "paragraph":
      case "leadParagraph":
        result.push({ ...node, content: sanitizeInlineNodes(node.content, options) });
        break;
      case "blockquote":
      case "informationPane":
      case "conversationHistory":
        result.push({ ...node, content: sanitizeBlockNodes(node.content, options) });
        break;
      case "details":
        result.push({
          ...node,
          content: (node.content ?? [])
            .map((child) => {
              if (child.type === "detailsSummary")
                return {
                  type: "detailsSummary" as const,
                  content: sanitizeInlineNodes(child.content, options),
                };
              if (child.type === "detailsContent")
                return {
                  type: "detailsContent" as const,
                  content: sanitizeBlockNodes(child.content, options),
                };
              return sanitizeBlockNodes([child], options)[0];
            })
            .filter(Boolean),
        });
        break;
      case "layoutContainer":
        result.push({
          ...node,
          content: (node.content ?? []).map((col) => ({
            type: "layoutColumn",
            content: sanitizeBlockNodes(col.content, options),
          })),
        });
        break;
      case "bulletList":
      case "orderedList":
        result.push({
          ...node,
          content: (node.content ?? []).map((item) => ({
            type: "listItem",
            content: sanitizeBlockNodes(item.content, options),
          })),
        });
        break;
      case "taskList":
        result.push({
          ...node,
          content: (node.content ?? []).map((item) => ({
            type: "taskItem",
            attrs: { checked: Boolean(item.attrs?.checked) },
            content: sanitizeBlockNodes(item.content, options),
          })),
        });
        break;
      case "codeBlock":
        result.push({
          ...node,
          content: sanitizeInlineNodes(node.content, options).filter((n) => n.type === "text"),
        });
        break;
      case "image":
      case "video":
      case "audio": {
        const safeSrc = resolveTiptapMediaUrl(node.attrs?.src, options);
        if (safeSrc !== "#")
          result.push({ ...node, attrs: { ...node.attrs, src: safeSrc } } as TiptapBlockNode);
        break;
      }
      case "attachment": {
        const safeHref = resolveTiptapMediaUrl(node.attrs?.href, options);
        if (safeHref !== "#") result.push({ ...node, attrs: { ...node.attrs, href: safeHref } });
        break;
      }
      case "iframe": {
        const safeSrc = sanitizeTiptapIframeUrl(node.attrs?.src, options?.allowedIframeDomains);
        if (safeSrc !== "#") result.push({ ...node, attrs: { ...node.attrs, src: safeSrc } });
        break;
      }
      case "mathematics":
        result.push({
          type: "mathematics",
          attrs: {
            latex: String(node.attrs?.latex ?? ""),
            displayMode: node.attrs?.displayMode ?? "block",
          },
        });
        break;
      case "tableOfContents":
        result.push({ ...node });
        break;
      case "pageBreak":
      case "horizontalRule":
        result.push({ type: node.type });
        break;
      case "table":
        result.push({
          ...node,
          content: (node.content ?? []).map((row) => ({
            type: "tableRow",
            content: (row.content ?? []).map((cell) => ({
              ...cell,
              attrs: {
                ...cell.attrs,
                backgroundColor: sanitizeCssColor(cell.attrs?.backgroundColor),
              },
              content: sanitizeBlockNodes(cell.content, options),
            })),
          })),
        });
        break;
      default: {
        const custom = node as unknown as {
          type?: string;
          attrs?: Record<string, unknown>;
          content?: TiptapBlockNode[];
        };
        if (typeof custom.type === "string" && custom.type.trim()) {
          const safeAttrs: Record<string, unknown> = {};
          let hasUnsafeUrl = false;
          for (const [k, v] of Object.entries(custom.attrs ?? {})) {
            if (typeof v === "string" && (/^(src|href)$/i.test(k) || k.endsWith("Url"))) {
              const resolved = resolveTiptapMediaUrl(v, options);
              if (resolved === "#") {
                hasUnsafeUrl = true;
                break;
              }
              safeAttrs[k] = resolved;
            } else safeAttrs[k] = v;
          }
          if (!hasUnsafeUrl) {
            result.push({
              type: custom.type,
              ...(custom.attrs ? { attrs: safeAttrs } : {}),
              ...(Array.isArray(custom.content)
                ? { content: sanitizeBlockNodes(custom.content, options) }
                : {}),
            } as unknown as TiptapBlockNode);
          }
        }
        break;
      }
    }
  }
  return result;
};

const populateTocBlocks = (blocks: TiptapBlockNode[]): TiptapBlockNode[] => {
  const headings: TiptapTocHeadingItem[] = [];
  for (const b of blocks) {
    if (b.type === "heading") {
      const text = extractInlineText(b.content).trim();
      if (text)
        headings.push({
          id: b.attrs?.id || slugifyHeadingText(text),
          text,
          level: b.attrs?.level ?? 2,
        });
    }
  }
  return blocks.map((b) =>
    b.type === "tableOfContents" && (!b.attrs?.headings || b.attrs.headings.length === 0)
      ? { ...b, attrs: { ...b.attrs, headings } }
      : b
  );
};

export const parseTiptapContent = (
  input: TiptapContentInput,
  options?: TiptapParserOptions
): TiptapDocNode => {
  if (!input) return { type: "doc", content: [] };
  if (Array.isArray(input)) {
    if (input.length === 0) return { type: "doc", content: [] };
    if (typeof input[0] === "string") {
      return {
        type: "doc",
        content: (input as unknown as string[])
          .filter((p) => typeof p === "string" && p.trim().length > 0)
          .map((p) => ({ type: "paragraph", content: [{ type: "text", text: p }] })),
      };
    }
    return {
      type: "doc",
      content: populateTocBlocks(sanitizeBlockNodes(input as TiptapBlockNode[], options)),
    };
  }
  if (typeof input === "object" && "type" in input && input.type === "doc") {
    const docInput = input as TiptapDocNode;
    const content = populateTocBlocks(sanitizeBlockNodes(docInput.content, options));
    return {
      type: "doc",
      content,
      ...(typeof docInput.words === "number" ? { words: docInput.words } : {}),
      ...(typeof docInput.characters === "number" ? { characters: docInput.characters } : {}),
      ...(typeof docInput.readingTimeMinutes === "number"
        ? { readingTimeMinutes: docInput.readingTimeMinutes }
        : {}),
      ...(typeof docInput.readingTime === "string" ? { readingTime: docInput.readingTime } : {}),
      ...(docInput.stats && typeof docInput.stats === "object" ? { stats: docInput.stats } : {}),
    };
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return { type: "doc", content: [] };
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return parseTiptapContent(JSON.parse(trimmed), options);
      } catch {
        /* fall through */
      }
    }
    if (
      trimmed.startsWith("<") &&
      !/^<!--\s*(?:pagebreak|toc|tiptap-node:)/i.test(trimmed) &&
      !trimmed.includes("<!-- tiptap-node:")
    )
      return parseTiptapContent(parseTiptapHtml(trimmed), options);
    if (isLikelyMarkdown(trimmed)) return parseTiptapContent(parseTiptapMarkdown(trimmed), options);
    if (trimmed.includes("<") && trimmed.includes(">"))
      return parseTiptapContent(parseTiptapHtml(trimmed), options);
    return {
      type: "doc",
      content: trimmed
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
    };
  }
  return { type: "doc", content: [] };
};
