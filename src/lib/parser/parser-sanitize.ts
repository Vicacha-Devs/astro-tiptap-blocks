import type { TiptapBlockNode, TiptapHeadingLevel, TiptapParserOptions } from "../../types";
import {
  resolveTiptapMediaUrl,
  sanitizeCssColor,
  sanitizeTiptapIframeUrl,
  sanitizeTiptapSrcset,
} from "../sanitize";
import {
  allocateHeadingId,
  extractInlineText,
  sanitizeCustomBlock,
  sanitizeInlineNodes,
} from "./parser-inline";

export const sanitizeBlockNodes = (
  nodes?: TiptapBlockNode[],
  options?: TiptapParserOptions,
  usedHeadingIds: Map<string, number> = new Map()
): TiptapBlockNode[] => {
  if (!Array.isArray(nodes)) return [];
  const recurse = (children?: TiptapBlockNode[]) =>
    sanitizeBlockNodes(children, options, usedHeadingIds);
  const result: TiptapBlockNode[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object" || !("type" in node)) continue;
    switch (node.type) {
      case "heading": {
        const content = sanitizeInlineNodes(node.content, options);
        const level = (node.attrs?.level ?? 2) as TiptapHeadingLevel;
        const id = allocateHeadingId(node.attrs?.id, extractInlineText(content), usedHeadingIds);
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
        result.push({ ...node, content: recurse(node.content) });
        break;
      case "details":
        result.push({
          ...node,
          content: (node.content ?? [])
            .map((child) =>
              child.type === "detailsSummary"
                ? {
                    type: "detailsSummary" as const,
                    content: sanitizeInlineNodes(child.content, options),
                  }
                : child.type === "detailsContent"
                  ? { type: "detailsContent" as const, content: recurse(child.content) }
                  : recurse([child])[0]
            )
            .filter(Boolean),
        });
        break;
      case "layoutContainer":
        result.push({
          ...node,
          content: (node.content ?? []).map((col) => ({
            type: "layoutColumn",
            content: recurse(col.content),
          })),
        });
        break;
      case "bulletList":
      case "orderedList":
        result.push({
          ...node,
          content: (node.content ?? []).map((item) => ({
            type: "listItem",
            content: recurse(item.content),
          })),
        });
        break;
      case "taskList":
        result.push({
          ...node,
          content: (node.content ?? []).map((item) => ({
            type: "taskItem",
            attrs: { checked: Boolean(item.attrs?.checked) },
            content: recurse(item.content),
          })),
        });
        break;
      case "codeBlock":
        result.push({
          ...node,
          content: sanitizeInlineNodes(node.content, options).filter((n) => n.type === "text"),
        });
        break;
      case "image": {
        const safeSrc = resolveTiptapMediaUrl(node.attrs?.src, options);
        if (safeSrc !== "#") {
          const safeSrcset = sanitizeTiptapSrcset(node.attrs?.srcset, options);
          result.push({
            ...node,
            attrs: { ...node.attrs, src: safeSrc, ...(safeSrcset ? { srcset: safeSrcset } : {}) },
          });
        }
        break;
      }
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
              content: recurse(cell.content),
            })),
          })),
        });
        break;
      default: {
        const safeCustom = sanitizeCustomBlock(node as never, options, recurse);
        if (safeCustom) result.push(safeCustom);
        break;
      }
    }
  }
  return result;
};
