import type { TiptapBlockNode } from "./tiptap";
import type {
  TiptapElementAlign,
  TiptapHeadingLevel,
  TiptapInternalLinkResolver,
  TiptapMediaUrlResolver,
} from "./tiptap-inline";

export type TiptapMediaCommonAttrs = {
  "data-align"?: TiptapElementAlign | null;
  "data-asset-id"?: string | number | null;
  "data-document-id"?: string | null;
};

export type TiptapImageNode = {
  type: "image";
  attrs: TiptapMediaCommonAttrs & {
    src: string;
    alt?: string | null;
    title?: string | null;
    caption?: string | null;
    width?: number | string | null;
    height?: number | string | null;
    srcset?: string | null;
    sizes?: string | null;
    loading?: "lazy" | "eager" | null;
    decoding?: "async" | "sync" | "auto" | null;
    fetchpriority?: "high" | "low" | "auto" | null;
  };
};

export type TiptapVideoNode = {
  type: "video";
  attrs: TiptapMediaCommonAttrs & {
    src: string;
    embedType?: "embed" | "file" | null;
    title?: string | null;
    caption?: string | null;
    width?: number | string | null;
    height?: number | string | null;
    mime?: string | null;
  };
};

export type TiptapAudioNode = {
  type: "audio";
  attrs: TiptapMediaCommonAttrs & {
    src: string;
    title?: string | null;
    caption?: string | null;
    mime?: string | null;
  };
};

export type TiptapAttachmentNode = {
  type: "attachment";
  attrs: TiptapMediaCommonAttrs & {
    href: string;
    filename?: string | null;
    title?: string | null;
    size?: number | string | null;
    mime?: string | null;
    ext?: string | null;
  };
};

export type TiptapIframeNode = {
  type: "iframe";
  attrs: {
    "src": string;
    "title"?: string | null;
    "width"?: number | string | null;
    "height"?: number | string | null;
    "data-align"?: TiptapElementAlign | null;
  };
};

export type TiptapMediaBlockAttrs = TiptapMediaCommonAttrs & {
  src?: string;
  href?: string;
  embedType?: "embed" | "file" | null;
  title?: string | null;
  caption?: string | null;
  filename?: string | null;
  size?: number | string | null;
  mime?: string | null;
  ext?: string | null;
  width?: number | string | null;
  height?: number | string | null;
};

export type TiptapCustomBlockNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Array<TiptapBlockNode>;
};

export type TiptapTocHeadingItem = { id: string; text: string; level: TiptapHeadingLevel };
export type TiptapTableOfContentsNode = {
  type: "tableOfContents";
  attrs?: { headings?: Array<TiptapTocHeadingItem>; title?: string | null };
};
export type TiptapPageBreakNode = { type: "pageBreak" };
export type TiptapHorizontalRuleNode = { type: "horizontalRule" };

export type TiptapTableCellNode = {
  type: "tableHeader" | "tableCell";
  attrs?: {
    colspan?: number;
    rowspan?: number;
    colwidth?: Array<number> | null;
    backgroundColor?: string | null;
  };
  content?: Array<TiptapBlockNode>;
};
export type TiptapTableRowNode = { type: "tableRow"; content?: Array<TiptapTableCellNode> };
export type TiptapTableNode = { type: "table"; content?: Array<TiptapTableRowNode> };

export type TiptapDocStats = {
  words: number;
  characters: number;
  readingTimeMinutes: number;
  readingTime?: string;
  wordsPerMinute?: number;
};

export type TiptapDocNode = {
  type: "doc";
  content: Array<TiptapBlockNode>;
  words?: number;
  characters?: number;
  readingTimeMinutes?: number;
  readingTime?: string;
  stats?: TiptapDocStats;
};

export type TiptapContentInput =
  | TiptapDocNode
  | { type: "doc"; content: Array<TiptapBlockNode | TiptapCustomBlockNode> }
  | Array<TiptapBlockNode | TiptapCustomBlockNode>
  | string
  | ReadonlyArray<string>
  | null
  | undefined;

export type TiptapParserOptions = {
  allowedIframeDomains?: ReadonlyArray<string>;
  resolveInternalLink?: TiptapInternalLinkResolver;
  mediaBaseUrl?: string;
  resolveMediaUrl?: TiptapMediaUrlResolver;
};

export type { TiptapMediaUrlResolver };
