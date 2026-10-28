import type {
  TiptapElementAlign, TiptapHeadingLevel, TiptapHeadingTag, TiptapInlineNode,
  TiptapInternalLinkResolver, TiptapMathematicsNode, TiptapTextAlign, TiptapTextDirection, TiptapTextNode,
} from "./tiptap-inline";

export * from "./tiptap-inline";

export type TiptapBlockBaseAttrs = { textAlign?: TiptapTextAlign | null; dir?: TiptapTextDirection | null };

export type TiptapHeadingNode = {
  type: "heading";
  attrs?: TiptapBlockBaseAttrs & {
    level: TiptapHeadingLevel;
    id?: string | null;
    tag?: TiptapHeadingTag | null;
    anchorLink?: boolean | null;
  };
  content?: Array<TiptapInlineNode>;
};

export type TiptapParagraphNode = { type: "paragraph"; attrs?: TiptapBlockBaseAttrs; content?: Array<TiptapInlineNode> };
export type TiptapLeadParagraphNode = { type: "leadParagraph"; attrs?: TiptapBlockBaseAttrs; content?: Array<TiptapInlineNode> };
export type TiptapBlockquoteNode = { type: "blockquote"; attrs?: TiptapBlockBaseAttrs; content?: Array<TiptapBlockNode> };

export type TiptapInformationPaneVariant = "info" | "success" | "warning" | "danger" | "neutral" | "tip";
export type TiptapInformationPaneNode = {
  type: "informationPane";
  attrs?: { variant?: TiptapInformationPaneVariant | null; title?: string | null };
  content?: Array<TiptapBlockNode>;
};

export type TiptapConversationHistoryNode = {
  type: "conversationHistory";
  attrs?: { author?: string | null; timestamp?: string | null };
  content?: Array<TiptapBlockNode>;
};

export type TiptapDetailsSummaryNode = { type: "detailsSummary"; content?: Array<TiptapInlineNode> };
export type TiptapDetailsContentNode = { type: "detailsContent"; content?: Array<TiptapBlockNode> };
export type TiptapDetailsNode = {
  type: "details";
  attrs?: { open?: boolean | null };
  content?: Array<TiptapDetailsSummaryNode | TiptapDetailsContentNode | TiptapBlockNode>;
};

export type TiptapLayoutColumnNode = { type: "layoutColumn"; content?: Array<TiptapBlockNode> };
export type TiptapLayoutContainerNode = {
  type: "layoutContainer";
  attrs?: { columns?: string | null };
  content?: Array<TiptapLayoutColumnNode>;
};

export type TiptapListType = "ordered" | "unordered" | "task";
export type TiptapListItemNode = { type: "listItem"; content?: Array<TiptapBlockNode> };
export type TiptapTaskItemNode = {
  type: "taskItem";
  attrs?: { checked?: boolean | null };
  content?: Array<TiptapBlockNode>;
};
export type TiptapBulletListNode = {
  type: "bulletList";
  attrs?: TiptapBlockBaseAttrs & { indentLevel?: number };
  content?: Array<TiptapListItemNode>;
};
export type TiptapOrderedListNode = {
  type: "orderedList";
  attrs?: TiptapBlockBaseAttrs & { start?: number; indentLevel?: number };
  content?: Array<TiptapListItemNode>;
};
export type TiptapTaskListNode = {
  type: "taskList";
  attrs?: TiptapBlockBaseAttrs;
  content?: Array<TiptapTaskItemNode>;
};
export type TiptapListNode = TiptapBulletListNode | TiptapOrderedListNode | TiptapTaskListNode;

export type TiptapCodeBlockNode = {
  type: "codeBlock";
  attrs?: { language?: string | null; showLineNumbers?: boolean | null; copyable?: boolean | null };
  content?: Array<TiptapTextNode>;
};

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
  attrs: { src: string; title?: string | null; width?: number | string | null; height?: number | string | null; "data-align"?: TiptapElementAlign | null };
};

export type TiptapCustomBlockNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Array<TiptapBlockNode>;
};

export type TiptapTocHeadingItem = { id: string; text: string; level: TiptapHeadingLevel };
export type TiptapTableOfContentsNode = { type: "tableOfContents"; attrs?: { headings?: Array<TiptapTocHeadingItem>; title?: string | null } };
export type TiptapPageBreakNode = { type: "pageBreak" };
export type TiptapHorizontalRuleNode = { type: "horizontalRule" };

export type TiptapTableCellNode = {
  type: "tableHeader" | "tableCell";
  attrs?: { colspan?: number; rowspan?: number; colwidth?: Array<number> | null; backgroundColor?: string | null };
  content?: Array<TiptapBlockNode>;
};
export type TiptapTableRowNode = { type: "tableRow"; content?: Array<TiptapTableCellNode> };
export type TiptapTableNode = { type: "table"; content?: Array<TiptapTableRowNode> };

export type TiptapBlockNode =
  | TiptapHeadingNode | TiptapParagraphNode | TiptapLeadParagraphNode | TiptapBlockquoteNode
  | TiptapInformationPaneNode | TiptapConversationHistoryNode | TiptapDetailsNode
  | TiptapLayoutContainerNode | TiptapBulletListNode | TiptapOrderedListNode | TiptapTaskListNode
  | TiptapCodeBlockNode | TiptapImageNode | TiptapVideoNode | TiptapAudioNode | TiptapAttachmentNode
  | TiptapIframeNode | TiptapMathematicsNode | TiptapTableOfContentsNode | TiptapPageBreakNode
  | TiptapHorizontalRuleNode | TiptapTableNode;

export type TiptapDocStats = { words: number; characters: number; readingTimeMinutes: number; readingTime?: string; wordsPerMinute?: number };
export type TiptapDocNode = {
  type: "doc";
  content: Array<TiptapBlockNode>;
  words?: number;
  characters?: number;
  readingTimeMinutes?: number;
  readingTime?: string;
  stats?: TiptapDocStats;
};
export type TiptapBlockType =
  | "heading" | "paragraph" | "leadParagraph" | "quote" | "informationPane" | "conversationHistory"
  | "details" | "columns" | "list" | "taskList" | "code" | "image" | "video" | "audio"
  | "attachment" | "iframe" | "mathematics" | "tableOfContents" | "pageBreak" | "table" | "hr";
export type TiptapContentInput =
  | TiptapDocNode | { type: "doc"; content: Array<TiptapBlockNode | TiptapCustomBlockNode> }
  | Array<TiptapBlockNode | TiptapCustomBlockNode> | string | ReadonlyArray<string> | null | undefined;
export type TiptapMediaUrlResolver = (url: string) => string | null | undefined;
export type TiptapParserOptions = {
  allowedIframeDomains?: ReadonlyArray<string>;
  resolveInternalLink?: TiptapInternalLinkResolver;
  mediaBaseUrl?: string;
  resolveMediaUrl?: TiptapMediaUrlResolver;
};
