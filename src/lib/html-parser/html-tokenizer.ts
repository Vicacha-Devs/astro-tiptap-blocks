import { decodeHtmlEntities } from "../sanitize";

export interface HtmlToken {
  type: "open" | "close" | "self" | "text";
  tag?: string;
  attrs?: Record<string, string>;
  text?: string;
}

export interface SimpleElement {
  tag: string;
  attrs: Record<string, string>;
  children: Array<SimpleElement | string>;
}

const SELF_CLOSING_TAGS = new Set(["br", "hr", "img", "input", "meta", "link", "source"]);
const IGNORED_CONTAINERS = new Set(["script", "style", "object", "embed"]);

const parseAttributes = (attrString: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[key] = decodeHtmlEntities(val);
  }
  return attrs;
};

export const tokenizeHtml = (html: string): HtmlToken[] => {
  const sanitized = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, "");

  const tokens: HtmlToken[] = [];
  const tagRegex = /<\/?([a-zA-Z0-9-]+)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
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
      if (isClosing) tokens.push({ type: "close", tag });
      else if (isSelfClosing) tokens.push({ type: "self", tag, attrs: parseAttributes(rawAttrs) });
      else tokens.push({ type: "open", tag, attrs: parseAttributes(rawAttrs) });
    }
    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < sanitized.length) {
    tokens.push({ type: "text", text: sanitized.slice(lastIndex) });
  }
  return tokens;
};

export const buildElementTree = (tokens: HtmlToken[]): Array<SimpleElement | string> => {
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

export const extractRawText = (nodes: Array<SimpleElement | string>): string =>
  nodes
    .map((n) =>
      typeof n === "string"
        ? decodeHtmlEntities(n)
        : n.tag === "br"
          ? "\n"
          : extractRawText(n.children)
    )
    .join("");

export const parseInlineStyleProps = (style?: string): Record<string, string> => {
  const map: Record<string, string> = {};
  if (!style) return map;
  for (const part of style.split(";")) {
    const idx = part.indexOf(":");
    if (idx > 0) map[part.slice(0, idx).trim().toLowerCase()] = part.slice(idx + 1).trim();
  }
  return map;
};
