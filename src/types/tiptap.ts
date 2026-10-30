import type {
  TiptapHeadingLevel,
  TiptapHeadingTag,
  TiptapInlineNode,
  TiptapMathematicsNode,
  TiptapTextAlign,
  TiptapTextDirection,
  TiptapTextNode,
} from "./tiptap-inline";
import type {
  TiptapAttachmentNode,
  TiptapAudioNode,
  TiptapHorizontalRuleNode,
  TiptapIframeNode,
  TiptapImageNode,
  TiptapPageBreakNode,
  TiptapTableNode,
  TiptapTableOfContentsNode,
  TiptapVideoNode,
} from "./tiptap-media";

export * from "./tiptap-inline";
export * from "./tiptap-media";

export type TiptapBlockBaseAttrs = {
  textAlign?: TiptapTextAlign | null;
  dir?: TiptapTextDirection | null;
};

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

export type TiptapParagraphNode = {
  type: "paragraph";
  attrs?: TiptapBlockBaseAttrs;
  content?: Array<TiptapInlineNode>;
};
export type TiptapLeadParagraphNode = {
  type: "leadParagraph";
  attrs?: TiptapBlockBaseAttrs;
  content?: Array<TiptapInlineNode>;
};
export type TiptapBlockquoteNode = {
  type: "blockquote";
  attrs?: TiptapBlockBaseAttrs;
  content?: Array<TiptapBlockNode>;
};

export type TiptapInformationPaneVariant =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "tip";
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

export type TiptapDetailsSummaryNode = {
  type: "detailsSummary";
  content?: Array<TiptapInlineNode>;
};
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

export type TiptapBlockNode =
  | TiptapHeadingNode
  | TiptapParagraphNode
  | TiptapLeadParagraphNode
  | TiptapBlockquoteNode
  | TiptapInformationPaneNode
  | TiptapConversationHistoryNode
  | TiptapDetailsNode
  | TiptapLayoutContainerNode
  | TiptapBulletListNode
  | TiptapOrderedListNode
  | TiptapTaskListNode
  | TiptapCodeBlockNode
  | TiptapImageNode
  | TiptapVideoNode
  | TiptapAudioNode
  | TiptapAttachmentNode
  | TiptapIframeNode
  | TiptapMathematicsNode
  | TiptapTableOfContentsNode
  | TiptapPageBreakNode
  | TiptapHorizontalRuleNode
  | TiptapTableNode;

export type TiptapBlockType =
  | "heading"
  | "paragraph"
  | "leadParagraph"
  | "quote"
  | "informationPane"
  | "conversationHistory"
  | "details"
  | "columns"
  | "list"
  | "taskList"
  | "code"
  | "image"
  | "video"
  | "audio"
  | "attachment"
  | "iframe"
  | "mathematics"
  | "tableOfContents"
  | "pageBreak"
  | "table"
  | "hr";
