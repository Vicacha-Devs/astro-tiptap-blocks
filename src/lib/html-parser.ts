import type {
  TiptapBlockNode,
  TiptapDocNode,
  TiptapHeadingLevel,
  TiptapInlineNode,
  TiptapListItemNode,
  TiptapMark,
  TiptapTableCellNode,
  TiptapTableRowNode,
} from "../types";
import { decodeHtmlEntities, sanitizeTiptapUrl } from "./sanitize";

interface HtmlToken {
  type: "open" | "close" | "self" | "text";
  tag?: string;
  attrs?: Record<string, string>;
  text?: string;
}

const SELF_CLOSING_TAGS = new Set(["br", "hr", "img", "input", "meta", "link"]);
const IGNORED_CONTAINERS = new Set(["script", "style", "iframe", "object", "embed"]);

const parseAttributes = (attrString: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[key] = decodeHtmlEntities(val);
  }
  return attrs;
};

const tokenizeHtml = (html: string): HtmlToken[] => {
  const sanitized = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, "");

  const tokens: HtmlToken[] = [];
  const tagRegex = /<\/?([a-zA-Z0-9-]+)([^>]*)>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(sanitized)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", text: sanitized.slice(lastIndex, match.index) });
    }
    const fullMatch = match[0];
    const tag = match[1].toLowerCase();
    const rawAttrs = match[2] || "";
    const isClosing = fullMatch.startsWith("</");
    const isSelfClosing = fullMatch.endsWith("/>") || SELF_CLOSING_TAGS.has(tag);

    if (!IGNORED_CONTAINERS.has(tag)) {
      if (isClosing) {
        tokens.push({ type: "close", tag });
      } else if (isSelfClosing) {
        tokens.push({ type: "self", tag, attrs: parseAttributes(rawAttrs) });
      } else {
        tokens.push({ type: "open", tag, attrs: parseAttributes(rawAttrs) });
      }
    }
    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < sanitized.length) {
    tokens.push({ type: "text", text: sanitized.slice(lastIndex) });
  }
  return tokens;
};

interface SimpleElement {
  tag: string;
  attrs: Record<string, string>;
  children: Array<SimpleElement | string>;
}

const buildElementTree = (tokens: HtmlToken[]): Array<SimpleElement | string> => {
  const root: SimpleElement = { tag: "root", attrs: {}, children: [] };
  const stack: SimpleElement[] = [root];

  for (const token of tokens) {
    const current = stack[stack.length - 1];
    if (token.type === "text" && token.text !== undefined) {
      current.children.push(token.text);
    } else if (token.type === "self" && token.tag) {
      current.children.push({ tag: token.tag, attrs: token.attrs || {}, children: [] });
    } else if (token.type === "open" && token.tag) {
      const el: SimpleElement = { tag: token.tag, attrs: token.attrs || {}, children: [] };
      current.children.push(el);
      stack.push(el);
    } else if (token.type === "close" && token.tag) {
      for (let i = stack.length - 1; i >= 1; i--) {
        if (stack[i].tag === token.tag) {
          stack.length = i;
          break;
        }
      }
    }
  }
  return root.children;
};

const collectInlineNodes = (nodes: Array<SimpleElement | string>, activeMarks: TiptapMark[] = []): TiptapInlineNode[] => {
  const result: TiptapInlineNode[] = [];
  for (const node of nodes) {
    if (typeof node === "string") {
      const decoded = decodeHtmlEntities(node);
      if (decoded.length > 0) {
        result.push({
          type: "text",
          text: decoded,
          ...(activeMarks.length > 0 ? { marks: [...activeMarks] } : {}),
        });
      }
      continue;
    }

    if (node.tag === "br") {
      result.push({ type: "hardBreak" });
      continue;
    }

    let nextMarks = [...activeMarks];
    if (node.tag === "strong" || node.tag === "b") nextMarks.push({ type: "bold" });
    else if (node.tag === "em" || node.tag === "i") nextMarks.push({ type: "italic" });
    else if (node.tag === "u") nextMarks.push({ type: "underline" });
    else if (node.tag === "s" || node.tag === "strike" || node.tag === "del") nextMarks.push({ type: "strike" });
    else if (node.tag === "code") nextMarks.push({ type: "code" });
    else if (node.tag === "mark") nextMarks.push({ type: "highlight" });
    else if (node.tag === "a") {
      nextMarks.push({
        type: "link",
        attrs: {
          href: sanitizeTiptapUrl(node.attrs.href),
          target: node.attrs.target || null,
          rel: node.attrs.rel || null,
        },
      });
    }

    result.push(...collectInlineNodes(node.children, nextMarks));
  }
  return result;
};

const extractRawText = (nodes: Array<SimpleElement | string>): string =>
  nodes
    .map((n) => (typeof n === "string" ? decodeHtmlEntities(n) : n.tag === "br" ? "\n" : extractRawText(n.children)))
    .join("");

const convertElementToBlocks = (el: SimpleElement): TiptapBlockNode[] => {
  if (/^h[1-6]$/.test(el.tag)) {
    const level = Number(el.tag[1]) as TiptapHeadingLevel;
    return [{ type: "heading", attrs: { level }, content: collectInlineNodes(el.children) }];
  }
  if (el.tag === "p") {
    const imgChild = el.children.find((c): c is SimpleElement => typeof c !== "string" && c.tag === "img");
    if (imgChild && el.children.length === 1) {
      return convertElementToBlocks(imgChild);
    }
    return [{ type: "paragraph", content: collectInlineNodes(el.children) }];
  }
  if (el.tag === "blockquote") {
    return [{ type: "blockquote", content: convertTreeToBlocks(el.children) }];
  }
  if (el.tag === "ul" || el.tag === "ol") {
    const items: TiptapListItemNode[] = el.children
      .filter((c): c is SimpleElement => typeof c !== "string" && c.tag === "li")
      .map((li) => {
        const hasBlockChild = li.children.some(
          (c) => typeof c !== "string" && ["p", "ul", "ol", "blockquote"].includes(c.tag)
        );
        return {
          type: "listItem",
          content: hasBlockChild
            ? convertTreeToBlocks(li.children)
            : [{ type: "paragraph", content: collectInlineNodes(li.children) }],
        };
      });
    return [{ type: el.tag === "ol" ? "orderedList" : "bulletList", content: items }];
  }
  if (el.tag === "pre") {
    const codeEl = el.children.find((c): c is SimpleElement => typeof c !== "string" && c.tag === "code");
    const classAttr = codeEl?.attrs.class || el.attrs.class || "";
    const langMatch = classAttr.match(/language-([a-zA-Z0-9_-]+)/);
    const rawCode = extractRawText(codeEl ? codeEl.children : el.children);
    return [
      {
        type: "codeBlock",
        attrs: { language: langMatch ? langMatch[1] : null },
        content: rawCode ? [{ type: "text", text: rawCode }] : [],
      },
    ];
  }
  if (el.tag === "img") {
    const src = sanitizeTiptapUrl(el.attrs.src);
    if (src === "#") return [];
    return [
      {
        type: "image",
        attrs: { src, alt: el.attrs.alt || "", title: el.attrs.title || null },
      },
    ];
  }
  if (el.tag === "hr") {
    return [{ type: "horizontalRule" }];
  }
  if (el.tag === "table") {
    const rows: TiptapTableRowNode[] = [];
    const collectRows = (children: Array<SimpleElement | string>) => {
      for (const child of children) {
        if (typeof child === "string") continue;
        if (child.tag === "tr") {
          const cells: TiptapTableCellNode[] = child.children
            .filter((c): c is SimpleElement => typeof c !== "string" && (c.tag === "td" || c.tag === "th"))
            .map((cell) => ({
              type: cell.tag === "th" ? "tableHeader" : "tableCell",
              content: [{ type: "paragraph", content: collectInlineNodes(cell.children) }],
            }));
          rows.push({ type: "tableRow", content: cells });
        } else if (["thead", "tbody", "tfoot"].includes(child.tag)) {
          collectRows(child.children);
        }
      }
    };
    collectRows(el.children);
    return [{ type: "table", content: rows }];
  }
  return convertTreeToBlocks(el.children);
};

const convertTreeToBlocks = (nodes: Array<SimpleElement | string>): TiptapBlockNode[] => {
  const blocks: TiptapBlockNode[] = [];
  for (const node of nodes) {
    if (typeof node === "string") {
      const trimmed = decodeHtmlEntities(node).trim();
      if (trimmed) {
        blocks.push({ type: "paragraph", content: [{ type: "text", text: trimmed }] });
      }
    } else {
      blocks.push(...convertElementToBlocks(node));
    }
  }
  return blocks;
};

export const parseTiptapHtml = (html: string): TiptapDocNode => {
  const tokens = tokenizeHtml(html);
  const tree = buildElementTree(tokens);
  return {
    type: "doc",
    content: convertTreeToBlocks(tree),
  };
};
