import type {
  TiptapBlockNode,
  TiptapContentInput,
  TiptapDocNode,
  TiptapInlineNode,
  TiptapMark,
} from "../types";
import { parseTiptapHtml } from "./html-parser";
import { sanitizeTiptapUrl } from "./sanitize";

const sanitizeMarks = (marks?: TiptapMark[]): TiptapMark[] | undefined => {
  if (!Array.isArray(marks) || marks.length === 0) {
    return undefined;
  }
  return marks.map((mark) => {
    if (mark.type === "link") {
      return {
        ...mark,
        attrs: {
          ...mark.attrs,
          href: sanitizeTiptapUrl(mark.attrs?.href),
        },
      };
    }
    return mark;
  });
};

const sanitizeInlineNodes = (nodes?: TiptapInlineNode[]): TiptapInlineNode[] => {
  if (!Array.isArray(nodes)) {
    return [];
  }
  return nodes
    .filter((node): node is TiptapInlineNode => Boolean(node && typeof node === "object" && "type" in node))
    .map((node) => {
      if (node.type === "text") {
        const marks = sanitizeMarks(node.marks);
        return {
          type: "text",
          text: typeof node.text === "string" ? node.text : "",
          ...(marks ? { marks } : {}),
        };
      }
      return { type: "hardBreak" };
    });
};

const sanitizeBlockNodes = (nodes?: TiptapBlockNode[]): TiptapBlockNode[] => {
  if (!Array.isArray(nodes)) {
    return [];
  }
  const result: TiptapBlockNode[] = [];

  for (const node of nodes) {
    if (!node || typeof node !== "object" || !("type" in node)) {
      continue;
    }
    switch (node.type) {
      case "heading":
        result.push({
          ...node,
          attrs: { level: node.attrs?.level ?? 2, textAlign: node.attrs?.textAlign },
          content: sanitizeInlineNodes(node.content),
        });
        break;
      case "paragraph":
        result.push({
          ...node,
          content: sanitizeInlineNodes(node.content),
        });
        break;
      case "blockquote":
        result.push({
          ...node,
          content: sanitizeBlockNodes(node.content),
        });
        break;
      case "bulletList":
      case "orderedList":
        result.push({
          ...node,
          content: (node.content ?? []).map((item) => ({
            type: "listItem",
            content: sanitizeBlockNodes(item.content),
          })),
        });
        break;
      case "codeBlock":
        result.push({
          ...node,
          content: sanitizeInlineNodes(node.content) as Extract<TiptapInlineNode, { type: "text" }>[],
        });
        break;
      case "image": {
        const safeSrc = sanitizeTiptapUrl(node.attrs?.src);
        if (safeSrc !== "#") {
          result.push({
            ...node,
            attrs: {
              ...node.attrs,
              src: safeSrc,
            },
          });
        }
        break;
      }
      case "table":
        result.push({
          ...node,
          content: (node.content ?? []).map((row) => ({
            type: "tableRow",
            content: (row.content ?? []).map((cell) => ({
              ...cell,
              content: sanitizeBlockNodes(cell.content),
            })),
          })),
        });
        break;
      case "horizontalRule":
        result.push({ type: "horizontalRule" });
        break;
    }
  }
  return result;
};

/**
 * Normalizes any Tiptap input (ProseMirror JSON AST, JSON string, HTML string, or string[] paragraphs)
 * into a validated, sanitized `TiptapDocNode` AST ready for `<TiptapBlocks />`.
 */
export const parseTiptapContent = (input: TiptapContentInput): TiptapDocNode => {
  if (!input) {
    return { type: "doc", content: [] };
  }

  if (Array.isArray(input)) {
    // Either TiptapBlockNode[] or string[]
    if (input.length === 0) {
      return { type: "doc", content: [] };
    }
    if (typeof input[0] === "string") {
      return {
        type: "doc",
        content: (input as string[])
          .filter((paragraph) => typeof paragraph === "string" && paragraph.trim().length > 0)
          .map((paragraph) => ({
            type: "paragraph",
            content: [{ type: "text", text: paragraph }],
          })),
      };
    }
    return {
      type: "doc",
      content: sanitizeBlockNodes(input as TiptapBlockNode[]),
    };
  }

  if (typeof input === "object" && "type" in input && input.type === "doc") {
    return {
      type: "doc",
      content: sanitizeBlockNodes(input.content),
    };
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      return { type: "doc", content: [] };
    }
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseTiptapContent(parsed);
      } catch {
        // Fall through to HTML/plain text parsing
      }
    }
    if (trimmed.includes("<") && trimmed.includes(">")) {
      return parseTiptapHtml(trimmed);
    }
    return {
      type: "doc",
      content: trimmed
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((text) => ({
          type: "paragraph",
          content: [{ type: "text", text }],
        })),
    };
  }

  return { type: "doc", content: [] };
};
