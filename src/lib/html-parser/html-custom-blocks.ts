import type {
  TiptapBlockNode,
  TiptapElementAlign,
  TiptapInformationPaneVariant,
  TiptapLayoutColumnNode,
} from "../../types";
import { collectInlineNodes, extractRawText, type SimpleElement } from "./html-inline";
import { sanitizeTiptapIframeUrl, sanitizeTiptapUrl } from "../sanitize";

export const findChildByTag = (el: SimpleElement, tag: string): SimpleElement | undefined =>
  el.children.find((c): c is SimpleElement => typeof c !== "string" && c.tag === tag);

export const convertCustomHtmlElement = (
  el: SimpleElement,
  convertTree: (nodes: Array<SimpleElement | string>) => TiptapBlockNode[]
): TiptapBlockNode[] | null => {
  const dataType = el.attrs["data-type"] || "";

  if (dataType === "page-break" || (el.tag === "hr" && el.attrs["data-page-break"])) {
    return [{ type: "pageBreak" }];
  }
  if (dataType === "table-of-contents") {
    return [{ type: "tableOfContents", attrs: { title: el.attrs["data-title"] || null } }];
  }
  if (dataType === "mathematics") {
    const latex = el.attrs["data-latex"] || extractRawText(el.children);
    return [{ type: "mathematics", attrs: { latex, displayMode: "block" } }];
  }
  if (dataType === "information-pane") {
    const variant = (el.attrs["data-variant"] || "info") as TiptapInformationPaneVariant;
    const titleEl = el.children.find(
      (c): c is SimpleElement => typeof c !== "string" && (c.attrs["data-type"] === "pane-title" || c.tag === "strong")
    );
    const title = el.attrs["data-title"] || (titleEl ? extractRawText(titleEl.children) : null);
    const rest = titleEl ? el.children.filter((c) => c !== titleEl) : el.children;
    return [{ type: "informationPane", attrs: { variant, title }, content: convertTree(rest) }];
  }
  if (dataType === "conversation-history") {
    return [
      {
        type: "conversationHistory",
        attrs: { author: el.attrs["data-author"] || null, timestamp: el.attrs["data-timestamp"] || null },
        content: convertTree(el.children),
      },
    ];
  }
  if (dataType === "layout-container") {
    const columns: TiptapLayoutColumnNode[] = el.children
      .filter((c): c is SimpleElement => typeof c !== "string" && (c.attrs["data-type"] === "layout-column" || c.tag === "div"))
      .map((col) => ({ type: "layoutColumn", content: convertTree(col.children) }));
    return [{ type: "layoutContainer", attrs: { columns: el.attrs["data-columns"] || "1:1" }, content: columns }];
  }
  if (dataType === "attachment") {
    const link = findChildByTag(el, "a") || el;
    const href = sanitizeTiptapUrl(link.attrs.href || el.attrs["data-href"]);
    if (href === "#") return [];
    return [
      {
        type: "attachment",
        attrs: {
          href,
          filename: el.attrs["data-filename"] || link.attrs.download || extractRawText(link.children) || "Attachment",
          title: el.attrs["data-title"] || link.attrs.title || null,
          size: el.attrs["data-size"] || null,
          mime: el.attrs["data-mime"] || null,
          ext: el.attrs["data-ext"] || null,
          "data-asset-id": el.attrs["data-asset-id"] || null,
          "data-document-id": el.attrs["data-document-id"] || null,
        },
      },
    ];
  }
  if (el.tag === "iframe" || dataType === "iframe-wrapper") {
    const iframeEl = el.tag === "iframe" ? el : findChildByTag(el, "iframe");
    const safeSrc = sanitizeTiptapIframeUrl(iframeEl?.attrs.src || el.attrs["data-src"]);
    if (safeSrc === "#") return [];
    return [
      {
        type: "iframe",
        attrs: {
          src: safeSrc,
          title: iframeEl?.attrs.title || el.attrs.title || null,
          width: iframeEl?.attrs.width || el.attrs.width || "100%",
          height: iframeEl?.attrs.height || el.attrs.height || 400,
          "data-align": (el.attrs["data-align"] as TiptapElementAlign) || null,
        },
      },
    ];
  }
  if (el.tag === "video" || dataType === "video") {
    const videoEl = el.tag === "video" ? el : findChildByTag(el, "video") || findChildByTag(el, "iframe");
    const src = sanitizeTiptapUrl(videoEl?.attrs.src || el.attrs["data-src"]);
    if (src === "#") return [];
    const embedType = videoEl?.tag === "iframe" || el.attrs["data-embed-type"] === "embed" ? "embed" : "file";
    const capEl = findChildByTag(el, "figcaption");
    return [
      {
        type: "video",
        attrs: {
          src,
          embedType,
          title: videoEl?.attrs.title || el.attrs.title || null,
          caption: el.attrs["data-caption"] || (capEl ? extractRawText(capEl.children) : null),
          "data-align": (el.attrs["data-align"] as TiptapElementAlign) || null,
          "data-asset-id": el.attrs["data-asset-id"] || null,
          "data-document-id": el.attrs["data-document-id"] || null,
        },
      },
    ];
  }
  if (el.tag === "audio" || dataType === "audio") {
    const audioEl = el.tag === "audio" ? el : findChildByTag(el, "audio");
    const src = sanitizeTiptapUrl(audioEl?.attrs.src || el.attrs["data-src"]);
    if (src === "#") return [];
    const capEl = findChildByTag(el, "figcaption");
    return [
      {
        type: "audio",
        attrs: {
          src,
          title: audioEl?.attrs.title || el.attrs.title || null,
          caption: el.attrs["data-caption"] || (capEl ? extractRawText(capEl.children) : null),
          "data-align": (el.attrs["data-align"] as TiptapElementAlign) || null,
          "data-asset-id": el.attrs["data-asset-id"] || null,
          "data-document-id": el.attrs["data-document-id"] || null,
        },
      },
    ];
  }
  if (el.tag === "details") {
    const summaryEl = findChildByTag(el, "summary");
    const rest = el.children.filter((c) => c !== summaryEl);
    return [
      {
        type: "details",
        attrs: { open: "open" in el.attrs && el.attrs.open !== "false" },
        content: [
          { type: "detailsSummary", content: summaryEl ? collectInlineNodes(summaryEl.children) : [] },
          { type: "detailsContent", content: convertTree(rest) },
        ],
      },
    ];
  }
  const customNodeType = el.attrs["data-tiptap-type"];
  if (customNodeType) {
    const attrs: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(el.attrs)) {
      if (k === "data-tiptap-type" || k === "class") continue;
      const propKey = k.replace(/^data-/, "").replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      attrs[propKey] = v;
    }
    return [{ type: customNodeType, attrs } as unknown as TiptapBlockNode];
  }

  return null;
};
