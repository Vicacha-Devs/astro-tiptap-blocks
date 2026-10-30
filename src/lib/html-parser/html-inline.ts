import type {
  TiptapBlockNode,
  TiptapInlineNode,
  TiptapMark,
  TiptapTableCellNode,
  TiptapTableRowNode,
  TiptapTextDirection,
} from "../../types";
import {
  decodeHtmlEntities,
  sanitizeCssColor,
  sanitizeCssDimension,
  sanitizeCssFontFamily,
  sanitizeTiptapUrl,
} from "../sanitize";
import { extractRawText, parseInlineStyleProps, type SimpleElement } from "./html-tokenizer";

export * from "./html-tokenizer";

export const BLOCK_CHILD_TAGS = new Set(["p", "ul", "ol", "blockquote", "pre", "table", "details"]);

const TAG_TO_MARK: Record<string, TiptapMark["type"]> = {
  strong: "bold",
  b: "bold",
  em: "italic",
  i: "italic",
  u: "underline",
  s: "strike",
  strike: "strike",
  del: "strike",
  code: "code",
  sub: "subscript",
  sup: "superscript",
};

export const collectInlineNodes = (
  nodes: Array<SimpleElement | string>,
  activeMarks: TiptapMark[] = []
): TiptapInlineNode[] => {
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
    if (node.attrs["data-type"] === "mathematics") {
      const latex = node.attrs["data-latex"] || extractRawText(node.children);
      result.push({ type: "mathematics", attrs: { latex, displayMode: "inline" } });
      continue;
    }
    if (
      node.tag === "a" &&
      (node.attrs["data-type"] === "linker" || node.attrs["data-collection"])
    ) {
      result.push({
        type: "linker",
        attrs: {
          collectionName: node.attrs["data-collection"] || null,
          documentId: node.attrs["data-document-id"] || null,
          label: node.attrs["data-label"] || extractRawText(node.children) || null,
          href: sanitizeTiptapUrl(node.attrs.href),
        },
      });
      continue;
    }

    const nextMarks = [...activeMarks];
    const styles = parseInlineStyleProps(node.attrs.style);
    const simpleMarkType = TAG_TO_MARK[node.tag];
    if (simpleMarkType) nextMarks.push({ type: simpleMarkType } as TiptapMark);
    else if (node.tag === "abbr")
      nextMarks.push({ type: "abbr", attrs: { title: node.attrs.title || null } });
    else if (node.tag === "mark") {
      const color = sanitizeCssColor(node.attrs["data-color"] || styles["background-color"]);
      nextMarks.push({ type: "highlight", ...(color ? { attrs: { color } } : {}) });
    } else if (node.tag === "a") {
      nextMarks.push({
        type: "link",
        attrs: {
          href: sanitizeTiptapUrl(node.attrs.href),
          target: node.attrs.target || null,
          rel: node.attrs.rel || null,
          title: node.attrs.title || null,
          class: node.attrs.class || null,
        },
      });
    }
    if (node.attrs.lang || node.attrs.dir) {
      nextMarks.push({
        type: "language",
        attrs: {
          lang: node.attrs.lang || null,
          dir: (node.attrs.dir as TiptapTextDirection) || null,
        },
      });
    }
    const color = sanitizeCssColor(styles.color);
    const fontFamily = sanitizeCssFontFamily(styles["font-family"]);
    const fontSize = sanitizeCssDimension(styles["font-size"]);
    const lineHeight = sanitizeCssDimension(styles["line-height"]);
    if (color || fontFamily || fontSize || lineHeight) {
      nextMarks.push({ type: "textStyle", attrs: { color, fontFamily, fontSize, lineHeight } });
    }
    result.push(...collectInlineNodes(node.children, nextMarks));
  }
  return result;
};

export const convertTableElement = (
  el: SimpleElement,
  convertTree: (nodes: Array<SimpleElement | string>) => TiptapBlockNode[]
): TiptapBlockNode[] => {
  const rows: TiptapTableRowNode[] = [];
  const collectRows = (children: Array<SimpleElement | string>) => {
    for (const child of children) {
      if (typeof child === "string") continue;
      if (child.tag === "tr") {
        const cells: TiptapTableCellNode[] = child.children
          .filter(
            (c): c is SimpleElement => typeof c !== "string" && (c.tag === "td" || c.tag === "th")
          )
          .map((cell) => {
            const styles = parseInlineStyleProps(cell.attrs.style);
            const bg = sanitizeCssColor(
              cell.attrs["data-background-color"] || styles["background-color"]
            );
            const hasBlocks = cell.children.some(
              (c) => typeof c !== "string" && BLOCK_CHILD_TAGS.has(c.tag)
            );
            return {
              type: cell.tag === "th" ? "tableHeader" : "tableCell",
              attrs: {
                ...(cell.attrs.colspan ? { colspan: Number(cell.attrs.colspan) } : {}),
                ...(cell.attrs.rowspan ? { rowspan: Number(cell.attrs.rowspan) } : {}),
                ...(bg ? { backgroundColor: bg } : {}),
              },
              content: hasBlocks
                ? convertTree(cell.children)
                : [{ type: "paragraph", content: collectInlineNodes(cell.children) }],
            };
          });
        rows.push({ type: "tableRow", content: cells });
      } else if (["thead", "tbody", "tfoot"].includes(child.tag)) collectRows(child.children);
    }
  };
  collectRows(el.children);
  return [{ type: "table", content: rows }];
};
