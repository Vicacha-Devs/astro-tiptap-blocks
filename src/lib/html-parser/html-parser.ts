import type {
  TiptapBlockNode,
  TiptapDocNode,
  TiptapElementAlign,
  TiptapHeadingLevel,
  TiptapHeadingTag,
  TiptapListItemNode,
  TiptapTaskItemNode,
  TiptapTextAlign,
  TiptapTextDirection,
} from "../../types";
import { decodeHtmlEntities, sanitizeTiptapSrcset, sanitizeTiptapUrl } from "../sanitize";
import { convertCustomHtmlElement, findChildByTag } from "./html-custom-blocks";
import {
  BLOCK_CHILD_TAGS,
  buildElementTree,
  collectInlineNodes,
  convertTableElement,
  extractRawText,
  parseInlineStyleProps,
  type SimpleElement,
  tokenizeHtml,
} from "./html-inline";

const extractBaseBlockAttrs = (el: SimpleElement) => {
  const styles = parseInlineStyleProps(el.attrs.style);
  const textAlign = (el.attrs["data-text-align"] ||
    styles["text-align"] ||
    null) as TiptapTextAlign | null;
  const dir = (el.attrs.dir || null) as TiptapTextDirection | null;
  return { ...(textAlign ? { textAlign } : {}), ...(dir ? { dir } : {}) };
};

const convertElementToBlocks = (el: SimpleElement): TiptapBlockNode[] => {
  const custom = convertCustomHtmlElement(el, convertTreeToBlocks);
  if (custom !== null) return custom;

  if (/^h[1-6]$/.test(el.tag)) {
    const level = Number(el.attrs["data-level"] || el.tag[1]) as TiptapHeadingLevel;
    const seoTag = (el.attrs["data-seo-tag"] || null) as TiptapHeadingTag | null;
    return [
      {
        type: "heading",
        attrs: {
          level,
          id: el.attrs.id || null,
          ...(seoTag ? { tag: seoTag } : {}),
          ...extractBaseBlockAttrs(el),
        },
        content: collectInlineNodes(el.children),
      },
    ];
  }
  if (el.tag === "p") {
    const imgChild = findChildByTag(el, "img");
    if (imgChild && el.children.length === 1) return convertElementToBlocks(imgChild);
    const isLead =
      el.attrs["data-lead"] === "true" || (el.attrs.class || "").includes("tiptap-lead");
    return [
      {
        type: isLead ? "leadParagraph" : "paragraph",
        attrs: extractBaseBlockAttrs(el),
        content: collectInlineNodes(el.children),
      },
    ];
  }
  if (el.tag === "blockquote") {
    return [
      {
        type: "blockquote",
        attrs: extractBaseBlockAttrs(el),
        content: convertTreeToBlocks(el.children),
      },
    ];
  }
  if (el.tag === "ul" && el.attrs["data-type"] === "taskList") {
    const items: TiptapTaskItemNode[] = el.children
      .filter((c): c is SimpleElement => typeof c !== "string" && c.tag === "li")
      .map((li) => ({
        type: "taskItem",
        attrs: { checked: li.attrs["data-checked"] === "true" },
        content: convertTreeToBlocks(
          li.children.filter((c) => typeof c === "string" || c.tag !== "label")
        ),
      }));
    return [{ type: "taskList", content: items }];
  }
  if (el.tag === "ul" || el.tag === "ol") {
    const items: TiptapListItemNode[] = el.children
      .filter((c): c is SimpleElement => typeof c !== "string" && c.tag === "li")
      .map((li) => ({
        type: "listItem",
        content: li.children.some((c) => typeof c !== "string" && BLOCK_CHILD_TAGS.has(c.tag))
          ? convertTreeToBlocks(li.children)
          : [{ type: "paragraph", content: collectInlineNodes(li.children) }],
      }));
    if (el.tag === "ol") {
      const startAttr = el.attrs.start ? Number(el.attrs.start) : undefined;
      return [
        {
          type: "orderedList",
          ...(startAttr && startAttr > 1 ? { attrs: { start: startAttr } } : {}),
          content: items,
        },
      ];
    }
    return [{ type: "bulletList", content: items }];
  }
  if (el.tag === "pre") {
    const codeEl = findChildByTag(el, "code");
    const langMatch = (codeEl?.attrs.class || el.attrs.class || "").match(
      /language-([a-zA-Z0-9_-]+)/
    );
    const rawCode = extractRawText(codeEl ? codeEl.children : el.children);
    return [
      {
        type: "codeBlock",
        attrs: { language: langMatch ? langMatch[1] : null },
        content: rawCode ? [{ type: "text", text: rawCode }] : [],
      },
    ];
  }
  if (el.tag === "figure" && findChildByTag(el, "img")) {
    const imgEl = findChildByTag(el, "img")!;
    const capEl = findChildByTag(el, "figcaption");
    return convertElementToBlocks({
      ...imgEl,
      attrs: {
        ...el.attrs,
        ...imgEl.attrs,
        ...(capEl ? { "data-caption": extractRawText(capEl.children) } : {}),
      },
    });
  }
  if (el.tag === "img") {
    const src = sanitizeTiptapUrl(el.attrs.src);
    if (src === "#") return [];
    const safeSrcset = sanitizeTiptapSrcset(el.attrs.srcset);
    return [
      {
        type: "image",
        attrs: {
          src,
          "alt": el.attrs.alt || "",
          "title": el.attrs.title || null,
          "caption": el.attrs["data-caption"] || null,
          "width": el.attrs.width || null,
          "height": el.attrs.height || null,
          ...(safeSrcset ? { srcset: safeSrcset } : {}),
          ...(el.attrs.sizes ? { sizes: el.attrs.sizes } : {}),
          "data-align": (el.attrs["data-align"] as TiptapElementAlign) || null,
          "data-asset-id": el.attrs["data-asset-id"] || null,
          "data-document-id": el.attrs["data-document-id"] || null,
        },
      },
    ];
  }
  if (el.tag === "hr") return [{ type: "horizontalRule" }];
  if (el.tag === "table") return convertTableElement(el, convertTreeToBlocks);
  return convertTreeToBlocks(el.children);
};

export const convertTreeToBlocks = (nodes: Array<SimpleElement | string>): TiptapBlockNode[] => {
  const blocks: TiptapBlockNode[] = [];
  for (const node of nodes) {
    if (typeof node === "string") {
      const trimmed = decodeHtmlEntities(node).trim();
      if (trimmed) blocks.push({ type: "paragraph", content: [{ type: "text", text: trimmed }] });
    } else {
      blocks.push(...convertElementToBlocks(node));
    }
  }
  return blocks;
};

export const parseTiptapHtml = (html: string): TiptapDocNode => ({
  type: "doc",
  content: convertTreeToBlocks(buildElementTree(tokenizeHtml(html))),
});
